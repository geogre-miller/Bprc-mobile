# Bprc Mobile agent protocol

This file contains durable repository rules shared by Claude Code and Codex. Keep runtime-specific model/tool configuration in `.claude/` and `.codex/`.

## Repository architecture

- Expo SDK 57, React Native, TypeScript, Expo Router typed routes.
- `src/app` contains thin route adapters. Screen implementations belong under `src/screens/<feature>/`.
- Use React Native `StyleSheet`; do not migrate styling technology unless explicitly requested.
- Reuse `Colors`, `Spacing`, `Radius`, typography variants, themed components, and existing primitives before adding local constants.
- `DESIGN.md` is authoritative for repository design tokens and reusable visual conventions.
- A referenced Stitch screen is authoritative for that screen's appearance; the repository is authoritative for architecture and implementation patterns.
- Determine whether a parent already owns safe-area insets before adding safe-area handling.
- Use `FlatList`/`SectionList` for dynamic collections and `ScrollView` for bounded content.

## Context economy

- Gather facts, not files.
- Agents exchange artifacts and receipts, not transcripts or hidden reasoning.
- Do not send full parent conversation history to workers.
- Workers read artifact paths directly when they need detailed state.
- Prefer one bounded source owner for implementation. Parallelize independent read-heavy discovery first.
- Do not make an agent rediscover facts already recorded in an authoritative contract.
- Prefer deterministic health, cache, fingerprint, schema-validation, ownership, scheduling, and visual-evidence scripts over model interpretation of command prose.
- Keep only the screen artifact-index path and compact WorkerReceipts in orchestrator context.

## Shell output and RTK

- Use RTK when available only for command forms documented by the installed RTK version, especially supported Git, file inspection/search, diff, and test-runner commands.
- Do not blindly prepend `rtk`, run both RTK and raw commands by default, or double-prefix a command when a Claude/Codex auto-rewrite integration is active.
- Claude Code and Codex RTK integrations are installed independently; detect the active runtime integration instead of assuming the other runtime configured it.
- Fall back to the raw command when RTK is absent. Use raw output when exact, unfiltered evidence is needed to diagnose a failure.
- RTK is output compression, not code intelligence: keep CodeGraph for architecture/flow queries and GitNexus for impact/change analysis.

## Code intelligence

When `.codegraph/` is current, use CodeGraph first to locate relevant symbols and execution paths. Fall back to narrow `Read`, `Grep`, or `Glob` when the index is unavailable, stale, or does not cover the target.

Before changing a shared or broadly reused symbol, use GitNexus impact analysis. Treat `HIGH`/`CRITICAL` as escalation conditions. Treat `UNKNOWN`, partial, or truncated results as unresolved and confirm with targeted source inspection.

If GitNexus is unavailable, use targeted import/reference inspection as the fallback and record `UNKNOWN_RISK` until the evidence resolves the relevant write scope. The tool itself is optional; unresolved architectural risk is not.

Before committing code changes, run GitNexus change analysis. A partial or truncated result is not a clean gate.

## Expo facts

Before writing code against an Expo or Expo Router API not already established in this repository, verify the exact Expo SDK 57 API surface from the versioned Expo documentation.

## Working tree

- Inspect `git status` before edits.
- Preserve unrelated or unfinished user changes.
- Keep each worker inside an explicit write scope.
- Never allow concurrent workers to write the same file.
- Make the smallest complete change satisfying the task.

## Verification

Run the narrowest relevant checks first. Implementation work should normally finish with:

```bash
npm run typecheck
npm run lint
```

Report baseline failures separately from failures introduced by the task.

## Stitch UI workflow

For Stitch-to-React-Native work, follow `docs/agents/workflows/stitch-ui.md`.

Manual workflow entry:
- Claude Code: `/stitch-ui <target>`
- Codex: `$stitch-ui <target>`

Deterministic runtime diagnostics:
- Claude Code: `/agent-health [--require <capability>]`
- Codex: `$agent-health [--require <capability>]`

The legacy `docs/agents/reference/stitch-ui-legacy.md` is historical reference only and must not be loaded as a prerequisite for new work.
