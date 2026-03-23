# Drift Integration — Specification

**Context**: Drift is a standardized project metadata specification for cross-project tooling interoperability.

Meridian-ZPI will integrate Drift patterns to enable:
- Recognition of Drift-compatible projects
- Cross-project dependency tracking
- Drift-informed prioritization
- Compatibility layer for future ecosystem

## Current Status

**Drift specification is still in design phase.**

This document outlines expected integration points based on known requirements. Will be updated when Drift spec is finalized.

## Expected Integration

### 1. Drift Detection

**Goal**: Identify projects following Drift conventions.

**Detection Method** (hypothetical):
- Scan for Drift marker file (e.g., `drift.yaml`, `drift.json`)
- Parse Drift metadata
- Extract standardized fields
- Mark project as Drift-compatible

**Example** (hypothetical):
```yaml
# drift.yaml
version: 1.0
name: My Project
owner: team-name
category: infrastructure | feature | utility | experiment
status: active | maintenance | sunset
dependencies:
  - project-name: my-service
    type: blocks | blocked-by | integrates-with
    version: ^1.0
```

**In Project Model**:
```javascript
{
  name: "project-name",
  drift_compatible: true,
  drift_metadata: {
    version: "1.0",
    owner: "team-name",
    category: "infrastructure",
    status: "active",
    dependencies: [...]
  }
}
```

### 2. Cross-Project Dependency Graph

**Goal**: Track project relationships and blockers.

From Drift `dependencies` field:
- Project A `blocks` Project B
- Project C `blocked-by` Project D
- Project E `integrates-with` Project F

**Use in Prioritization**:
- Project X is **blocked by** Project Y → lower X urgency until Y unblocked
- Project X **blocks** Projects Y, Z → raise X urgency (unblock others)
- Project X **integrates-with** Project Y → coordinate timing

**Data Structure**:
```javascript
{
  dependencies: [
    {
      project: "my-service",
      type: "blocks", // or "blocked-by", "integrates-with"
      version: "^1.0"
    }
  ]
}
```

**Computed**:
```javascript
{
  blocked_by: ["my-service"],           // this project is blocked
  blocks: ["feature-x", "feature-y"],   // this project blocks others
  integrates_with: ["shared-lib"]
}
```

### 3. Drift-Aware Prioritization

**Integration Points**:

#### Blocked Projects (Urgency Penalty)
```
urgency -= 10 if project.blocked_by.length > 0

reasoning: blocked projects can't progress, lower priority
```

#### Blocking Projects (Urgency Bonus)
```
urgency += 10 if project.blocks.length > 0

reasoning: unblock others, higher priority
```

#### Integration Dependencies (Coordination)
```
momentum_factor += 5 if project.integrates_with.length > 0
  and any integrated_projects have high velocity

reasoning: momentum from coordinated work
```

**Example**:
```
Project A (blocks Project B)
  base_urgency: 30
  blocking_bonus: +10
  final_urgency: 40 ← prioritized higher

Project B (blocked by Project A)
  base_urgency: 35
  blocked_penalty: -10
  final_urgency: 25 ← deprioritized until A unblocked
```

### 4. Team & Ownership Integration

**Expected Field** (from Drift):
```yaml
owner: team-name
contributors:
  - person-a
  - person-b
```

**Use in Meridian**:
- Filter projects by team (future feature)
- Show team ownership in UI
- Factor into prioritization (align with team capacity)

### 5. Project Categorization

**Expected Field** (from Drift):
```yaml
category: infrastructure | feature | utility | experiment | platform
```

**Use in Meridian**:
- Filter/sort by category
- Apply category-specific scoring weights
- Show category badges in UI

**Example Scoring Adjustments**:
- Infrastructure projects: +5 urgency (foundational)
- Experiments: -5 urgency (exploratory, lower priority)
- Features: normal scoring

## Implementation Phases

### Phase 1: Drift Detection (Sprint 1)
- [ ] Add Drift marker file detection to scan.js
- [ ] Parse Drift metadata (YAML or JSON)
- [ ] Include in project model
- [ ] Mark Drift-compatible projects in UI

