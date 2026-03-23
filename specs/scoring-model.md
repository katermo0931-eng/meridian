# Scoring Model — Specification

Detailed algorithms and thresholds for health scoring, lifecycle detection, and prioritization ranking.

## Health Scoring Model

**Purpose**: Single scalar (0-100) evaluating project stability and momentum.

**Formula**: `health = velocity_score + stability_score + progress_score + momentum_score`

**Range**: 0-100 (higher = healthier)

### 1. Velocity Score (0-25)

**Goal**: Evaluate baseline development activity rate.

**Metric**: Commits per week over last 4 weeks

**Calculation**:
```
recent_commits = count(commits in last 4 weeks)
recent_velocity = recent_commits / 4
historical_avg = avg(commits/week for last 12 weeks, excluding recent_velocity)
velocity_ratio = recent_velocity / historical_avg
```

**Thresholds**:
| Velocity Ratio | Score |
|---|---|
| ≥ 1.5 | 25 |
| 1.0-1.49 | 18 |
| 0.5-0.99 | 10 |
| < 0.5 | 0 |

**Special Cases**:
- New project (<4 weeks): Use total commits, expect 0-2 per week → 10-15 points
- No commits: 0 points
- Historical data not available: Use absolute threshold (1-2 commits/week acceptable)

**Rationale**: Projects following their normal pace are healthy. New projects get grace period.

### 2. Stability Score (0-25)

**Goal**: Evaluate consistency of development activity (no long gaps).

**Metric**: Variance and gaps in commit timestamps

**Calculation**:
```
commit_dates = [list of all commit dates, last 12 weeks]
gaps = [days between consecutive commits]
largest_gap = max(gaps)
gap_variance = std_dev(gaps)
```

**Thresholds**:
| Largest Gap | Avg Gap Variance | Score |
|---|---|---|
| ≤ 3 days | low (< 5) | 25 |
| 3-7 days | medium (5-15) | 18 |
| 7-14 days | high (>15) | 10 |
| > 14 days | - | 0 |

**Special Cases**:
- No commits: 0 points
- Weekend gaps OK (exclude Sat-Sun for gap calculation)
- Holiday gaps: (future) track holidays, exclude from calculation

**Rationale**: Consistent activity indicates ongoing engagement. Long gaps suggest project is dormant.

### 3. Progress Score (0-25)

**Goal**: Evaluate phase completion percentage.

**Metric**: Completed tasks / total tasks

**Calculation**:
```
completed_tasks = count(tasks where state == "done")
total_tasks = count(all tasks)
progress_pct = (completed_tasks / total_tasks) * 100
progress_score = (progress_pct / 100) * 25
```

**Thresholds**:
| Progress % | Score |
|---|---|
| 100 | 25 |
| 75-99 | 22 |
| 50-74 | 15 |
| 25-49 | 8 |
| 0-24 | 0 |

**Special Cases**:
- No tasks (empty BACKLOG.md): 10 points (assume bootstrapping, give grace period)
- No BACKLOG.md: 0 points (no structured work)

**Rationale**: Completed work is visible proof of progress. Projects at finish line are lower added value.

### 4. Momentum Score (0-25)

**Goal**: Evaluate direction of velocity (accelerating vs decelerating).

**Metric**: Trend of commits (recent vs historical)

**Calculation**:
```
recent_velocity = avg(commits/week for last 2 weeks)
historical_velocity = avg(commits/week for weeks 2-8)
momentum_ratio = recent_velocity / historical_velocity
```

**Thresholds**:
| Momentum Ratio | Direction | Score |
|---|---|---|
| ≥ 1.5 | Accelerating | 25 |
| 1.0-1.49 | Stable | 15 |
| 0.5-0.99 | Decelerating | 5 |
| < 0.5 | Stalled | 0 |

**Special Cases**:
- New project (< 2 weeks history): Check week 1 vs projected week 2 tempo → 10-20 points
- No recent commits: 0 points
- Constant velocity: 15 points (stable is good)

