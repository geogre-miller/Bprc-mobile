---
name: stitch-ui
description: Run the bounded Stitch-to-React-Native migration workflow for one or more requested screens.
argument-hint: "<screen-or-screen-id> [project/screen constraints]"
disable-model-invocation: true
context: fork
agent: orchestrator
background: false
---

Execute the Stitch UI migration workflow for: $ARGUMENTS

Follow `docs/agents/workflows/stitch-ui.md`.

Keep orchestration state small:
- use `agent-health.mjs`, `artifact-freshness.mjs`, `workflow-state.mjs`, and `ownership-gate.mjs` for mechanical decisions
- run only the discovery branches selected by freshness (`00`, `01`, `10`, or `11`)
- dispatch independent Stitch inspection and RN context mapping in parallel only when both are stale
- hold the screen artifact-index path and compact WorkerReceipts, never worker transcripts
- use one UI writer per screen
- validate every worker artifact before advancing
- run deterministic checks and ownership gates before a fresh visual verifier
- resume the same migrator for at most two repair loops
- do not commit/push unless the user explicitly requested delivery