### Phase 2: Dependency Graph (Sprint 2)
- [ ] Extract dependencies from Drift metadata
- [ ] Build dependency graph (computed on each scan)
- [ ] Expose via `/api/projects` (include "depends_on", "blocks", "integrates_with")
- [ ] Validate dependency graph (no circular deps, etc.)

### Phase 3: Drift-Aware Scoring (Sprint 2-3)
- [ ] Integrate blocking/blocked penalties into urgency calculation
- [ ] Update prioritization ranker
- [ ] Display dependency info in UI
- [ ] Show "Blocked By" alerts for stalled dependencies

### Phase 4: Team & Ownership (Sprint 3+)
- [ ] Parse team ownership from Drift
- [ ] Add team filter to UI
- [ ] Factor team capacity into prioritization
- [ ] Show team assignment badges

### Phase 5: Category & Ecosystem (Sprint 4+)
- [ ] Parse project category
- [ ] Apply category-specific scoring
- [ ] Build cross-category dashboards
- [ ] Ecosystem health visualization

## Compatibility Strategy

### What If a Project Doesn't Have Drift?

**Non-Drift projects continue to work normally**:
- Health scoring: yes (based on git activity)
- Lifecycle detection: yes (based on commit frequency)
- Prioritization: yes (based on progress and momentum)
- Dependencies: no (assumed independent)

**Drift Detection Graceful**:
```javascript
if (hasDriftMarker(projectPath)) {
  drift_metadata = parseDrift(projectPath);
} else {
  drift_metadata = null;  // project not Drift-compatible
  // continue without Drift features
}
```

### Hybrid Environments

Teams with **mixed projects** (some Drift, some not):
- Drift projects get dependency-aware prioritization
- Non-Drift projects use default prioritization
- Dashboard shows which projects are Drift-enabled
- Gradually migrate projects to Drift as needed

## Data Model Extension

**Project Model with Drift**:
```javascript
{
  name: "project-name",
  path: "/path/to/project",
  readme: {...},
  phases: [...],
  git_log: [...],
  github: {...},
  health_score: 78,
  lifecycle_stage: "ACTIVE",
  priority_score: 65,
  
  // NEW: Drift Integration
  drift_compatible: true,
  drift_metadata: {
    version: "1.0",
    owner: "team-x",
    category: "infrastructure",
    status: "active",
    dependencies: [
      {
        project: "my-service",
        type: "blocks",
        version: "^1.0"
      }
    ]
  },
  dependency_graph: {
    blocks: ["feature-x", "feature-y"],
    blocked_by: ["shared-lib"],
    integrates_with: ["analytics"]
  }
}
```

## API Extensions

**GET /api/projects** (updated response):
```json
{
  "projects": [
    {
      "name": "project-name",
      "health_score": 78,
      "lifecycle_stage": "ACTIVE",
      "priority_score": 65,
      "drift_compatible": true,
      "drift_metadata": {...},
      "dependency_graph": {
        "blocks": ["other-project"],
        "blocked_by": [],
        "integrates_with": ["shared-lib"]
      }
    }
  ]
}
```

**New: GET /api/dependency-graph** (future):
```json
{
  "projects": [...],
  "edges": [
    {
      "from": "project-a",
      "to": "project-b",
      "type": "blocks"
    }
  ]
}
```

## UI Integration

### Drift Badges
- "D" badge if project is Drift-compatible
- Hover tooltip: "Drift enabled"

### Dependency Indicators
- "🔗" icon if project has dependencies
- Hover tooltip: "Blocks 2 projects, blocked by 1"

### Dependency View
- Show dependency graph (DAG visualization)
- Highlight critical paths (deep dependency chains)
- Show blocked projects

### Alert Integration
- "🔴 Blocked By Project X" if dependency stalled
- "🟡 Unblock Others" if blocking projects

## Open Questions

1. **Drift Specification**: What is the exact format and required fields?
2. **Version Constraints**: How to handle version constraints in dependencies?
3. **Circular Dependencies**: How to detect/handle/report circular deps?
4. **Cross-Org Dependencies**: Support dependencies across organizations?
5. **Drift File Location**: Standard location (drift.yaml in root, .drift/, config/)?
6. **Validation**: What validation should Drift metadata pass (required fields, valid types)?
