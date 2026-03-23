# ZPI Overview — Specification

**ZPI** = Meridian's Intelligence Layer (Layer 2)

Transforms Meridian from a dashboard into a decision-making system by adding project evaluation, health scoring, prioritization guidance, and anomaly detection.

## Feature Scope

### 1. Health Scoring Engine

**Goal**: Assign each project a health score (0-100) based on activity metrics.

**Input**: Project model (commits, phases, progress, GitHub stats)

**Output**: 
- Health score (0-100)
- Score breakdown (by factor):
  - Velocity (0-25)
  - Stability (0-25)
  - Progress (0-25)
  - Momentum (0-25)

**Factors**:

#### Velocity (0-25 points)
Baseline development activity rate.

- Calculate: commits per week over last 4 weeks
- Compare to historical baseline (last 3 months)
- Score:
  - ≥1.5x baseline → 25 points (very active)
  - 0.5x-1.5x baseline → 12-15 points (normal)
  - <0.5x baseline → 0-5 points (low activity)

#### Stability (0-25 points)
Consistency of development activity (no long gaps).

- Check: commit frequency variance
- Score:
  - Commits every 1-3 days → 25 points (very consistent)
  - Commits 1-2x/week → 15-20 points (consistent)
  - Irregular, gaps >2 weeks → 0-10 points
  - No commits in 2+ months → 0 points

#### Progress (0-25 points)
Phase completion percentage.

- Calculate: (completed tasks) / (total tasks)
- Score: `points = progress_pct * 0.25` (0-25)
- Project at 50% → 12.5 points
- Project at 100% → 25 points

#### Momentum (0-25 points)
Direction of velocity (accelerating vs decelerating).

- Compare: recent week vs average of previous 4 weeks
- Score:
  - Recent > 1.5x avg → 25 points (accelerating)
  - Recent ≈ avg → 12-15 points (stable)
  - Recent < 0.5x avg → 0-10 points (decelerating)
  - No commits → 0 points

**Thresholds**:
- 80-100: Healthy (active, good progress, stable)
- 60-79: Good (on track, normal activity)
- 40-59: Caution (slowing, needs attention)
- 0-39: Struggling (stalled, low activity)

**UI Display**:
- Color-coded badge per project (green/yellow/orange/red)
- Tooltip with breakdown (25 + 18 + 20 + 15 = 78)
- Sortable by score

### 2. Lifecycle Stage Detector

**Goal**: Classify each project into maturity stage.

**Stages**:

#### Conception
Brand new project, pre-launch.

**Markers**:
- Repository created <2 weeks ago
- First phase 0% complete
- 0-2 commits total
- No README description

**Score**: Requires attention, may need resources

#### Active
Primary development phase.

**Markers**:
- ≥1 commit/week (recent 4 weeks)
- Phase completion 10-90%
- Open PRs or issues
- Active GitHub activity

**Score**: Highest priority for feature work

#### Maintenance
Mostly complete, low activity.

**Markers**:
- >80% phases complete
- <1 commit/month
- Only bug fixes or minor updates
- README status: "maintenance" or similar

**Score**: Monitor for bugs, don't allocate feature work

#### Sunset
Project completed or archived.

**Markers**:
- 100% phases complete
- No commits for >3 months
- README status: "complete", "retired", or "archived"
- No open issues/PRs

**Score**: No active work needed; preserve if dependencies exist

**Detection Algorithm**:
```
if commit_count == 0 or created_days < 14:
  return CONCEPTION
elif last_commit_days > 90:
  return SUNSET
elif phase_progress > 80 and commits_per_month < 1:
  return MAINTENANCE
else:
  return ACTIVE
```

**UI Display**:
- Badge per project (CONCEPTION / ACTIVE / MAINTENANCE / SUNSET)
- Color-coded (blue / green / orange / gray)
- Sortable by stage

### 3. Prioritization Ranker

**Goal**: Rank projects by strategic urgency and momentum.

**Output**: Ranked list with overall priority score.

**Factors**:

#### Urgency (0-40)
Strategic importance and blockers.

- Blocked by other projects → -10 points
- Blocks other projects → +10 points
- Open critical issues → +5 points
- First phase in progress → +10 points (need early wins)
- All phases >90% but not 100% → +5 points (finish line)

#### Momentum (0-30)
Velocity trend (accelerating projects get priority).

