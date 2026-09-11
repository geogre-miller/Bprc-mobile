# Record Sale / journal handoff

Start with `index.json` for the cached design, implementation, and final verification pointers. Run `node scripts/stitch/artifact-freshness.mjs --screen record-sale` before reusing contracts. The repository contract is a **pre-implementation discovery snapshot**; its fingerprint is intentionally stale after implementation. Refresh repository discovery before using its write scope for new work.

- `/journal` is implemented in `src/screens/selling-journal/index.tsx`. Inventory's lot sale action and commodity detail's sale actions navigate here with commodity, price, and optional stock/cost/buyer parameters. These entry-point changes are included in the delivery commit; the original workflow's one-file ownership describes the earlier migration only.
- `.stitch/record-sale/manifest.json`, `reference.png`, and `source.html` preserve the exact Stitch screen (project `16177202758777999982`, screen `3a110d9124cd41038e0c19c5b0ee6a33`). Validate the manifest hashes before fetching again. The source image is a 136×512 JPEG despite its historical `.png` filename; QA records the conversion and viewport assumptions.
- `design-contract.json` records appearance. `implementation.json` records implemented behavior, checks, and deviations. Its final behavior supersedes the discovery contract's native-header and inventory-reconciliation notes.
- `qa/verification.json` and `qa/actual-390x1392.png` are the final visual verdict and capture. The save label uses a literal `&`. The report identifies fresh checks and reused functional evidence, including repeated inventory deductions from 2,500 to 1,300 to 800 kg across reloads.
- Other QA captures, receipts, `health.json`, and `run.json` preserve migration history. Debug/pre-repair images are historical, and environment-specific paths or branch names are not current setup instructions. Rebuild any temporary web export before testing it.

## Persistence and limitations

Sales retain the existing `SellingJournalEntry` shape under `rayGia:selling-journal`, which feeds dashboard metrics. Successful saves also update commodity quantities in `rayGia:inventory`. Writes are sequential with best-effort journal rollback if inventory persistence fails; they are not a database transaction. Delivery date, shipping cost, and order note are local form values, not additional persisted journal fields. Margin is cost-based (51.9% for the design example); the displayed net profit includes entered shipping.

The final review was on the web route at 390×1392. Typecheck, changed-screen lint, and web export passed. Full lint retains the pre-existing `src/hooks/use-color-scheme.web.ts:11` `react-hooks/set-state-in-effect` error. Passing historical screenshots do not validate later edits or native-device behavior.
