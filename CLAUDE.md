# Project Tracker — Claude Instructions

## What this is
A standalone local web dashboard (Node/Express, vanilla JS) that scans sibling project repos
and displays progress, git history, and phase breakdowns. Runs at http://localhost:4319.

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
- CSS/JS changes: browser refresh only
- `server.js` or `scan.js` changes: `npx kill-port 4319 && node server.js`

## Design system
Matches Interactive CV palette: slate-900/800/700 background, blue-400 accent, 13px base font.

## Deploy rule
After completing any implementation task: commit the relevant files and push to main. Never leave completed work uncommitted. When changes also affect Interactive CV, push that repo too.

## What NOT to do
- Don't add a build system or bundler — keep it vanilla
- Don't hardcode progress numbers anywhere
- Don't add a database — file-based scanning is intentional
