# Meridian-ZPI — Master Backlog

Complete list of all planned work across all phases.

---

## PHASE 0: Product Definition & Architecture

**Goal**: Establish ZPI's foundational product definition, architecture, and documentation.

**Dates**: Week 1 (planning), ongoing refinement

**Owner**: Ekaterina

- [x] Create product vision document
- [x] Create system architecture document
- [x] Create terminology glossary
- [x] Draft ZPI overview spec
- [x] Draft Drift integration spec
- [x] Draft scoring model spec
- [x] Create CLAUDE.md for Meridian-ZPI
- [ ] Review and finalize specs with team feedback
- [ ] Update README.md with ZPI context
- [ ] Create phase-based backlog structure

---

## PHASE 1: Health Scoring Foundation

**Goal**: Implement health scoring engine (Layer 2 intelligence).

**Dependencies**: Phase 0 (specs complete)

**Dates**: Weeks 2-3

**Owner**: TBD

### Tasks

#### 1.1: Health Scoring Engine
- [ ] Create `zpi/healthScoring.js` module
- [ ] Implement velocity score calculation
- [ ] Implement stability score calculation
- [ ] Implement progress score calculation
- [ ] Implement momentum score calculation
- [ ] Combine scores into health_score (0-100)
- [ ] Handle edge cases (new projects, no data)
- [ ] Unit test all scoring factors

#### 1.2: API Integration
- [ ] Extend `/api/projects` response with health fields
- [ ] Add `health_score`, `health_factors` to project model
- [ ] Cache computed scores
- [ ] Test response payload size

#### 1.3: Frontend Display
- [ ] Add health badge to project row (color: green/yellow/orange/red)
- [ ] Add health score breakdown tooltip
- [ ] Sort projects by health score
- [ ] Display factor breakdown in expanded row
- [ ] Update dashboard summary with health stats

#### 1.4: Testing & Calibration
- [ ] Test on 5+ real projects
- [ ] Measure score agreement vs human judgment
- [ ] Adjust thresholds if needed
- [ ] Document calibration results

**Success Criteria**:
- Health scores calculated and displayed per project
- Color-coded visual indicators (green/yellow/orange/red)
- Human review confirms scoring is accurate (>80% agreement)

---

## PHASE 2: Lifecycle & Prioritization

**Goal**: Implement lifecycle stage detection and prioritization ranking.

**Dependencies**: Phase 1 (health scoring working)

**Dates**: Weeks 4-5

**Owner**: TBD

### Tasks

#### 2.1: Lifecycle Stage Detector
- [ ] Create `zpi/lifecycleDetector.js` module
- [ ] Implement detection algorithm (Conception/Active/Maintenance/Sunset)
- [ ] Generate lifecycle badges
- [ ] Handle edge cases (new vs old inactive projects)
- [ ] Unit test all paths

#### 2.2: Prioritization Ranker
- [ ] Create `zpi/prioritizationRanker.js` module
- [ ] Implement urgency calculation
- [ ] Implement momentum factor
- [ ] Implement strategic importance (with placeholder)
- [ ] Combine into priority_score (0-100)
- [ ] Rank projects by score
- [ ] Unit test all paths

#### 2.3: Dependency Tracking (Drift Foundation)
- [ ] Add `dependency_graph` skeleton to project model
- [ ] Prepare for Drift metadata when available
- [ ] Track blocking/blocked relationships (manual for now)

#### 2.4: API Integration
- [ ] Extend `/api/projects` with lifecycle_stage
- [ ] Extend `/api/projects` with priority_score
- [ ] Add top 3 projects endpoint (or compute on frontend)

#### 2.5: Frontend Display
- [ ] Add lifecycle badge (CONCEPTION/ACTIVE/MAINTENANCE/SUNSET)
- [ ] Show top 3 urgent projects at a glance
- [ ] Display priority score in project row
- [ ] Add "Top Priorities" component to dashboard
- [ ] Show priority score breakdown in expanded row

#### 2.6: Testing & Calibration
- [ ] Test lifecycle detection on 5+ projects
- [ ] Verify prioritization ranking aligns with team priorities
- [ ] Adjust weights based on feedback

**Success Criteria**:
- Lifecycle stages detected and displayed per project
- Top 3 urgent projects highlighted
- Priority scores align with team's strategic direction

---

## PHASE 3: Anomaly Detection & Alerts

**Goal**: Detect unusual project states and surface alerts.

**Dependencies**: Phase 1 (health scoring available)

**Dates**: Weeks 6-7

**Owner**: TBD

### Tasks

