# Meridian Product Vision

## Mission

**Meridian** is a cross-project development sensing and intelligence system that turns silent project activity into actionable insights.

Transform raw project data (filesystem, git, GitHub) into:
1. Always-current project dashboard (Layer 0: Sensing)
2. Structured project metadata (Layer 1: Structure)
3. Intelligent prioritization guidance (Layer 2: Intelligence via ZPI)

## Current Reality

Today, project status is trapped in:
- Scattered BACKLOG.md files (no aggregation)
- Git commit history (noise-to-signal problem)
- GitHub issue/PR counts (no context)
- Personal notes and IDEAS.md (disconnected)

**Developers lose time** context-switching between projects, estimating urgency, and surfacing blocked work.

## Vision: Three Layers

### Layer 0 — Sensing (Meridian Core — Complete)
**Auto-detect real development activity without intrusion**
- Parse filesystem for projects (sibling repos, custom dirs)
- Read structured files (BACKLOG.md, README.md)
- Pull live git history (recent commits, author activity)
- Fetch GitHub stats (PR count, issue count, star count)
- Aggregate into unified dashboard

**Why this matters**: No manual updates. No database. File-based scanning means Meridian works on ANY project structure that follows basic conventions (BACKLOG.md + README.md).

### Layer 1 — Structure (Foundation)
**Organize sensed data into coherent project views**
- Phase breakdown (phases parsed from BACKLOG.md)
- Task metrics (progress %, complete/incomplete counts)
- Health summary (overall %, by-status breakdown)
- Activity timeline (recent commits per project)
- Export to markdown

**Why this matters**: Sensed data becomes queryable structure. Enables filtering, sorting, and aggregation across all projects.

### Layer 2 — Intelligence (ZPI — Next)
**Evaluate and prioritize projects intelligently**
- **Health Scoring**: Evaluate project stability (velocity, commit frequency, recency)
- **Momentum Detection**: Identify accelerating vs. decelerating projects
- **Lifecycle Staging**: Classify projects into phases (conception, active, maintenance, sunset)
- **Prioritization Guidance**: Rank projects by urgency, momentum, and strategic importance
- **Drift Compatibility**: Recognize cross-project dependencies and hybrid structures
- **Pattern Detection**: Surface anomalies (stalled projects, sudden velocity drops, etc.)

**Why this matters**: Transforms Meridian from a dashboard into a decision-making tool. Helps developers and PMs allocate time and resources intelligently.

## Strategic Goals

### 1. Zero Friction
- No manual project registration
- Auto-detect from filesystem
- No duplicate data entry
- Live metrics (always current)

### 2. Opinionated Structure
- BACKLOG.md as the canonical task format
- Phase breakdown (phases, epics, tasks)
- Checkbox-driven progress (no external CI needed)
- GitHub integration optional but encouraged

### 3. Extensible Intelligence
- Scoring models pluggable (swap out algorithms)
- Drift patterns can be added incrementally
- Custom metrics per project type (soon)
- Analytics engine on top (future)

### 4. Developer-Friendly
- Vanilla stack (no build, no complex config)
- Runs locally (no server login)
- Export to markdown (integrate into wikis, README, etc.)
- Works offline with cached data (future)

## Drift Compatibility

**Drift** is a sibling concept: standardized project metadata patterns for cross-project tooling.

Meridian will eventually recognize Drift-compatible structures:
- Standardized metadata file (`drift.yaml` or similar)
- Dependency graphs
- Cross-project milestones
- Team/ownership metadata

ZPI's prioritization model will factor Drift patterns into decision-making.

## Success Metrics

### Immediate (Layer 0 → Layer 1)
- [ ] Dashboard scans ≥5 projects without manual config
- [ ] Phase breakdown shows correct progress % per project
- [ ] GitHub stats load and update live (within 60s)
- [ ] Export to markdown works for all projects

### Near-term (ZPI Sprint 0)
- [ ] Health score calculated per project (velocity-based)
- [ ] Lifecycle stage detected (conception/active/maintenance/sunset)
- [ ] Prioritization ranking shows top 3 urgent projects
- [ ] Drift detection recognizes custom project structures

### Medium-term (ZPI Roadmap)
- [ ] Team/ownership assignment in health scoring
- [ ] Dependency graph between projects
- [ ] Momentum trend visualization
- [ ] Anomaly detection alerts (stalled projects, etc.)

## Non-Goals

- **Not a replacement for GitHub/GitLab UI** — Meridian aggregates, not competes
- **Not a project management tool** — No task creation, assignment, or workflow enforcement (BACKLOG.md is the source)
- **Not a CI/CD system** — Uses existing git/GitHub data, not build results
- **Not a team collaboration tool** — Single-user or small team context (no user auth, no teams)

## Timeline

- **Phase 0** (Current): ZPI Product Definition & Architecture
- **Phase 1** (Sprint 0): Health Scoring Foundation
- **Phase 2** (Sprint 1): Lifecycle & Prioritization
- **Phase 3** (Sprint 2): Drift Integration & Pattern Detection
- **Phase 4+** (Future): Analytics, Alerts, Team Features
