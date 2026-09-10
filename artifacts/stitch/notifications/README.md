# Notifications artifacts

Start with `index.json` for the design, repository, implementation, and verification pointers. Run `node scripts/stitch/artifact-freshness.mjs --screen notifications` before reusing a contract; a passing past review does not validate later code changes.

- `repo-contract.json` describes the current `src/screens/notifications` owner, nested Home stack, shared five-tab navbar, and bottom inset handling.
- `design-contract.json` records Stitch appearance. Its `userOverrides` take precedence over the illustrative Stitch navbar.
- `implementation.json` records scope, checks, and current limitations.
- `qa/final-review.md`, `qa/unread-dot-fixed.png`, and `qa/bottom-inset-fixed.png` are the final follow-up layout evidence.
- `qa/verification.json` preserves the independent navigation review and separately records the later rename/dot/spacing inspection.
- `qa/home-return-single-tap.png` and `qa/final-review.md` document the later Home-tab reset fix. This supersedes earlier evidence describing preserved Notifications state on the first Home tap.
- Other QA screenshots, worker receipts, `health.json`, and `run.json` are historical migration evidence. They may contain the old owner name, environment-specific paths, or earlier layouts; do not treat them as current instructions or rerun old commands blindly.

The original hosted source is cached under `.stitch/notifications`. Reuse it when the source manifest hashes validate. Backend notification delivery, durable read state, card destination flows, and threshold-setting behavior are not implemented by these artifacts.
