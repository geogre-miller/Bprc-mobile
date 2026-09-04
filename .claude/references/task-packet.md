# Task packet

The delegation contract between the orchestrator and a worker. Fill it with exact facts, not narrative. Omit a field only when it does not apply to the task type.

Include the `SOURCE_OF_TRUTH.design` and `VISUAL_SPEC` blocks for design work. Omit both for refactors, bug fixes, and other non-visual work; `stitch-screen-spec` fills them from a referenced Stitch screen.

```yaml
TASK:
  objective:
  type: ui-implementation | refactor | bugfix | feature | investigation

TARGET:
  route:
  files: []

SOURCE_OF_TRUTH:
  design:
    provider: stitch
    project_id:
    screen_id:
  repository:
    design_system: DESIGN.md

REPO_FACTS:
  navigation: expo-router
  styling: react-native-stylesheet
  state: async-storage
  theme: src/constants/theme.ts
  reusable: []

VISUAL_SPEC:
  hierarchy: []
  geometry: {}
  spacing: {}
  typography: {}
  colors: {}
  borders_and_radius: {}
  assets: []
  states: []
  safe_area:
  keyboard:
  scrolling:
  responsive:
  uncertainties: []

RELEVANT_FACTS: []

IMPLEMENTATION_DECISIONS:
  reuse: []
  create: []

RISK:
  verdict:
  impacted_symbols:
  affected_flows: []

CONSTRAINTS: []
ACCEPTANCE_CRITERIA: []
ALLOWED_SCOPE: []
FORBIDDEN_SCOPE: []

VERIFICATION:
  commands: []
  visual_reference:

EXPECTED_RETURN:
  - status
  - changed_files
  - checks
  - deviations
  - blockers
```
