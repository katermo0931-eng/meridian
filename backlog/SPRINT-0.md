# SPRINT 0: Meridian-ZPI Product Definition & Architecture

**Current Sprint** — Establish foundational documentation and architecture for ZPI.

**Dates**: Week 1 (ongoing)

**Owner**: Ekaterina

**Goal**: Complete all product specs and architecture docs so Phase 1 implementation can start immediately.

---

## Sprint Scope

This sprint is **planning and documentation only** — no implementation yet.

### Deliverables

- [x] Product vision document (context/product-vision.md)
- [x] System architecture document (context/architecture.md)
- [x] Terminology glossary (context/terminology.md)
- [x] ZPI overview spec (specs/zpi-overview.md)
- [x] Drift integration spec (specs/drift-integration.md)
- [x] Scoring model spec (specs/scoring-model.md)
- [x] CLAUDE.md (project instructions, updated)
- [x] Master backlog (backlog/MASTER-BACKLOG.md)
- [x] This sprint doc (backlog/SPRINT-0.md)
- [ ] README.md updates (add ZPI context to top-level README)
- [ ] Team review session (align on specs, unblock questions)

---

## Context

### Current State
- **Meridian Core** is complete and working (Layer 0 — Sensing)
- Dashboard scans projects, reads BACKLOG.md + README.md, pulls git/GitHub data
- Live at https://katermo0931-eng.github.io/meridian/
- Local dev at http://localhost:4319

### Next Steps
- Implement ZPI health scoring (Phase 1)
- Implement lifecycle and prioritization (Phase 2)
- Integrate anomaly detection (Phase 3)
- Eventually integrate Drift patterns (Phase 4+)

### Constraints
- **Same repo** — do NOT create separate ZPI repository
- **Vanilla stack** — no build system, no bundler
- **File-based** — no new database
- **Always auto-computed** — never hardcode metrics

---

## Key Decisions Made

### 1. Three-Layer Architecture ✓
```
Layer 2: Intelligence     ← ZPI (health scoring, prioritization, anomalies)
Layer 1: Structure        ← project metadata, metrics aggregation
Layer 0: Sensing          ← filesystem scan, git, GitHub API (Meridian today)
```

### 2. Health Scoring Model ✓
Four factors (0-25 each, max 100):
- Velocity (baseline activity rate)
- Stability (consistency, no long gaps)
- Progress (phase completion %)
- Momentum (trend: accelerating vs decelerating)

### 3. Lifecycle Stages ✓
Four stages (inferred from git + progress data):
- Conception (new, no commits)
- Active (regular commits, phases in progress)
- Maintenance (mostly complete, low activity)
- Sunset (complete or archived, no recent activity)

### 4. Prioritization Ranking ✓
Three factors (0-100 combined):
- Urgency (strategic importance, blockers, critical issues)
- Momentum (accelerating projects prioritized)
- Strategic (infrastructure vs experimental, etc.)

### 5. Drift Compatibility ✓
- Recognize Drift marker files (when spec available)
- Extract dependencies from Drift metadata
- Use dependencies to adjust prioritization (blocking/blocked factors)
- Plan for cross-project analysis (future)

---

## Documentation Structure ✓

Created in this sprint:
```
meridian/
├── CLAUDE.md                          ← Updated with ZPI context
├── context/
│   ├── product-vision.md              ← Strategic direction
│   ├── architecture.md                ← System design
│   └── terminology.md                 ← Shared vocabulary
├── specs/
│   ├── zpi-overview.md                ← Feature scope & design
│   ├── drift-integration.md           ← Drift patterns
│   └── scoring-model.md               ← Algorithms & thresholds
└── backlog/
    ├── MASTER-BACKLOG.md              ← All planned phases
    └── SPRINT-0.md                    ← This document
```

---

## Open Questions & Next Steps

