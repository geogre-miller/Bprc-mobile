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
- dispatch independent Stitch inspection and RN context mapping in parallel
- consume WorkerReceipts rather than worker transcripts
- route artifact paths instead of copying artifact bodies
- use one UI writer per screen
- run deterministic gates before a fresh visual verifier
- resume the same migrator for at most two repair loops
- do not commit/push unless the user explicitly requested delivery
