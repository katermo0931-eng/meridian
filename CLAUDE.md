# Meridian — Claude Instructions

## What this is

**Meridian** is a cross-project development dashboard building out into the **ZPI** intelligence layer.

- **Core (Meridian)**: Scans projects, reads BACKLOG.md + README.md, auto-computes progress from checkboxes, pulls git history and GitHub stats, displays health summary and phase breakdowns
- **Layer 2 (ZPI)**: Add intelligence on top — project health scoring, momentum detection, lifecycle stage, prioritization guidance, and Drift compatibility
- **Repository**: All in same repo (do NOT create separate repo)
- **Live**: https://katermo0931-eng.github.io/meridian/
- **Local**: http://localhost:4319

## Architecture
- `server.js` — Express server, routes, static serving
- `scan.js` — scans PROJECTS_ROOT, reads BACKLOG.md + README.md per project
- `parseBacklog.js` — parses `- [x]` / `- [ ]` checkboxes into progress metrics
- `parseReadme.js` — extracts title and description from README.md
- `public/` — frontend (index.html, CSS, JS) — all vanilla, no build step

## Key conventions
- PROJECTS_ROOT defaults to `../` (parent of cwd) — sees sibling repos
- Never use `exec()` — always `execFile()` (cmd.exe ENOENT on this machine)
- Never use pipes `|` in shell format strings — use `\x1f` as field delimiter
- Git log loaded per project via `execFile('git', ...)` directly
- Metrics are always auto-computed from checkboxes — no hardcoded numbers

## Restart requirements
- CSS/JS/HTML changes (`public/`): browser refresh only
- Any server-side change (`server.js`, `scan.js`, `parseBacklog.js`, `parseReadme.js`): `npx kill-port 4319 && node --env-file=.env /c/Users/Hola/project-tracker/server.js &`

## Design system
Matches Interactive CV palette: slate-900/800/700 background, blue-400 accent, 13px base font.

## ZPI — Next Layer (Planning)

**3-Layer Architecture**:
```
Layer 2: Intelligence     ← ZPI (in progress) — health scoring, momentum, lifecycle, prioritization
Layer 1: Structure        ← project metadata, phases, metrics aggregation
Layer 0: Sensing          ← Meridian today — filesystem scan, git log, GitHub API
```

**ZPI Components** (under design):
- Project health evaluation (velocity, stability, momentum)
- Lifecycle stage detection (conception → active → maintenance → sunset)
- Prioritization scoring (urgency, momentum, complexity, dependencies)
- Drift compatibility layer for cross-project structures
- Scoring model integrations back into Meridian UI

**Key Context Files**:
- `context/product-vision.md` — strategic direction
- `context/architecture.md` — system design
- `context/terminology.md` — shared terms
- `specs/zpi-overview.md` — feature scope
- `specs/drift-integration.md` — Drift patterns
- `specs/scoring-model.md` — scoring algorithms

## Design system
Matches Interactive CV palette: slate-900/800/700 background, blue-400 accent, 13px base font.

## Deploy rule
After completing any implementation task: verify it works locally first, then commit the relevant files and push to main. Never push untested changes. When changes also affect Interactive CV, push that repo too — pushing Interactive CV to main triggers immediate Vercel live deploy.

## Backlog hygiene
- When a new task is agreed: add `- [ ] description` to `.claude/BACKLOG.md` under the right phase before starting work
- When a task is completed: change `[ ]` → `[x]` in BACKLOG.md immediately after the implementation is done
- Update `## Current` at the top to reflect the active phase
- Mirror the change in `C:\Users\Hola\Interactive-CV\.claude\BACKLOG.md` if it applies there too

## What NOT to do
- Don't add a build system or bundler — keep it vanilla
- Don't hardcode progress numbers anywhere
- Don't add a database — file-based scanning is intentional
- **Don't create a separate repo for ZPI** — keep it all in Meridian project
- **Don't inherit from AccessMap** — ZPI is native to Meridian
