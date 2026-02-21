
export function parseEpics(md) {
  const lines = md.replace(/^\uFEFF/, "").split(/\r?\n/);
  const epics = [];
  let current = null;
  let seenFirstH1 = false;

  for (const line of lines) {
    if (/^#(?!#)\s+/.test(line)) {
      if (!seenFirstH1) { seenFirstH1 = true; continue; }
      current = { title: line.replace(/^#+\s*/, "").trim(), tasks: [] };
      epics.push(current);
      continue;
    }
    if (/^##/.test(line)) { current = null; continue; }
    if (!current) continue;
    const dm = line.match(/^[-*]\s+\[x\]\s+(.+)$/i);
    if (dm) { current.tasks.push({ status: "done", text: dm[1].trim() }); continue; }
    const bm = line.match(/^[-*]\s+\[!\]\s+(.+)$/);
    if (bm) { current.tasks.push({ status: "blocked", text: bm[1].trim() }); continue; }
    const pm = line.match(/^[-*]\s+\[ \]\s+(.+)$/);
    if (pm) { current.tasks.push({ status: "pending", text: pm[1].trim() }); }
  }

  return epics;
}

export function parseBacklog(md) {
  const lines = md.replace(/^\uFEFF/, "").split(/\r?\n/);

  // Compute metrics from actual task checkboxes — source of truth
  let done = 0;
  let left = 0;
  for (const line of lines) {
    if (/^[-*]\s+\[x\]\s+/i.test(line)) done++;
    else if (/^[-*]\s+\[ \]\s+/.test(line)) left++;
  }

  const total = done + left;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  let current_task = "";
  const idx = lines.findIndex((l) => /^##\s*Current\s*$/i.test(l.trim()));
  if (idx >= 0) {
    for (let i = idx + 1; i < lines.length; i++) {
      const t = lines[i].trim();
      if (!t) continue;
      if (t.startsWith("## ")) break;
      current_task = t.replace(/^[-*]\s*/, "");
      break;
    }
  }

  return {
    metrics: { done, left, progress_percent: progress },
    current_task
  };
}