#### 3.1: Anomaly Detector
- [ ] Create `zpi/anomalyDetector.js` module
- [ ] Implement velocity drop detection
- [ ] Implement stalled project detection
- [ ] Implement phase stuck detection
- [ ] Implement issue explosion detection
- [ ] Generate anomaly flags per project
- [ ] Unit test all paths

#### 3.2: Alert System
- [ ] Create alert display system
- [ ] Show anomaly badges on affected projects
- [ ] Provide alert details in expanded row
- [ ] Support multiple anomalies per project

#### 3.3: API Integration
- [ ] Extend `/api/projects` with `anomalies` array
- [ ] Include anomaly details (reason, threshold, etc.)

#### 3.4: Frontend Display
- [ ] Display anomaly badges (⚠️, 🚨)
- [ ] Show anomaly details in tooltip
- [ ] Sort by anomaly severity (High > Medium > Low)
- [ ] Add "Alerts" view (list of all anomalies)

#### 3.5: Testing
- [ ] Test anomaly detection on projects with known issues
- [ ] Verify alert thresholds are appropriate

**Success Criteria**:
- Anomalies detected and displayed per project
- Alerts highlight stalled/slowing projects
- Team finds alerts useful and timely

---

## PHASE 4: Drift Integration Foundation

**Goal**: Prepare for Drift specification integration (when Drift spec is ready).

**Dependencies**: Phase 1 (health scoring), Phase 0 (Drift context understood)

**Dates**: Weeks 8-9 (or when Drift spec is ready)

**Owner**: TBD

### Tasks

#### 4.1: Drift Detection Module
- [ ] Create `zpi/driftDetector.js` module
- [ ] Implement Drift marker file detection
- [ ] (Placeholder) Drift metadata parsing (awaiting spec)
- [ ] Add `drift_compatible` flag to project model

#### 4.2: Dependency Graph
- [ ] Create `zpi/dependencyGraph.js` module
- [ ] Parse Drift dependencies (when available)
- [ ] Build dependency graph (DAG)
- [ ] Detect circular dependencies
- [ ] Compute transitive dependencies

#### 4.3: Drift-Aware Scoring
- [ ] Update urgency calculation with blocking/blocked factors
- [ ] Integrate blocking bonus (+10)
- [ ] Integrate blocked penalty (-10)
- [ ] Test with multi-project scenarios

#### 4.4: API Integration
- [ ] Extend `/api/projects` with `drift_compatible`, `drift_metadata`, `dependency_graph`
- [ ] Create `/api/dependency-graph` endpoint (future)

#### 4.5: Frontend Display
- [ ] Add Drift badge (D) if compatible
- [ ] Show dependency indicators (🔗)
- [ ] Display dependency info in expanded row
- [ ] (Future) Dependency graph visualization

**Success Criteria**:
- Drift-compatible projects detected
- Dependency relationships tracked
- Blocking/blocked factors incorporated into prioritization

---

## PHASE 5: UI Refinement & Analytics

**Goal**: Polish ZPI UX and add analytics views.

**Dependencies**: Phases 1-4 (core features working)

**Dates**: Weeks 10-11

**Owner**: TBD

### Tasks

#### 5.1: Dashboard Redesign
- [ ] Reorganize dashboard to feature ZPI insights
- [ ] Add "Insights" tab (health summary, trends)
- [ ] Update project list layout for ZPI fields
- [ ] Improve color scheme and visual hierarchy

#### 5.2: Insights View
- [ ] Show health distribution (pie chart: green/yellow/orange/red)
- [ ] Show lifecycle distribution (conceptions, active, maintenance, sunset)
- [ ] Show top 5 urgent projects
- [ ] Show anomalies by type
- [ ] Show recent trends (velocity, progress)

#### 5.3: Team Assignment (Future)
- [ ] (Placeholder) Show team ownership from Drift
- [ ] (Placeholder) Filter by team
- [ ] (Placeholder) Team capacity in prioritization

#### 5.4: Export Enhancements
- [ ] Update MD export to include ZPI fields
- [ ] Include health scores and lifecycle stages
- [ ] Include top priorities
- [ ] Include anomalies

#### 5.5: Documentation
- [ ] Update README.md with ZPI features
- [ ] Create user guide for interpreting scores
- [ ] Document anomaly types and meanings

**Success Criteria**:
- ZPI insights visible and useful at a glance
- Export includes health and prioritization data
- Team understands how to use ZPI for priority decisions

---

## PHASE 6: Performance & Scale

**Goal**: Optimize for large portfolios (20+ projects).

**Dependencies**: Phases 1-5 (features complete)

**Dates**: Weeks 12+

