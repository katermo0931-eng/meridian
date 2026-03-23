# Meridian — Terminology

Shared vocabulary across Meridian, ZPI, and Drift contexts.

## Core Concepts

### Project
A development repository with structured metadata (README.md, BACKLOG.md, git history).

**Marked by**:
- `.git` directory (git repository)
- `README.md` (project metadata)
- `.claude/BACKLOG.md` (task tracking)

**Scanned from**: `PROJECTS_ROOT` (filesystem) or `EXTRA_PROJECTS` (custom dirs)

### Layer
Architectural level implementing a specific concern.

- **Layer 0 (Sensing)**: Raw data collection (filesystem, git, GitHub API)
- **Layer 1 (Structure)**: Organized metadata (project model, API)
- **Layer 2 (Intelligence)**: Evaluation & prioritization (ZPI)

### Sensing
Automatic collection of project activity data without manual intervention.

**Sources**:
- Filesystem (project detection, file reading)
- Git repository (commit history, author activity)
- GitHub API (PR count, issue count, repository stats)

**Output**: Raw project data (phases, tasks, commits, stats)

### Structure
Organized, queryable project representation built from sensed data.

**Components**:
- Project metadata (title, description, repository URL)
- Phase breakdown (phases, epics, tasks)
- Progress metrics (%, counts, status breakdown)
- Activity timeline (commits, dates)
- GitHub stats (PR count, issue count, stars)

**Access**: Via API (`/api/projects`)

### Intelligence (ZPI)
Evaluation and decision-making layer on top of Structure.

**Provides**:
- Health scores (project stability, velocity, momentum)
- Lifecycle stage detection (conception, active, maintenance, sunset)
- Prioritization guidance (urgency ranking, strategic importance)
- Anomaly detection (stalled projects, velocity drops)
- Trend analysis (accelerating vs decelerating)

---

## Project Metadata

### Phase
Logical grouping of related work within a project.

**Format** (BACKLOG.md):
```
# PHASE N — Phase Name
- [ ] Task 1
- [x] Task 2
```

**Computed**:
- Phase name from heading
- Progress: (complete tasks) / (total tasks) * 100

### Epic
Logical grouping of related tasks within a phase.

**Format** (BACKLOG.md):
```
## Epic Name
- [ ] Task 1
- [x] Task 2
```

**Computed**:
- Epic name from heading
- Progress: (complete tasks) / (total tasks) * 100

### Task
Individual unit of work (a checkbox in BACKLOG.md).

**Format**:
- `- [x] Task text` — complete
- `- [ ] Task text` — incomplete

**Computed**:
- Status: complete or incomplete
- Text: task description

### Progress
Percentage of completed phase/epic/project (0-100).

**Computed**:
```
progress_pct = (complete_tasks / total_tasks) * 100
```

**Never hardcoded** — always computed from checkbox state.

---

## Health & Evaluation

### Health Score
Numeric evaluation of project stability and momentum (0-100).

**Factors**:
- Velocity (commit frequency baseline)
- Stability (consistency of commits, no gaps)
- Progress (phase completion %)
- Momentum (trend: accelerating vs decelerating)

**Output**: Single scalar + breakdown by factor

**Interpretation**:
- 80-100: Healthy, active, good momentum
- 60-79: Stable, normal progress
- 40-59: Slowing, needs attention
- 0-39: Stalled or struggling

### Velocity
Measure of development activity rate (commits per time period).

**Baseline**: Historical average (e.g., commits/week over last 3 months)

**Trend**: Recent velocity vs baseline

**Example**:
- Baseline: 2 commits/week
- Last week: 4 commits/week → momentum = +100% (accelerating)

### Momentum
Direction and magnitude of change in development activity.

**Computed**: Trend of velocity (week-over-week, month-over-month)

**States**:
- **Accelerating**: recent velocity > baseline
- **Stable**: recent velocity ≈ baseline
- **Decelerating**: recent velocity < baseline

### Lifecycle Stage
Classification of project maturity and activity level.

**Stages**:
- **Conception**: Just started, 0% foundation phase progress
- **Active**: In primary development (>1 commit/week, phases in progress)
- **Maintenance**: Mostly complete, low activity (<1 commit/month)
- **Sunset**: Archived or dormant (no commits for >3 months)

**Markers** (in README.md or inferred):
- Explicit status badge: `**Status**: active`
- Implicit: computed from commit frequency + phase progress

### Prioritization Score
Weighted ranking for allocation decisions (urgency + momentum + complexity).

