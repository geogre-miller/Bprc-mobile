# Stitch UI migration workflow

## Goal

Compile one requested Stitch screen into a bounded React Native implementation with minimum repeated context.

## Runtime roles

| Role | Claude Code | Codex |
| --- | --- | --- |
| Orchestrator | Claude Opus 5, low | GPT-6 Astra, low |
| Stitch inspector | Claude Sonnet 5, high | GPT-5.6 Luna, max |
| RN context scout | Claude Sonnet 5, high | GPT-5.6 Luna, max |
| RN UI migrator | Claude Sonnet 5, high | GPT-5.6 Luna, max |
| Visual verifier | Claude Sonnet 5, high | GPT-5.6 Luna, max |

The workflow protocol is provider-neutral. Runtime files only select models, tools, permissions, and skill locations.

## State machine

`INIT -> DISCOVER -> READY -> IMPLEMENT -> CHECK -> VISUAL_VERIFY -> DONE`

Failures:
- contract uncertainty -> targeted rediscovery
- deterministic check failure -> resume the same UI migrator with only the failing evidence
- visual mismatch -> resume the same UI migrator with the verification artifact path
- two unsuccessful repair loops -> `REPLAN`

## 1. INIT

The orchestrator:
1. Parses only the requested screen/project identifiers and explicit user constraints.
2. Inspects working-tree status.
3. Creates `artifacts/stitch/<screen>/run.json`.
4. Does not fetch Stitch, inspect generated HTML, deep-read source, or write implementation code.

The orchestrator is the control plane. It tracks task state, risk, ownership, artifact paths, and pass/fail receipts.

## 2. DISCOVER — parallel read-heavy fan-out

Start these independently and in parallel:

### A. Stitch inspector

Input is a small task packet containing target identifiers and output path.

Use the `stitch-inspect` skill.

Retrieval order:
1. Fetch the exact requested Stitch screen.
2. Fetch/reference the screenshot.
3. Resolve appearance from the screenshot.
4. Fetch generated HTML only for concrete ambiguities.
5. Fetch only assets referenced by the target screen.

Do not inspect repository architecture.

Write:
- `.stitch/<screen>/reference.png`
- `.stitch/<screen>/source.html` only when needed
- `.stitch/<screen>/assets/*` only when needed
- `artifacts/stitch/<screen>/design-contract.json`

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

Write `artifacts/stitch/<screen>/repo-contract.json`.

Return only a WorkerReceipt.

## 3. READY gate

Implementation may start only when:
- both discovery receipts are `done`
- design uncertainties are resolved or explicitly accepted
- repository risk is not unresolved HIGH/CRITICAL
- planned write scopes do not conflict
- required artifact paths exist

Do not copy contract bodies through the orchestrator. Pass their paths.

If design uncertainty exists, resume the same Stitch inspector with only the unresolved questions.

If repository risk requires architectural judgment, spawn a bounded planner only for that uncertainty; do not make planning a default stage.

## 4. IMPLEMENT

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

Do not split font/icon workers for a one-screen migration unless a shared foundation is needed by at least two concurrent screens.

## 5. CHECK

Run deterministic gates before visual review:
- targeted typecheck/lint/tests when available
- `npm run typecheck`
- `npm run lint`
- relevant Expo route/export/startup check
- scope/file-ownership validation

If a deterministic check fails, resume the same migrator with only the failing command/output and correction scope.

## 6. VISUAL_VERIFY

Start a fresh `visual-verifier`.

The verifier:
- does not inspect implementation reasoning
- does not fetch Stitch again
- reads the design contract, current diff, reference screenshot, and affected route
- captures current UI evidence
- exercises requested interactions when possible
- compares expected vs observed appearance
- records actionable P0/P1/P2 deltas
- does not edit source code

Write:
- `artifacts/stitch/<screen>/qa/actual.png`
- `artifacts/stitch/<screen>/qa/comparison.png` when useful
- `artifacts/stitch/<screen>/qa/verification.json`

Return only a WorkerReceipt.

If visual verification cannot be performed, return `blocked`/`unverified`; never claim visual pass from typecheck alone.

## 7. Repair loop

On a verifier failure:
1. The orchestrator forwards only the verification artifact path plus allowed correction scope.
2. Resume the same migrator.
3. Do not resend the full contracts if that worker context is being resumed.
4. Start a new fresh verifier after the repair.

Maximum default repair loops: 2. Then replan.

## 8. Final gate

Before declaring DONE:
- deterministic checks pass or baseline failures are clearly separated
- verification has no unresolved P0/P1/P2 mismatch required by acceptance criteria
- changed files are within allowed scope
- GitNexus change analysis is complete where applicable
- unrelated working-tree changes remain untouched

Committing, pushing, rebasing, or opening a PR is outside the core `stitch-ui` workflow unless the user explicitly requests delivery.

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
