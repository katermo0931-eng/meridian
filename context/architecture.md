# Meridian — System Architecture

## Overview

```
┌─────────────────────────────────────────────────────────┐
│  Layer 2: Intelligence (ZPI)                            │
│  ├─ Health Scoring Engine                               │
│  ├─ Lifecycle Stage Detector                            │
│  ├─ Prioritization Ranker                               │
│  ├─ Drift Pattern Recognizer                            │
│  └─ Anomaly Detector                                    │
└────────────┬──────────────────────────────────────────┘
             │
┌────────────▼──────────────────────────────────────────┐
│  Layer 1: Structure (Queryable Project Model)         │
│  ├─ Project Metadata (title, desc, readme)            │
│  ├─ Phase Breakdown (phases, epics, tasks)            │
│  ├─ Progress Metrics (%, counts, status breakdown)    │
│  ├─ Activity Timeline (git commits, dates)            │
│  └─ GitHub Stats (PR count, issue count, stars)       │
└────────────┬──────────────────────────────────────────┘
             │
┌────────────▼──────────────────────────────────────────┐
│  Layer 0: Sensing (Raw Data Collection)               │
│  ├─ Filesystem Scanner (project detection)            │
│  ├─ File Parsers (BACKLOG.md, README.md)              │
│  ├─ Git Integrator (commit history via execFile)      │
│  └─ GitHub API Client (REST API calls)                │
└────────────┬──────────────────────────────────────────┘
             │
         [Projects]
```

## Layer 0: Sensing (Current)

### Filesystem Scanner (`scan.js`)
**Task**: Detect and enumerate projects from filesystem.

**Input**: 
- `PROJECTS_ROOT` (env var, default: `../`)
- Optional `EXTRA_PROJECTS` (custom dirs)

**Output**: Array of project objects with paths

**Key Files**:
- `scan.js` → `scanProjects(root)` — directory traversal
- Looks for `BACKLOG.md` + `README.md` as project markers

**Conventions**:
- Projects are directories containing `.git` + `README.md` + `.claude/BACKLOG.md`
- Sibling repos under `../` scanned by default
- Custom projects via `EXTRA_PROJECTS` env var

### File Parsers

#### BACKLOG Parser (`parseBacklog.js`)
**Input**: Raw BACKLOG.md content
**Output**: Structured phases, epics, tasks, progress

```
- Phase (H1: "# PHASE N — Name")
  - Epic (H2: "## Epic Name")
    - Task: "- [x] Task text" or "- [ ] Task text"
```

**Computes**:
- `complete`: count of `[x]` items
- `total`: count of all items
- `progress_pct`: (complete / total) * 100
- `by_status`: breakdown of complete vs incomplete

**Rule**: Progress is ALWAYS auto-computed. Never hardcode.

#### README Parser (`parseReadme.md`)
**Input**: Raw README.md content
**Output**: title, description

**Rules**:
- Title = first `# Heading` line
- Description = first paragraph (first paragraph after heading)

### Git Integrator (`scan.js` → `getGitLog()`)
**Method**: `execFile('git', ['log', ...])` — no shell, no pipes

**Output**: Array of last 20 commits

```javascript
{
  hash: "a1b2c3d",
  date: "2024-03-15",
  subject: "feat: add health scoring"
}
```

**Why execFile**: 
- Avoids cmd.exe ENOENT errors on Windows
- No shell injection risk
- Timeout control built-in

**Field Delimiter**: Uses `\x1f` (ASCII 31) instead of pipes to avoid shell parsing

### GitHub API Client (`server.js` → `/api/github-stats`)
**Endpoint**: GET `/api/github-stats?owner=X&repo=Y`

**Output**:
```json
{
  "owner": "katermo0931-eng",
  "repo": "meridian",
  "open_prs": 3,
  "open_issues": 5,
  "stars": 42,
  "html_url": "https://github.com/..."
}
```

**Auth**: Uses `GITHUB_TOKEN` env var if provided (optional)

**Compute**:
- `open_prs`: Current open pull requests
- `open_issues`: `open_issues_count` - PRs (GitHub counts PRs as issues)
- `stars`: Repository stargazers count

## Layer 1: Structure (Current + Foundation for ZPI)

### Project Model
```javascript
{
  name: "project-name",
  path: "/abs/path/to/project",
  readme: { title: "...", description: "..." },
  phases: [
    {
      name: "PHASE 1 — Core",
      epics: [
        {
          name: "Epic Name",
          tasks: [...],
          complete: 5,
          total: 8,
          progress_pct: 62.5
        }
      ]
    }
  ],
  git_log: [...],
  github: { owner, repo, open_prs, open_issues, stars },
  overall_progress_pct: 65,
  status: "active" | "done" | "planned" | "maintenance"
}
```

### API Endpoints

#### `GET /api/projects`
Returns all scanned projects with full structure.

**Query params**:
- `root` (optional): Override PROJECTS_ROOT

**Response**:
```json
{
  "root": "/path/to/projects",
  "scanned_at": "2024-03-15T10:30:00Z",
  "projects": [...]
}
```

