---
name: stitch-inspect
description: Inspect one exact Stitch screen and compile its visual facts into a design contract without interpreting repository architecture.
context: fork
agent: stitch-inspector
background: false
---

For the assigned Stitch screen:

1. Run `node scripts/stitch/cache.mjs status ...`; on a hit, use the manifest and do not call Stitch.
2. On a miss, fetch only the exact target through Stitch MCP. Pass hosted URLs to `cache.mjs fetch` so the script downloads, names, hashes, dimensions, and manifests evidence.
3. Use the normalized reference screenshot as primary visual evidence. Fetch generated HTML only for a concrete ambiguity and only target-referenced assets.
4. Do not inspect repository architecture or implementation.
5. If replacing an earlier contract, snapshot it before writing and run `contract-diff.mjs` afterward.
6. Write a V2 `design-contract.json`, including concise verification hints when the design makes them clear.
7. Record unresolved facts in `uncertainties`; do not guess. Set `uncertaintiesAccepted` only from explicit user/product acceptance.
8. Validate the contract and WorkerReceipt with `validate-artifact.mjs`. Do not edit the shared `index.json`; the serialized completion gate updates it.
9. Return only the compact WorkerReceipt path/result.

Do not paste the design contract into the receipt. Return its path.
