# Stitch UI migration workflow V2

This is the current authoritative workflow. V1 remains only in `docs/agents/reference/stitch-ui-legacy.md` for historical context.

## Goal

Compile one requested Stitch screen into a bounded React Native implementation while minimizing model calls, repeated context, shell output, source retrieval, and repair loops. Deterministic scripts own mechanics; models own visual interpretation and hard implementation judgment.

## Runtime roles

| Role | Claude Code | Codex |
| --- | --- | --- |
| Orchestrator | Claude Opus 5, low | GPT-6 Astra, low |
| Stitch inspector | Claude Sonnet 5, high | GPT-5.6 Luna, max |
| RN context scout | Claude Sonnet 5, high | GPT-5.6 Luna, max |
| RN UI migrator | Claude Sonnet 5, high | GPT-5.6 Luna, max |
| Visual verifier | Claude Sonnet 5, high | GPT-5.6 Luna, max |

The workflow protocol is provider-neutral. Runtime files only select models, tools, permissions, and skill locations.

Runtime invariants:

- Orchestrators are thin control planes and retain only user constraints, the artifact-index path, task state, reason codes, and compact receipts.
- Workers receive bounded task arguments and artifact paths, never another worker's transcript or hidden reasoning.
- Stitch inspection and repository discovery are isolated. The RN migrator and verifier have no Stitch MCP access in their configured tool surfaces.
- One screen has one implementation writer by default. Workers may run in parallel only when their write ownership does not overlap.
- Every visual verification attempt uses a newly spawned verifier. UI repairs resume the original migrator instance.

## State machine

`INIT -> PREFLIGHT -> DISCOVER? -> READY -> IMPLEMENT -> CHECK -> VISUAL_VERIFY -> DONE`

`DISCOVER` is conditional. `REPAIR` returns to the same migrator, while `REPLAN` requires new architectural or design judgment. `BLOCKED` is reserved for an unavailable required capability, unresolved risk, exhausted retry, or a final gate that cannot pass.

Mechanical state transitions come from `scripts/agents/workflow-state.mjs`; do not recreate its scheduling logic in prompts.

## 1. INIT and PREFLIGHT

The orchestrator:
1. Parses only the requested screen/project identifiers and explicit user constraints.
2. Inspects working-tree status.
3. Checks `.stitch/<screen>/manifest.json` and the screen artifact index before choosing required capabilities.
4. Runs `scripts/agents/agent-health.mjs`, marking only task-required capabilities with `--require` and optionally saving the result with `--out`.
5. Initializes `artifacts/stitch/<screen>/index.json` and `run.json` through the deterministic utilities.
6. Does not fetch Stitch, inspect generated HTML, deep-read source, or write implementation code.

The orchestrator is the control plane. It tracks task state, risk, ownership, artifact paths, and pass/fail receipts.

Health reports structured status for Stitch MCP, CodeGraph, GitNexus, Expo documentation access, Playwright/browser capture, RTK, repository writability, branch, HEAD, and worktree status. Optional unavailable capabilities select a fallback; only a required unavailable capability fails the preflight.

## 2. Cache and freshness gate

Stitch evidence is cache-first. `scripts/stitch/cache.mjs status` accepts the target project/screen IDs and returns a hit only when the manifest target, referenced files, and hashes are valid. `--refresh` deliberately invalidates the cache. On a miss, the inspector calls Stitch once for the exact target and passes hosted URLs to `cache.mjs fetch`; the script owns downloading, stable naming, dimensions, hashes, asset evidence, and the source fingerprint. Hosted URLs are not persisted by default.

Repository freshness uses the file dependency list recorded by the RepoContract, not repository HEAD. `repo-fingerprint.mjs` hashes only those relevant files. Adding a newly relevant dependency requires repository discovery; otherwise content changes in those files invalidate the contract automatically.

`artifact-freshness.mjs` selects one branch:

| Branch | Design | Repository | Work |
| --- | --- | --- | --- |
| `00` | fresh | fresh | skip discovery |
| `01` | fresh | stale | repository scout only |
| `10` | stale | fresh | Stitch inspector only |
| `11` | stale | stale | both independently, in parallel |

Never re-fetch Stitch or rerun both discovery branches merely because a workflow session is new.

## 3. DISCOVER — conditional read-heavy fan-out

Start only the discovery branches selected by freshness. In branch `11`, start these independently and in parallel:

### A. Stitch inspector

Input is a small task packet containing target identifiers and output path.

Use the `stitch-inspect` skill.

On a design cache miss, retrieval order is:
1. Fetch the exact requested Stitch screen.
2. Fetch/reference the screenshot.
3. Resolve appearance from the screenshot.
4. Fetch generated HTML only for concrete ambiguities.
5. Fetch only assets referenced by the target screen.

Do not inspect repository architecture.

The cache helper writes:
- `.stitch/<screen>/reference.png`
- `.stitch/<screen>/source.html` only when needed
- `.stitch/<screen>/assets/*` only when needed
- `artifacts/stitch/<screen>/design-contract.json`