**Rationale**: Accelerating projects have momentum (good sign). Decelerating projects may be losing interest.

### Health Score Interpretation

| Score | Health | Interpretation |
|---|---|---|
| 80-100 | Excellent | Active, stable, great progress, accelerating. Keep going. |
| 60-79 | Good | Good activity, steady progress, normal momentum. On track. |
| 40-59 | Caution | Slowing activity or low progress. Needs attention or resources. |
| 20-39 | Critical | Very low activity or stalled. At risk of abandonment. |
| 0-19 | Alert | Project may be dead or blocked. Investigate urgently. |

### Visualization

**Color Coding**:
- 80-100 → Green (all systems go)
- 60-79 → Blue (healthy, normal progress)
- 40-59 → Yellow (needs attention)
- 20-39 → Orange (significant concern)
- 0-19 → Red (critical)

**UI Display**:
```
Project Alpha                    ●●●● 82
├─ Velocity:  ████░░░░░░ 22/25
├─ Stability: ███░░░░░░░ 18/25
├─ Progress:  ██████░░░░ 20/25
└─ Momentum:  ███░░░░░░░ 22/25
```

---

## Lifecycle Scoring & Detection

**Goal**: Classify project into maturity stage.

**Stages**: Conception, Active, Maintenance, Sunset

### Detection Algorithm

```
function detectLifecycle(project):
  if commit_count == 0:
    if created_days < 14:
      return CONCEPTION
    else:
      return SUNSET
  
  last_commit_days = days since last commit
  commits_last_month = count(commits in last 30 days)
  phase_progress_pct = ...
  
  if last_commit_days > 90:
    return SUNSET
  
  if commits_last_month >= 4 and phase_progress_pct < 80:
    return ACTIVE
  
  if phase_progress_pct >= 80 and commits_last_month < 1:
    return MAINTENANCE
  
  if commits_last_month >= 2:
    return ACTIVE
  
  return MAINTENANCE
```

### Decision Tree

```
                Does project have commits?
                    /             \
                  Yes             No
                  /                 \
             Last commit?        Created recently?
             /         \         /          \
           Yes         No      Yes           No
           /             \    /              \
        < 90 days?     SUNSET            CONCEPTION   SUNSET
        /        \
      Yes         No
      /            \
  Active phase <80%   SUNSET
   and commits?
   /         \
 Yes        No
 /         \
ACTIVE   MAINTENANCE+Check:
        (commits < 1/month)
        + (progress > 80%)
```

### Stage Characteristics

#### Conception
- Repository created recently (< 2 weeks)
- Very few commits (0-2)
- First phase 0% complete
- No README description or README is template

**Actions**: 
- Set team/owner clearly
- Create first milestone
- Allocate resources for kickoff

#### Active
- ≥ 4 commits in last month
- Phase progress 10-90%
- Open PRs or issues
- Regular commit activity

**Actions**:
- Feature work ongoing
- Code reviews happening
- Planning next phase

#### Maintenance
- > 80% phases complete
- < 1 commit/month
- Long time between commits (no longer actively developed)
- Only bug fixes or minor updates

**Actions**:
- Monitor for bugs
- Don't allocate feature work
- Plan for sunsetting or long-term maintenance

#### Sunset
- 100% phases complete OR no commits for > 3 months
- Project declared complete or archived
- README status: "complete", "retired", "archived"

**Actions**:
- Archive or declare deprecated
- Remove from active prioritization
- Preserve documentation for reference
- Migrate dependencies to replacement

---

## Prioritization Ranking Model

**Purpose**: Rank projects by strategic value and urgency.

**Formula**: `priority = urgency + momentum_factor + strategic_importance`

**Range**: 0-100 (higher = more urgent)

### 1. Urgency Factor (0-40)

**Goal**: Assess how blocked or time-critical a project is.

**Components**:

