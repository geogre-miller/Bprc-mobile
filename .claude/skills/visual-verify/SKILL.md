---
name: visual-verify
description: Independently verify a current React Native implementation against its prepared Stitch contract and reference evidence without editing source.
context: fork
agent: visual-verifier
background: false
---

1. Read the validated design contract, current implementation diff, affected route, artifact index, and cached reference screenshot.
2. Do not fetch Stitch again and do not inspect the implementer's reasoning.
3. Run the narrow functional checks required for verification.
4. Launch/capture the affected UI at the reference viewport. Prefer `capture-route.mjs` for web evidence and optional key-element probes.
5. Run `visual-diff.mjs` to produce advisory comparison evidence and candidate mismatch regions; never use its pixel ratio as the final verdict.
6. Exercise the concise interactions listed in `verificationHints` when the environment supports them.
7. Independently compare expected vs observed layout, typography, color, assets, safe areas, scrolling, and states; record only actionable P0/P1/P2 deltas.
8. If visual evidence cannot be captured, return `blocked`; typecheck alone is not visual proof.
9. Do not edit source files.
10. Write and validate V2 `qa/verification.json`, then return only a validated WorkerReceipt. The serialized completion gate updates `index.json`.
