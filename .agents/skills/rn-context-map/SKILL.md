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
4. Use GitNexus impact analysis for shared symbols. If unavailable, use targeted import/reference evidence and record `UNKNOWN_RISK` until resolved. Treat HIGH/CRITICAL as escalation and UNKNOWN/partial/truncated as unresolved.
5. Define explicit non-empty `writeScope`, `forbiddenScope`, serialized shared registry edits, risk, and narrow verification commands.
6. Record only repository files whose content materially supports the contract in `repository.dependencies`; compute their fingerprint with `repo-fingerprint.mjs`.
7. Write and validate the V2 `repo-contract.json` and WorkerReceipt. Do not edit the shared `index.json`; the serialized completion gate updates it.
8. Return only the compact WorkerReceipt. Return artifact paths, not source excerpts or analysis transcripts.