- Accelerating → 30 points
- Stable → 15 points
- Decelerating → 5 points
- Stalled → 0 points

#### Strategic Importance (0-30)
User-defined or inferred importance.

- Core infrastructure → 30 points
- Feature enabler → 20 points
- Nice-to-have → 10 points
- Experimental → 0 points
- (Future: configurable weights per organization)

**Priority Score** = urgency (0-40) + momentum (0-30) + strategic (0-30)

**Range**: 0-100 (higher = more urgent)

**UI Display**:
- Top 3 projects at a glance
- Ranking with score and reason
- Sortable list

### 4. Drift Pattern Recognizer

**Goal**: Detect and recognize Drift-compatible project structures.

**Status**: Design phase (awaiting Drift spec finalization)

**Expected Capabilities**:
- Identify projects following Drift conventions
- Extract Drift metadata (owner, dependencies, team)
- Build cross-project dependency graph
- Factor dependencies into prioritization

**Placeholder**: To be filled in with Drift specification

### 5. Anomaly Detector

**Goal**: Surface unusual project states (stalled, sudden drops, etc.).

**Anomalies**:

#### Velocity Drop
Recent activity significantly below baseline.

- Threshold: recent velocity <50% of baseline
- Alert: "⚠️ Velocity drop: Usually 2 commits/week, now 0.5"

#### Stalled Project
No activity for unusual period.

- Threshold: >2 weeks for active projects, >3 months for maintenance
- Alert: "⚠️ Stalled: No commits for 3 weeks"

#### Phase Stuck
Phase unchanged for extended time.

- Threshold: Phase at same % for >2 weeks
- Alert: "⚠️ Phase stuck at 25% for 3 weeks"

#### Issue Explosion
Sudden spike in open issues/PRs.

- Threshold: >50% increase in 1 week
- Alert: "⚠️ Issues +8 (was 5, now 13)"

**UI Display**:
- Alert badges on affected projects
- Alert detail in expanded row
- Sortable by alert type

---

## Technical Requirements

### Data
- No new database — extend existing project model
- Store computed scores in project object
- Recalculate on each `/api/projects` call (fresh data)

### API
- Extend `/api/projects` response with ZPI fields:
  ```json
  {
    "name": "project-name",
    "health_score": 78,
    "health_factors": {
      "velocity": 22,
      "stability": 18,
      "progress": 20,
      "momentum": 18
    },
    "lifecycle_stage": "ACTIVE",
    "priority_score": 65,
    "priority_factors": {
      "urgency": 25,
      "momentum": 20,
      "strategic": 20
    },
    "anomalies": ["velocity_drop", "phase_stuck"]
  }
  ```

### Frontend
- Display health badge in project row (green/yellow/orange/red)
- Show lifecycle stage badge (ACTIVE/MAINTENANCE/CONCEPTION/SUNSET)
- Highlight priority ranking (top 3 projects)
- Show anomaly alerts in expanded rows
- Add "Insights" view (health breakdown, trending projects, anomalies)

### Performance
- Health scores computed at scan time (not real-time)
- Cached in project model
- Recalculate only on full refresh (every N minutes)

---

## Success Criteria

### MVP (Sprint 0)
- [ ] Health score calculated and displayed per project
- [ ] Lifecycle stage detected and badged
- [ ] Top 3 urgent projects ranked and highlighted
- [ ] Basic anomalies detected (velocity drop, stalled)

### v1 (Sprint 1)
- [ ] Detailed health factor breakdown shown
- [ ] Priority score includes all three factors (urgency, momentum, strategic)
- [ ] Anomaly alerts with details
- [ ] Insights view (trending projects, health summary)

### v2 (Sprint 2+)
- [ ] Drift pattern recognition
- [ ] Cross-project dependency graph
- [ ] Historical trend charts (velocity, score)
- [ ] Team/ownership in prioritization

---

## Open Questions

1. **Strategic Importance Weighting**: How to define and assign (manual, inferred, or plugin model)?
2. **Drift Spec**: Waiting for Drift specification finalization
3. **Dependency Graph**: How to express cross-project dependencies? (Drift? custom?)
4. **Thresholds**: Are velocity/stability thresholds reasonable for all projects, or customizable?
5. **UI Refresh**: How often to recalculate scores? (On every page load? Cached? Polled?)
