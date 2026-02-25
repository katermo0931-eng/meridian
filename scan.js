import fs from "fs/promises";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { parseBacklog, parseEpics } from "./parseBacklog.js";
import { parseReadme } from "./parseReadme.js";

const execFileAsync = promisify(execFile);

function parseGitHubRepo(remoteUrl) {
  // https://github.com/owner/repo.git  or  git@github.com:owner/repo.git
  const m =
    remoteUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)(?:\.git)?$/) ||
    remoteUrl.match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?$/);
  if (!m) return null;
  return { owner: m[1], repo: m[2] };
}

async function getGitHubRepo(projectDir) {
  try {
    const { stdout } = await execFileAsync(
      "git",
      ["remote", "get-url", "origin"],
      { cwd: projectDir, timeout: 3000 }
    );
    return parseGitHubRepo(stdout.trim());
  } catch {
    return null;
  }
}

// Use \x1f (unit separator) — safe with execFile, never appears in commit messages
function normalizeTaskText(text) {
  return text
    .replace(/\[est:[^\]]+\]/gi, '')
    .replace(/\[actual:[^\]]+\]/gi, '')
    .trim()
    .toLowerCase();
}

// Parse git diff output to find when tasks were added as [ ] or [x]
async function getTaskTimings(projectDir) {
  const backlogRelPaths = ['.claude/BACKLOG.md', 'content/BACKLOG.md'];
  let backlogRelPath = null;
  for (const rp of backlogRelPaths) {
    if (await exists(path.join(projectDir, rp))) { backlogRelPath = rp; break; }
  }
  if (!backlogRelPath) return {};

  try {
    const { stdout } = await execFileAsync(
      'git',
      ['log', '--format=COMMIT\x1f%H\x1f%aI', '-p', '--follow', '--', backlogRelPath],
      { cwd: projectDir, timeout: 10000, maxBuffer: 5 * 1024 * 1024 }
    );

    const timings = {};
    let currentTimestamp = null;

    for (const line of stdout.split('\n')) {
      if (line.startsWith('COMMIT\x1f')) {
        const parts = line.split('\x1f');
        currentTimestamp = parts[2]?.trim() || null;
        continue;
      }
      if (!currentTimestamp) continue;
      if (!line.startsWith('+') || line.startsWith('+++')) continue;

      const content = line.slice(1);
      const pendingMatch = content.match(/^[\s]*[-*]\s+\[ \]\s+(.+)$/);
      const doneMatch    = content.match(/^[\s]*[-*]\s+\[x\]\s+(.+)$/i);

      if (pendingMatch) {
        const key = normalizeTaskText(pendingMatch[1]);
        if (!timings[key]) timings[key] = {};
        // git log is newest-first: keep overwriting → last write = oldest commit = when task was created
        timings[key].started_at = currentTimestamp;
      } else if (doneMatch) {
        const key = normalizeTaskText(doneMatch[1]);
        if (!timings[key]) timings[key] = {};
        // Set only if not already set → first seen in newest-first log = most recent completion
        if (!timings[key].completed_at) timings[key].completed_at = currentTimestamp;
      }
    }

    for (const v of Object.values(timings)) {
      if (v.started_at && v.completed_at) {
        v.elapsed_hours = Math.round(Math.abs(new Date(v.completed_at) - new Date(v.started_at)) / 3600000);
      } else {
        v.elapsed_hours = null;
      }
    }

    return timings;
  } catch {
    return {};
  }
}

async function getGitLog(projectDir) {
  try {
    const { stdout } = await execFileAsync(
      "git",
      ["log", "-20", "--format=%h\x1f%as\x1f%s"],
      { cwd: projectDir, timeout: 5000 }
    );
    return stdout.trim().split("\n").filter(Boolean).map(line => {
      const parts = line.split("\x1f");
      return {
        hash: parts[0]?.trim() ?? "",
        date: parts[1]?.trim() ?? "",
        subject: parts[2]?.trim() ?? ""
      };
    });
  } catch {
    return [];
  }
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function readText(p) {
  return fs.readFile(p, "utf-8");
}

async function getTopLevelDirs(root) {
  const entries = await fs.readdir(root, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory())
    .map((e) => path.join(root, e.name));
}

function pickFrameworkFiles(projectDir) {
  const candidates = [
    { kind: "backlog", p: path.join(projectDir, ".claude", "BACKLOG.md") },
    { kind: "snapshot", p: path.join(projectDir, ".claude", "SNAPSHOT.md") },
    { kind: "backlog", p: path.join(projectDir, "content", "BACKLOG.md") },
    { kind: "snapshot", p: path.join(projectDir, "content", "SNAPSHOT.md") }
  ];
  const readme = path.join(projectDir, "README.md");
  return { candidates, readme };
}

export async function scanProjects(root) {
  const dirs = await getTopLevelDirs(root);

  const results = [];
  for (const dir of dirs) {
    const name = path.basename(dir);

    const { candidates, readme } = pickFrameworkFiles(dir);
    const backlogPath = candidates.find((c) => c.kind === "backlog")?.p;
    const snapshotPath = candidates.find((c) => c.kind === "snapshot")?.p;

    const hasBacklog = backlogPath ? await exists(backlogPath) : false;
    const hasSnapshot = snapshotPath ? await exists(snapshotPath) : false;
    const hasReadme = await exists(readme);

    const isProject = hasBacklog || hasSnapshot || hasReadme;
    if (!isProject) continue;

    const missing = [];
    if (!hasBacklog) missing.push(".claude/BACKLOG.md (or content/BACKLOG.md)");
    if (!hasSnapshot) missing.push(".claude/SNAPSHOT.md (or content/SNAPSHOT.md)");
    if (!hasReadme) missing.push("README.md");

    let metrics = null;
    let current_task = "";
    let epics = [];
    if (hasBacklog) {
      const txt = await readText(backlogPath);
      const parsed = parseBacklog(txt);
      metrics = parsed.metrics;
      current_task = parsed.current_task;
      epics = parseEpics(txt);
    }

    let title = name;
    let description = "";
    if (hasReadme) {
      const txt = await readText(readme);
      const parsed = parseReadme(txt);
      title = parsed.title || title;
      description = parsed.description || "";
    }

    const hasBlockers = epics.some((ep) => ep.tasks.some((t) => t.status === "blocked"));
    const hasOpenTasks = metrics ? metrics.left > 0 : false;
    const status = hasBlockers      ? "blocked"
                 : missing.length > 0 ? "needs work"
                 : hasOpenTasks       ? "in progress"
                 : "complete";

    const timings = await getTaskTimings(dir);
    for (const epic of epics) {
      for (const task of epic.tasks) {
        const t = timings[normalizeTaskText(task.text)];
        if (t) {
          task.started_at    = t.started_at    || null;
          task.completed_at  = t.completed_at  || null;
          task.elapsed_hours = t.elapsed_hours ?? null;
        }
      }
    }

    const recent_commits = await getGitLog(dir);
    const github_repo = await getGitHubRepo(dir);

    results.push({
      id: name,
      folder: dir,
      status,
      metrics,
      current_task,
      title,
      description,
      missing_files: missing,
      epics,
      recent_commits,
      github_repo
    });
  }

  const priority = { blocked: 0, "needs work": 1, "in progress": 2, complete: 3 };
  results.sort((a, b) => {
    const prA = priority[a.status] ?? 1;
    const prB = priority[b.status] ?? 1;
    if (prA !== prB) return prA - prB;
    return a.title.localeCompare(b.title);
  });

  return results;
}