When a prior design contract exists, snapshot it before replacement and run `contract-diff.mjs` afterward. The compact `design-contract-diff.json` is an optimization for iterative work; the current DesignContract remains authoritative.

Return only a WorkerReceipt.

### B. RN context scout

Use the `rn-context-map` skill.

Do not inspect Stitch.

Locate only:
- route and screen owner
- parent layout / safe-area ownership
- existing reusable components
- design tokens and typography
- icon/font patterns
- state/data patterns required by the screen
- impacted shared symbols
- narrow verification commands
- explicit write scope and risk

Use CodeGraph first when available. Use GitNexus for impact/risk where required.

Write `artifacts/stitch/<screen>/repo-contract.json` with a narrow dependency fingerprint.

Return only a WorkerReceipt.

## 4. Artifact lifecycle and READY gate

Every V2 artifact has `schemaVersion: 2` and a provider-neutral `artifactType`. Workers validate their output with `validate-artifact.mjs` before returning a receipt. The scheduler validates the receipt and its referenced artifact again before advancing. It serializes task completion and updates the shared artifact index itself, so parallel discovery workers never race on that file. Invalid output returns `ARTIFACT_INVALID` to the same worker for one bounded correction; the orchestrator does not interpret malformed JSON.

`artifacts/stitch/<screen>/index.json` is the screen-level pointer to the source manifest, design/repository contracts, design delta, implementation result, verification result, reference/actual screenshots, and comparison metadata. The orchestrator passes this path and compact WorkerReceipts instead of contract bodies.

Implementation may start only when:
- required discovery tasks are `done` and fresh ones are `skipped`
- design uncertainties are resolved or explicitly accepted through `uncertaintiesAccepted`
- repository risk is not unresolved HIGH/CRITICAL/UNKNOWN
- planned write scopes do not conflict
- required artifact paths exist

Do not copy contract bodies through the orchestrator. Pass their paths.

If design uncertainty exists, resume the same Stitch inspector with only the unresolved questions.

If repository risk requires architectural judgment, spawn a bounded planner only for that uncertainty; do not make planning a default stage.

## 5. IMPLEMENT

Use one `rn-ui-migrator` as the default owner for a single screen.

Input:
- design-contract path
- repo-contract path
- reference screenshot path
- allowed/forbidden scope
- acceptance criteria

The migrator:
1. Reads the contracts directly.
2. Reads only source files named or implied by the repo contract.
3. Does not call Stitch MCP.
4. Implements hierarchy and geometry first.
5. Applies typography/tokens next.
6. Adds required assets/icons/fonts.
7. Implements requested interactions.
8. Handles safe-area, scrolling, keyboard, and responsive behavior when relevant.
9. Runs scoped checks.
10. Writes `implementation.json` and returns a WorkerReceipt.

The implementation task cannot start with an empty write scope. `ownership-gate.mjs` normalizes path claims and serializes overlapping file/directory writes. Shared route, theme, icon, package, and other registries are explicit `sharedEdits`; even additive edits are serialized unless a future scheduler can prove safety.

Do not split font/icon workers for a one-screen migration unless a shared foundation is needed by at least two concurrent screens.

## 6. CHECK

Run deterministic gates before visual review:
- targeted typecheck/lint/tests when available
- `npm run typecheck`
- `npm run lint`
- relevant Expo route/export/startup check
- scope/file-ownership validation

If a deterministic check fails, resume the same migrator instance with only the failing command/output and correction scope. Mark pre-existing failures `BASELINE_FAILURE`; do not make them disappear into a generic retry.

## 7. VISUAL_VERIFY

Start a fresh `visual-verifier`.

The verifier:
- does not inspect implementation reasoning
- does not fetch Stitch again
- reads the design contract, current diff, reference screenshot, and affected route
- captures current UI evidence
- records the actual viewport and optional bounding boxes for contract-declared key test IDs
- exercises requested interactions when possible
- generates an advisory pixel diff/comparison and candidate mismatch regions
- semantically compares expected vs observed appearance
- records actionable P0/P1/P2 deltas
- does not edit source code

Write:
- `artifacts/stitch/<screen>/qa/actual.png`
- `artifacts/stitch/<screen>/qa/comparison.png` when useful
- `artifacts/stitch/<screen>/qa/capture.json` and `diff.json` when helpers are available
- `artifacts/stitch/<screen>/qa/verification.json`

Return only a WorkerReceipt.

If visual verification cannot be performed, return `blocked`/`unverified`; never claim visual pass from typecheck alone.

`capture-route.mjs` captures a web route at the DesignContract viewport. `visual-diff.mjs` writes a reference/actual/diff composite and ranks candidate mismatch tiles. Rendering varies by platform, fonts, and antialiasing, so mismatch percentage is informational only and never determines pass/fail.

## 8. Retry and repair policy

On a verifier failure:
1. The orchestrator forwards only the verification artifact path plus allowed correction scope.
2. Resume the same migrator.
3. Do not resend the full contracts if that worker context is being resumed.
4. Start a new fresh verifier after the repair.

Maximum default repair loops: 2. Then replan.

Stable reason codes keep branching compact:

| Reason | Scheduler response |
| --- | --- |
| `MCP_UNAVAILABLE` | retry once if Stitch is required; otherwise use cached evidence/fallback |
| `RTK_UNAVAILABLE` | use the equivalent raw command without failing the workflow |
| `ARTIFACT_INVALID` | same worker corrects its artifact, bounded by task attempts |
| `CHECK_FAILED` | same migrator receives exact failure evidence |
| `VISUAL_MISMATCH` | same migrator repairs; next verification uses a fresh verifier |
| `HIGH_RISK`, `CRITICAL_RISK`, `UNKNOWN_RISK`, `DESIGN_UNCERTAINTY` | stop blind retries and request/replan semantic resolution |
| `WRITE_CONFLICT` | serialize conflicting tasks |
| `BASELINE_FAILURE` | preserve and report separately |
| `RETRY_EXHAUSTED` | enter `REPLAN` or `BLOCKED` |

Transient MCP/network failures have at most one bounded retry. Visual repair has at most two loops. Optional tool absence always has a safe fallback; required tool absence blocks honestly.

CodeGraph falls back to targeted source reads. GitNexus falls back to targeted import/reference evidence with explicit `UNKNOWN_RISK` until resolved. Browser capture may fall back to an available native capture path. RTK always falls back to raw commands. None of CodeGraph, GitNexus, RTK, or a particular browser runner is a correctness dependency by itself.

## 9. Final gate

Before declaring DONE:
- deterministic checks pass or baseline failures are clearly separated
- verification has no unresolved P0/P1/P2 mismatch required by acceptance criteria
- changed files are within allowed scope
- GitNexus change analysis is complete where applicable
- unrelated working-tree changes remain untouched
- the final verification came from a fresh verifier and its V2 artifact validates

Committing, pushing, rebasing, or opening a PR is outside the core `stitch-ui` workflow unless the user explicitly requests delivery.

## Scheduler responsibilities

`workflow-state.mjs` owns dependencies, ready tasks, maximum concurrency (3), maximum delegation depth (1), freshness skips, writer-instance tracking, write conflicts, correction counts, retry decisions, and final gate state. It requires unique verifier instance IDs and requires repair attempts to reuse the original migrator ID.

Models retain semantic work: interpreting visual evidence, resolving ambiguous architecture/product intent, and making difficult implementation choices. The scheduler is intentionally screen-workflow-specific, not a general orchestration framework.

## RTK command policy

Use RTK only for commands the installed version documents. Prefer compact forms for supported Git, file inspection/search, diffs, and supported test runners. Do not blindly prepend `rtk`, run compact and raw forms by default, or double-prefix commands when a runtime auto-rewrite hook is active. Fall back to raw commands if RTK is absent, and use exact raw output when compact evidence is insufficient. RTK does not replace CodeGraph architecture queries or GitNexus impact/change analysis.

Examples supported by the currently validated RTK release include `rtk git status`, `rtk git diff`, `rtk git log -n 10`, `rtk ls <path>`, `rtk read <file>`, `rtk grep "<pattern>" <path>`, `rtk find "<pattern>" <path>`, `rtk vitest`, and `rtk playwright test`. Recheck the installed version before relying on additional wrappers.

## Metrics

RunState stores operational facts only: wall time, worker count, peak parallelism, correction loops, Stitch fetch/cache hits, artifact cache hits, capability status, and optional RTK savings when cheaply available. Never store hidden reasoning or conversation transcripts.

## Deterministic utilities

| Utility | Responsibility |
| --- | --- |
| `scripts/agents/agent-health.mjs` | structured capability preflight |
| `scripts/stitch/cache.mjs` | cache status, download, normalize, hash, dimensions, source manifest |
| `scripts/stitch/artifact-freshness.mjs` | `00`/`01`/`10`/`11` discovery branch |
| `scripts/stitch/repo-fingerprint.mjs` | narrow repository dependency fingerprint |
| `scripts/stitch/contract-diff.mjs` | compact iterative DesignContract delta |
| `scripts/agents/validate-artifact.mjs` | JSON Schema plus semantic validation |
| `scripts/agents/artifact-index.mjs` | compact screen artifact pointers |
| `scripts/agents/workflow-state.mjs` | DAG, retries, metrics, worker identity, final gate |
| `scripts/agents/ownership-gate.mjs` | write-conflict detection |
| `scripts/qa/capture-route.mjs` | route screenshot, actual viewport, optional layout probes |
| `scripts/qa/visual-diff.mjs` | advisory diff/comparison and mismatch regions |

## Multi-screen extension

For multiple screens:
1. inspect target designs independently
2. map repository context once where facts are shared
3. detect shared foundation work
4. implement shared foundation before dependent screens
5. parallelize screen writers only when their write sets do not overlap
6. verify each screen independently

Default maximum parallel workers: 3.
Default delegation depth: 1.

## Runtime commands

Claude Code: `/stitch-ui`, `/stitch-inspect`, `/rn-context-map`, `/rn-ui-migrate`, `/visual-verify`, `/agent-health`.

Codex: `$stitch-ui`, `$stitch-inspect`, `$rn-context-map`, `$rn-ui-migrate`, `$visual-verify`, `$agent-health`.