#### Base Urgency (0-20)
```
base = 10 (default, all projects matter)

if project.phase_progress_pct < 20:
  base += 0  (early stage, less urgent)
else if project.phase_progress_pct < 50:
  base += 3  (mid-way, some urgency)
else if project.phase_progress_pct < 80:
  base += 8  (almost done, finish line urgency)
else if project.phase_progress_pct < 100:
  base += 5  (last % is often hard, maintain priority)
```

#### Blocking Others (+10)
```
if project.dependency_graph.blocks.length > 0:
  urgency += 10

reasoning: unblock others, higher priority
```

#### Blocked By Others (-10)
```
if project.dependency_graph.blocked_by.length > 0:
  urgency -= 10

reasoning: can't progress, lower priority
cap at 0 (don't go negative)
```

#### Critical Issues (+5)
```
if project.github.critical_issues > 0:
  urgency += 5

note: "critical" = labeled with "critical" or "blocker"
```

**Total Urgency**: cap at 0-40

### 2. Momentum Factor (0-30)

**Goal**: Accelerate projects with positive momentum.

```
if health_momentum_score >= 20:
  momentum_factor = 30  (accelerating)
else if health_momentum_score >= 12:
  momentum_factor = 15  (stable)
else:
  momentum_factor = 5   (decelerating)
```

**Rationale**: Ride the wave of accelerating projects. They have team attention and energy.

### 3. Strategic Importance (0-30)

**Goal**: Weight by organizational priority.

**Tiers** (example):
```
Infrastructure/Core     = 30  (enables all others)
Feature Blocker         = 25  (unblocks features)
Standard Feature        = 18  (planned for current sprint)
Nice-to-Have Feature    = 10  (planned for later)
Experimental            = 5   (exploration, low priority)
Maintenance             = 3   (keeping things running)
```

**Future**: Configurable per organization or team

**Default**: If not annotated, infer from:
```
if project.github.stars > 100:
  strategic = 25  (popular, important)
else if project.blocked_by.count > 0:
  strategic = 20  (others depend on it)
else if project.lifecycle == MAINTENANCE:
  strategic = 3   (keeping lights on)
else:
  strategic = 18  (standard feature)
```

### Prioritization Score

**Formula**: `priority = urgency (0-40) + momentum (0-30) + strategic (0-30)`

**Range**: 0-100

**Example Calculation**:
```
Project A (Blocking Blocker):
  - phase_progress: 60% → base urgency: 13, blocking +10 = 23
  - momentum: accelerating → 30
  - strategic: core infrastructure → 30
  - PRIORITY = 23 + 30 + 30 = 83 ← top priority

Project B (Blocked, Low Activity):
  - phase_progress: 45% → base urgency: 13, blocked by -10 = 3
  - momentum: decelerating → 5
  - strategic: nice-to-have → 10
  - PRIORITY = 3 + 5 + 10 = 18 ← deprioritized
```

### UI Display

**Top 3 Projects Overview**:
```
📌 Top Priorities

1. Project Alpha — 83 points
   ✓ Unblocks 2 projects (+10)
   ⬆️ Accelerating (+30)
   🏗️ Infrastructure (+30)

2. Project Beta — 72 points
   ✓ Final sprint (+8)
   ➡️ Stable momentum (+15)
   🎯 Core feature (+25)

3. Project Gamma — 65 points
   🔗 Integrating (+0)
   ⬇️ Slowing (+5)
    📊 Analytics service (+30)
```

---

## Anomaly Detection Model

**Goal**: Surface unusual project states.

### Anomaly Types

#### 1. Velocity Drop
**Threshold**: Recent velocity < 50% of baseline

**Alert**: "⚠️ Velocity dropped from 3 commits/week to 1"

**Severity**: Medium (may recover)

**Action**: Check for blockers, resource constraints, or burnout

#### 2. Stalled Project
**Threshold**: 
- Active projects: no commits for > 2 weeks
- Maintenance projects: no commits for > 3 months