#### `GET /api/github-stats`
Returns GitHub stats for a single repo.

#### `GET /api/ideas`
Returns ideas from `~/.claude/IDEAS.md` with idea count.

### Frontend (`public/`)
**Vanilla JS — no framework**

**UI Sections**:
- Projects tab — filterable list, expandable rows
- Ideas tab — inbox from IDEAS.md
- Health dashboard — summary stats
- Search + status filter
- Export to markdown

**Data Flow**:
1. Load on page open (immediate)
2. Poll `/api/projects` every N seconds (auto-refresh)
3. Render table with expandable rows
4. Click to expand → show phase details, recent commits

## Layer 2: Intelligence (ZPI — Design Phase)

### Health Scoring Engine
**Input**: Project metrics (velocity, commit frequency, phase progress)
**Output**: Health score (0-100) + score breakdown

**Scoring Model** (detailed in `specs/scoring-model.md`):
- Velocity factor: recent commit frequency vs historical baseline
- Stability factor: commit consistency (no long gaps)
- Progress factor: phase completion percentage
- Momentum factor: acceleration trend (commits last week vs last month)

### Lifecycle Stage Detector
**Input**: Project history + phase progress
**Output**: Stage ∈ {conception, active, maintenance, sunset}

**Heuristics**:
- **Conception**: No commits yet, 0% progress on first phase
- **Active**: ≥1 commit/week, active phases in progress
- **Maintenance**: <1 commit/month, >80% of phases complete
- **Sunset**: No commits for >3 months, or archived marker in README

### Prioritization Ranker
**Input**: All projects with health scores + lifecycle stages
**Output**: Ranked list with urgency/momentum/complexity scores

**Factors**:
- Urgency: Phase progress, blocked issues, open PRs
- Momentum: Velocity trend (accelerating vs decelerating)
- Complexity: Estimated from task count, phase count
- Strategic importance: User-defined weights (future)

### Drift Pattern Recognizer
**Input**: Project structure + metadata files
**Output**: Recognized Drift patterns + compatibility score

**Patterns** (to be defined):
- Standard project layout (src/, tests/, docs/)
- Custom metadata files (drift.yaml, project.json, etc.)
- Cross-project dependencies
- Team ownership markers

### Anomaly Detector
**Input**: Historical metrics per project + current metrics
**Output**: Anomalies (e.g., velocity drop, stalled project)

**Examples**:
- Velocity dropped >50% week-over-week
- No commits in last 2 weeks (usually active)
- Phase stuck at <30% for >2 weeks
- Sudden spike in open issues/PRs

## Data Flow: Sensing → Structure → Intelligence

```
1. Filesystem Scanner
   └─> Enumerate projects from disk

2. File Parsers
   ├─> BACKLOG.md → phases, progress metrics
   └─> README.md → title, description

3. Git + GitHub Integrators
   ├─> Git log → commit history
   └─> GitHub API → PR/issue counts, stars

4. Structure Layer (API)
   └─> /api/projects returns complete project model

5. Frontend (Layer 1 UI)
   ├─> Render projects with progress bars
   ├─> Filter, search, expand phases
   └─> Export to markdown

6. ZPI Layer (Layer 2 — Coming)
   ├─> Health Scoring Engine
   ├─> Lifecycle Detector
   ├─> Prioritization Ranker
   ├─> Drift Recognizer
   └─> Anomaly Detector

7. Frontend (ZPI UI — Coming)
   ├─> Health scores per project
   ├─> Lifecycle badges
   ├─> Prioritization ranking (top 3 urgent)
   ├─> Momentum trends
   └─> Anomaly alerts
```

## Technology Choices

### Why Express?
- Lightweight, no framework overhead
- Sufficient for static file serving + simple API routes
- Easy to understand and modify

### Why Vanilla JS + CSS?
- No build step needed
- Simple, readable code
- Easy to iterate on frontend without restarts
- No dependency management complexity

### Why `execFile` (not `exec`)?
- No shell spawning → no ENOENT errors on Windows
- No shell injection risk
- Timeout control
- Direct process invocation

### Why File-Based Sensing?
- No database to manage
- Works on any filesystem with git repos
- Easy to audit (read BACKLOG.md directly)
- Extensible to other file formats later

## Extensibility Points

### Adding New Scoring Factors
1. Add factor function to health scoring engine
2. Compute factor value per project
3. Combine with existing factors (weighted sum)
4. Return updated health score

### Adding New Project File Parsers
1. Add parser function (input: file content, output: structured data)
2. Call from `scan.js` during project enumeration
3. Include in project model
4. Surface in UI as needed

### Adding Custom Metrics
1. Define metric computation (per-project or aggregated)
2. Expose via new API endpoint
3. Render in UI or export to markdown

### Drift Integration
1. Detect Drift markers in project filesystem
2. Parse Drift metadata files
3. Extract standardized fields (owner, dependencies, etc.)
4. Use in ZPI scoring (e.g., blocked by other projects)
