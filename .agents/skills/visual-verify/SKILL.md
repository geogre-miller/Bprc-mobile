---
name: visual-verify
description: Independently verify a current React Native implementation against its prepared Stitch contract and reference evidence without editing source.
---
When this skill is explicitly invoked in Codex, delegate the requested task to the `visual-verifier` custom agent with fresh context. Do not execute the worker task in the parent orchestrator.

Pass only the bounded task arguments and relevant artifact paths. The worker must read this skill file as reference instructions directly; it must not recursively invoke `$visual-verify`.

Worker capability instructions:


1. Read the design contract, current diff, affected route, and reference screenshot.
2. Do not fetch Stitch again and do not inspect the implementer's reasoning.
3. Run the narrow functional checks required for verification.
4. Launch/capture the affected UI with the repository's available web/native verification path.
5. Exercise required interactions when the environment supports them.
6. Compare expected vs observed appearance and record only actionable P0/P1/P2 deltas.
7. If visual evidence cannot be captured, return `blocked`; typecheck alone is not visual proof.
8. Do not edit source files.
9. Write `qa/verification.json` matching `docs/agents/contracts/verification-result.schema.json` plus screenshot evidence where possible.
10. Return only a WorkerReceipt.