**Owner**: TBD

### Tasks

#### 6.1: Performance Optimization
- [ ] Profile scoring calculations (target: <100ms for 50 projects)
- [ ] Cache intermediate results
- [ ] Debounce recalculations
- [ ] Optimize DOM rendering (virtualization if needed)

#### 6.2: Scale Testing
- [ ] Test with 20 projects
- [ ] Test with 50 projects
- [ ] Measure response time and memory
- [ ] Document limits and recommendations

#### 6.3: Caching Strategy
- [ ] Cache computed scores for N minutes
- [ ] Invalidate cache on manual refresh
- [ ] Use ETags for GitHub API endpoints

**Success Criteria**:
- Dashboard responsive with 50+ projects
- Scores computed in <100ms
- No perceived lag in UI

---

## PHASE 7: Team & Organization Features

**Goal**: Support multi-team and org-level prioritization.

**Dependencies**: Phases 1-5, Drift integration ready

**Dates**: Weeks 13+

**Owner**: TBD

### Tasks

#### 7.1: Team Assignment
- [ ] Parse team ownership from Drift
- [ ] Display team badges per project
- [ ] Filter projects by team
- [ ] Show team summary dashboard

#### 7.2: Team Capacity
- [ ] Define team velocity baseline
- [ ] Track team workload (# projects in active dev)
- [ ] Include capacity in prioritization scoring
- [ ] Alert if team overloaded

#### 7.3: Strategic Weighting
- [ ] Allow custom strategic importance per project
- [ ] Support team-level importance overrides
- [ ] Show weighting in UI

#### 7.4: Organization Dashboard
- [ ] Org-level health summary
- [ ] Cross-team priority alignment
- [ ] Team workload distribution
- [ ] Org metrics and trends

**Success Criteria**:
- Teams can manage and prioritize their own projects
- Org leadership has visibility into cross-team dependencies
- Capacity planning supported

---

## PHASE 8: Historical Analytics & Trends

**Goal**: Enable long-term trend analysis and forecasting.

**Dependencies**: Phases 1-7, 4+ weeks of scoring data

**Dates**: Weeks 14+

**Owner**: TBD

### Tasks

#### 8.1: Historical Data Storage
- [ ] Design historical data schema
- [ ] Implement daily/weekly snapshots of scores
- [ ] Archive to persistent storage

#### 8.2: Trend Visualization
- [ ] Plot health score over time per project
- [ ] Show velocity trend (weeks, months)
- [ ] Show progress trend (ETA estimation)
- [ ] Show lifecycle changes (when did it go from active to maintenance?)

#### 8.3: Forecasting
- [ ] Estimate project completion date based on velocity
- [ ] Forecast health score if trends continue
- [ ] Alert if predicted to miss deadline

#### 8.4: Reports
- [ ] Weekly health report (email)
- [ ] Monthly trends (PDF)
- [ ] Quarterly retrospective

**Success Criteria**:
- Historical trends visible per project
- ETA estimates useful and reasonably accurate
- Reports provide actionable insights

---

## PHASE 9: Machine Learning & Advanced Analytics

**Goal**: Auto-optimize thresholds and detect patterns.

**Dependencies**: Phase 8 (historical data available)

**Dates**: Weeks 15+

**Owner**: TBD

### Tasks

#### 9.1: ML-Based Anomaly Detection
- [ ] Train anomaly detector on historical data
- [ ] Detect unusual patterns beyond hardcoded thresholds
- [ ] Reduce false positives/negatives

#### 9.2: Smart Weighting
- [ ] Learn importance of each factor per project type
- [ ] Auto-adjust thresholds based on team success
- [ ] Personalize scoring per organization

#### 9.3: Prediction Models
- [ ] Predict project success (likelihood of timely completion)
- [ ] Predict team burnout (velocity drop ahead of time)
- [ ] Flag at-risk projects early

**Success Criteria**:
- ML models improve accuracy of anomaly detection
- Scoring personalizes to team/org norms
- Early warning system for at-risk projects

---

## Backlog: Future Ideas

- [ ] Slack/email integration (automatic daily digest)
- [ ] GitHub Actions integration (auto-update on commits)
- [ ] Jira integration (auto-sync from issue counts)
- [ ] Figma integration (design project health)
- [ ] Milestone tracking (roadmap sync)
- [ ] Resource allocation optimizer (suggest team rebalance)
- [ ] Post-mortem templates (after projects complete)
- [ ] Community projects (open source health tracking)

---

## Legend

- `[ ]` — Not started
- `[x]` — Completed
- `[~]` — In progress
- `[@]` — Blocked