### For Team Review
1. **Scoring Thresholds**: Are the velocity/stability thresholds reasonable? (e.g., 1-2 commits/week baseline)
2. **Drift Timing**: When will Drift spec be finalized? Plan Phase 4 accordingly.
3. **Strategic Weights**: How should "strategic importance" be assigned? (manual per project, auto-inferred, configurable?)
4. **Team Capacity**: Do we need team workload in Phase 2, or defer to Phase 7?

### Technical Clarifications
5. **Cache Duration**: How long to cache computed scores? (s/m/continuously?)
6. **Historical Data**: When to start collecting historical snapshots for trends? (Phase 1 or Phase 8?)
7. **GitHub Token**: Use GITHUB_TOKEN env var, or new config?

### Process
8. **Code Review**: Who reviews implementation PRs for PHases 1-2?
9. **Calibration**: How many projects needed for threshold calibration? (5? 10?)
10. **Feedback Loop**: When do we get user feedback on Phase 1 scores?

---

## Next Sprint Preview (Phase 1)

**Health Scoring Foundation**

### Work Items (estimated 2 weeks)
1. Create `zpi/healthScoring.js` module
2. Implement 4-factor scoring algorithm
3. Extend API (`/api/projects`) with health fields
4. Add health badges to frontend (color-coded)
5. Test & calibrate on real projects
6. Get team feedback

### Definition of Done
- Health scores displayed per project ✓
- Thresholds calibrated & agreed ✓
- >80% human agreement on scores ✓
- Dashboard updated with health summary ✓

### Risks & Mitigations
| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Scoring thresholds don't match team norms | Medium | High | Weekly calibration loop with team feedback |
| Performance issue (scoring 50 projects is slow) | Low | Medium | Profile early, cache aggressively if needed |
| Disagreement on scoring factors | Medium | Medium | Have Phase 0 review session to align |

---

## Success Criteria (Sprint 0 Complete)

- [ ] All spec documents complete and internally consistent
- [ ] CLAUDE.md updated with ZPI context
- [ ] Master backlog created with all phases
- [ ] Team has reviewed and aligned on specs
- [ ] No open design questions blocking Phase 1
- [ ] Phase 1 tasks (health scoring) clearly defined and ready to start

---

## Notes & Reminders

### Meridian Conventions to Maintain
- No build system — vanilla JS only
- No database — file-based sensing
- No hardcoded metrics — always auto-computed
- Use `execFile()` not `exec()` for git commands
- Use `\x1f` field delimiter in git output parsing

### ZPI Additions
- Extend project model without breaking existing Meridian features
- Health scoring computed server-side, included in `/api/projects` response
- Frontend displays health badges alongside existing progress bars
- Layers are additive — Layer 2 builds on Layer 1 & 0

### Testing Philosophy
- Health scores tested on 5+ real projects before ship
- Calibration loop: compute → human review → adjust → repeat
- >80% agreement with human judgment before Phase 1 done

---

## Files to Review Before Phase 1

**Required Reading**:
1. `context/product-vision.md` — understand the "why"
2. `context/architecture.md` — understand the "how" (data flow)
3. `specs/scoring-model.md` — understand the algorithms
4. `specs/zpi-overview.md` — understand the feature scope

**Optional (Reference)**:
5. `context/terminology.md` — glossary (refer to as needed)
6. `specs/drift-integration.md` — context for Phase 4 (can defer)

---

## Sprint Timeline

| Day | Activity |
|---|---|
| Today | Spec docs complete, this sprint doc created |
| Tomorrow | Team review meeting (30 min) — align on specs, unblock questions |
| Day 3 | Update README.md with ZPI context |
| Day 4-5 | Finalize any open questions, refine specs based on feedback |
| Week 2 | Start Phase 1 (health scoring implementation) |

---

## Communication

- **Daily standup**: Check-in on open questions
- **Team review session**: Scheduled (30 min) — review all specs, confirm thresholds, align on next steps
- **Phase 1 kickoff**: After review session, start implementation sprint