**Factors**:
- **Urgency**: Phase progress, blocked work, open issues
- **Momentum**: Velocity trend (accelerating is high priority)
- **Complexity**: Estimated effort (task count, phase count)
- **Strategic**: User-defined weights or tags

**Output**: Ranked list of projects

---

## Activity & Git

### Commit
Unit of version control change (git commit).

**Extracted**:
- Hash: commit SHA-1 (abbreviated)
- Date: commit timestamp (YYYY-MM-DD)
- Subject: commit message (first line)

**Source**: `git log --format=%h%as%s`

**Limit**: Last 20 commits per project (to keep UI responsive)

### Recent Activity
Indicator of active development (last commit date and time).

**Metric**: "Last commit: 2 days ago" or similar

**Use**: Health score factor, sorting projects by activity

### Stalled Project
Project with no commits for extended period (>2 weeks currently active, >3 months usually active).

**Flags**:
- Low health score
- Anomaly detection alert
- Identified via commit recency

---

## GitHub Integration

### PR (Pull Request)
Code review request in GitHub.

**Count**: Number of open PRs (`open_prs`)

**Interpretation**:
- High count (>5) with old PRs: possible bottleneck or review lag
- Recent PRs: active development

### Issue
Work item or bug report in GitHub.

**Count**: Number of open issues (`open_issues`)

**Computation**: `open_issues_count - open_prs` (GitHub counts PRs as issues)

**Interpretation**:
- High count: feature backlog or bug backlog
- Low count: well-managed project

### Stars
Social signal (GitHub repository popularity).

**Count**: Number of stargazers (`stars`)

**Interpretation**: Community interest, but not a health factor

---

## Drift Compatibility

### Drift
Standardized project metadata specification for cross-project tooling.

**Purpose**: Enable interoperability between Meridian and other tools

**Status**: Design phase (not yet defined)

### Drift Marker
File or field indicating a project follows Drift standards.

**Example** (hypothetical):
- `drift.yaml` in project root
- `drift_compatible: true` in README
- Metadata in package.json or similar

### Drift Pattern
Recognized structure or convention from Drift spec.

**Examples** (to be defined):
- Standard dependency graph format
- Cross-project milestone tracking
- Team ownership markers
- Custom metadata fields

### Cross-Project Dependency
Project B depends on (or blocks) Project A.

**Use in Prioritization**:
- Project A is blocked → lower urgency until unblocked
- Project A blocks others → higher urgency (unblock others)
- Part of Drift integration

---

## UI & Export

### Dashboard
Summary view of all projects with health stats.

**Components**:
- Title bar: overall progress %, project count
- Status breakdown: by-status counts (active, done, etc.)
- Latest activity: 5 most recent commits across all projects
- Project list: filterable, sortable

### Filter
Narrow project list by status or search term.

**Statuses**: active, done, planned, maintenance

**Search**: Free-text title/description search

### Export
Save project summary to markdown (shareable, wiki-compatible).

**Format**: Markdown table with project name, progress, phase count, latest commit

**Use**: Share dashboard with non-technical stakeholders, document in wikis

---

## Project Status

### Active
Project currently in development.

**Markers**:
- Recent commits (within last week)
- Phases in progress (<100% complete)
- Open PRs or issues

### Done
Project completed (all phases 100% complete).

**Markers**:
- All phases checked off
- No recent commits (final state)

### Planned
Project not yet started.

**Markers**:
- 0% progress on first phase
- No commits yet
- Explicit status in README

### Maintenance
Project mostly complete, low activity.

**Markers**:
- >80% phases complete
- <1 commit/month
- Only bug fixes or minor updates

---

## Backlog Hygiene

### Checkbox
Individual task state in BACKLOG.md.

- `[x]` = complete
- `[ ]` = incomplete

**Rule**: Status is the source of truth. Update immediately when task completes.

### Phase Heading
BACKLOG.md H1 heading marking phase boundary.

**Format**:
```
# PHASE N — Phase Name
```

**Parser recognizes**: H1 with "PHASE" prefix

### Epic Heading
BACKLOG.md H2 heading marking epic within phase.

**Format**:
```
## Epic Name
```

**Parser recognizes**: H2 within a phase section

### Auto-Compute
Automatic calculation of metrics from checkbox state.

**Never hardcoded**. Examples:
- Phase progress = (checked tasks) / (total tasks) * 100
- Project progress = (all checked) / (all tasks) * 100

**Benefit**: No out-of-sync metrics, source of truth is the file
