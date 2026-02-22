# Project Tracker — Backlog

## Current
Phase 6: Mobile Responsiveness — audit and adapt dashboard for small screens

---

# PHASE 1 — Core Engine
- [x] Express server with static file serving
- [x] Project directory scanning (top-level dirs under PROJECTS_ROOT)
- [x] BACKLOG.md parser — task checkboxes → auto-computed progress metrics
- [x] README.md parser — extract title and description
- [x] Git log integration — recent commits via execFile (no shell dependency)
- [x] Consistent metrics: no hardcoded numbers, live from file

---

# PHASE 2 — UI & Design
- [x] Filterable project list (search + status filter)
- [x] Expandable epic/phase breakdown per project
- [x] Progress bar with gradient fill
- [x] Dark theme — slate-900/800/700 + blue-400 palette
- [x] Consistent 13px typography system
- [x] Recent commits panel in expanded row
- [x] Standalone repo — tracked as its own product
- [x] Auto-refresh (polling every N seconds)

---

# PHASE 3 — Product Polish
- [x] Deploy as standalone web service — Dockerfile, render.yaml, npm start
- [x] GitHub integration (open PR / issue counts) — auto-detect git remote, /api/github-stats, live badges in title cell
- [x] Configure PROJECTS_ROOT via UI
- [x] Export project summary to markdown

---

# PHASE 4 — Dashboard & Integrations
- [x] Project health dashboard — summary bar: total projects, tasks done/total, overall % progress bar, by-status breakdown, latest activity strip
- [x] Clickable commit hashes — link to GitHub commit URL when remote is detected
- [x] ghCache cleared on full reload — no stale GitHub stats after manual refresh
- [x] Export MD includes GitHub repo URL per project

---

# PHASE 5 — Static Deploy & CI
- [x] build-static.js — self-contained output/index.html with fetch shim (GitHub API disabled in static mode)
- [x] npm run export / export:push — local snapshot workflow
- [x] vercel.json — outputDirectory: output (Vercel-ready)
- [ ] GitHub Actions workflow — checkout all tracked repos, build snapshot, deploy to GitHub Pages on every push to main
- [ ] Enable GitHub Pages on repo (Settings → Pages → GitHub Actions source)

---

# PHASE 6 — Mobile Responsiveness
- [x] Audit current layout — identify columns/panels that break below 640px
- [x] Responsive summary bar — stack metrics vertically on small screens (flex-wrap already present)
- [x] Responsive project list — full-width rows, hide secondary columns on mobile (Done/Left/Desc hidden via nth-child)
- [x] Touch-friendly expand/collapse for project rows — larger tap targets (td padding retained)
- [x] Responsive epic breakdown panel — readable on narrow viewports (flex-direction: column + word-break)
- [x] Responsive search and filter controls — stack/wrap on mobile (controls flex-wrap in media query)
- [ ] Cross-device QA — Chrome DevTools + real device check
