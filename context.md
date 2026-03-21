# Meridian — Session Context

## Project
Standalone project-tracker dashboard for Ekaterina's dev projects.
Local: http://localhost:4319
Live (static snapshot): https://katermo0931-eng.github.io/meridian/
Stack: Node.js · Express · Vanilla JS/CSS/HTML (no build step)

## Current Phase
**Phase 7 — Product Identity & PM Insights** (complete — all tasks done)
Next: no active phase defined. Add tasks to `.claude/BACKLOG.md` when new work is agreed.

## Last Session
- Phase 7 fully complete: Meridian branding, Ideas tab, idea count badge, complexity column

## Architecture
- `server.js` — Express server, routes, static serving
- `scan.js` — scans PROJECTS_ROOT, reads BACKLOG.md + README.md per project
- `parseBacklog.js` — parses `- [x]` / `- [ ]` checkboxes into progress metrics
- `parseReadme.js` — extracts title + description from README.md
- `public/` — frontend (index.html, CSS, JS) — vanilla, no bundler

## Key Decisions
- PROJECTS_ROOT = `../` (parent of cwd) — sees sibling repos as projects
- No build system — keep it vanilla; no bundler, no framework
- File-based scanning — no database
- GitHub Pages for static deploy (Vercel retired)

## Open Questions
- None currently — Phase 7 is done. Awaiting next feature decision.

## Watch Out For
- `exec()` fails on this machine — always use `execFile()`
- Pipes `|` in shell format strings → use `\x1f` as field delimiter
- Restart required for any server-side change (`server.js`, `scan.js`, `parseBacklog.js`, `parseReadme.js`):
  `npx kill-port 4319 && node /c/Users/Hola/project-tracker/server.js &`
- CSS/JS/HTML changes in `public/` → browser refresh only (no restart)

## Key Files
- `server.js` — Express server + all routes
- `scan.js` — project scanning logic
- `parseBacklog.js` — checkbox parser
- `public/index.html` — entire frontend
- `.claude/BACKLOG.md` — full backlog by phase
- `scripts/build-static.js` — GitHub Pages snapshot builder
- `.github/workflows/snapshot.yml` — CI deploy to GitHub Pages

## Deploy Flow
1. Make changes, test locally at http://localhost:4319
2. Commit and push to main
3. GitHub Actions auto-builds and deploys to Pages — no manual step needed
4. Do NOT use `vercel --prod` for this repo

## Update This File
Keep this file current after every session.
Update "Last Session" and "Open Questions" before closing out.
