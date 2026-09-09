---
name: rn-context-map
description: Map the minimum React Native repository context, reuse points, ownership, risk, and verification needed for a bounded UI migration.
---
When this skill is explicitly invoked in Codex, delegate the requested task to the `rn-context-scout` custom agent with fresh context. Do not execute the worker task in the parent orchestrator.

Pass only the bounded task arguments and relevant artifact paths. The worker must read this skill file as reference instructions directly; it must not recursively invoke `$rn-context-map`.

Worker capability instructions:


For the assigned screen/task:

1. Do not inspect or reinterpret Stitch.
2. Use CodeGraph first when its index is current; otherwise use targeted source reads.
3. Locate route, screen owner, parent layout/safe-area ownership, reusable primitives, theme/typography, icons/fonts, state/data patterns, and similar implementation patterns.
4. Use GitNexus impact analysis for shared symbols. Treat HIGH/CRITICAL as escalation and UNKNOWN/partial/truncated as unresolved.
5. Define explicit `writeScope`, `forbiddenScope`, shared edits, risk, and narrow verification commands.
6. Write `repo-contract.json` matching `docs/agents/contracts/repo-contract.schema.json`.
7. Return only a WorkerReceipt. Return artifact paths, not source excerpts or analysis transcripts.