**Alert**: "🔴 No activity for 3 weeks (usually active)"

**Severity**: High (risk of abandonment)

**Action**: Investigate reason, reallocate resources, or declare maintenance mode

#### 3. Phase Stuck
**Threshold**: Phase at same % for > 2 weeks, or decreasing %

**Alert**: "⏸️ Phase stuck at 25% for 2 weeks"

**Severity**: Medium (may be rework)

**Action**: Check for complexity, blockers, or scope creep

#### 4. Issue Explosion
**Threshold**: Open issues increased > 50% in 1 week

**Alert**: "🚨 Open issues +8 (was 5, now 13)"

**Severity**: High (quality or scope regression)

**Action**: Triage and prioritize critical issues

#### 5. Build/Test Failures
**Threshold**: (Future) Integration with CI/CD

**Alert**: (Future) "❌ CI failing for 2 days"

#### 6. Review Backlog
**Threshold**: Open PRs > 5 and oldest > 2 weeks

**Alert**: "📋 5 PRs waiting, oldest is 10 days"

**Severity**: Medium (review bottleneck)

**Action**: Allocate review bandwidth

### Anomaly Detection Algorithm

```
function detectAnomalies(project, historical_data):
  anomalies = []
  
  velocity = recentVelocity(project)
  baseline = historicalBaseline(project)
  if velocity < baseline * 0.5:
    anomalies.push("velocity_drop")
  
  lastCommitDays = daysSinceLastCommit(project)
  if project.lifecycle == ACTIVE and lastCommitDays > 14:
    anomalies.push("stalled_project")
  
  phase = currentPhase(project)
  if phaseProgressUnchanged(phase, 14):
    anomalies.push("phase_stuck")
  
  if issueCountIncrease(project) > 50%:
    anomalies.push("issue_explosion")
  
  return anomalies
```

### UI Display

**Anomaly Badges**:
```
Project Alpha                     ●●●● 82 ⚠️ 🚨
  ⚠️ Velocity drop (1 → 0.5 commits/week)
  🚨 8 open issues (was 5)
  
Details:
- Last commit: 10 days ago
- Open PRs: 2 (oldest: 5 days)
```

---

## Tuning & Calibration

### Phase 1: MVP Thresholds
Use conservative/safe defaults:
- Velocity baseline: 1-2 commits/week acceptable
- Stability: gaps up to 14 days OK
- Progress: any forward motion is good
- Momentum: stable is good

### Phase 2: Calibration
Monitor over 2-4 weeks:
- Are projects being over/under-scored?
- Adjust thresholds based on team feedback
- Create org-specific or project-type baselines

### Phase 3: Advanced
- Machine learning on historical data
- Per-team or per-project custom thresholds
- Seasonal adjustments (holiday periods)
- Team velocity correlation

---

## Testing & Validation

### Test Cases

```
Test: Healthy Active Project
Input: 3 commits/week, 60% progress, accelerating
Expected Health: 75-85 (GOOD)
Expected Lifecycle: ACTIVE
Expected Priority: 65-75 (normal)

Test: Stalled Project
Input: 0 commits for 4 weeks, 45% progress
Expected Health: 15-25 (ALERT)
Expected Lifecycle: MAINTENANCE or SUNSET
Expected Anomaly: stalled_project

Test: Finished Project
Input: 100% progress, 1 commit/month, new no activity
Expected Health: 50-60 (low, work is done)
Expected Lifecycle: SUNSET
Expected Priority: 5-10 (deprioritize)

Test: New Project
Input: 2 commits, 0% progress, just created
Expected Health: 15-25 (grace period)
Expected Lifecycle: CONCEPTION
Expected Priority: 35-45 (medium, kickoff phase)
```

### Calibration Loop
1. Calculate scores on 5-10 real projects
2. Get human judgment (curator review)
3. Measure agreement rate
4. Adjust thresholds/weights if disagreement > 20%
5. Repeat until confident
