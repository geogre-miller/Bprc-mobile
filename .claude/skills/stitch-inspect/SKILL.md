---
name: stitch-inspect
description: Inspect one exact Stitch screen and compile its visual facts into a design contract without interpreting repository architecture.
context: fork
agent: stitch-inspector
background: false
---

For the assigned Stitch screen:

1. Fetch only the exact target through Stitch MCP.
2. Use the reference screenshot as primary visual evidence.
3. Fetch generated HTML only to resolve concrete ambiguities.
4. Fetch only assets referenced by the target.
5. Do not inspect repository architecture or implementation.
6. Cache target evidence under `.stitch/<screen>/`.
7. Write `design-contract.json` matching `docs/agents/contracts/design-contract.schema.json`.
8. Record unresolved facts in `uncertainties`; do not guess.
9. Return only a WorkerReceipt matching `docs/agents/contracts/worker-receipt.schema.json`.

Do not paste the design contract into the receipt. Return its path.
