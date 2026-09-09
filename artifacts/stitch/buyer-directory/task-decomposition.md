# Buyer Directory task decomposition

All workers must follow `implementation-spec.md`. File ownership is non-overlapping.

## Dependency graph

```text
T1 font binding ─────┐
T2 icon mappings ───┼─> T3 screen implementation -> orchestrator integration/verification
                    └─> T4 independent diff/spec review (read-only, after T3)
```

## T1 — screen-local fonts

- Owner: one implementation subagent.
- Files: `src/screens/buyer-list/fonts.ts` only.
- Scope: bind the existing six Manrope/Public Sans TTF files under Buyer Directory-specific family names and expose one load-readiness hook following `src/screens/account/fonts.ts`.
- Patterns: `expo-font` `useFonts`; render-ready on either successful load or error.
- Acceptance: no global font changes, no asset edits, no package changes, TypeScript-valid exported constants/hook.

## T2 — missing icon mappings

- Owner: one implementation subagent.
- Files: `src/screens/home-dashboard/icons.tsx` only.
- Scope: add nearest cross-platform Expo Symbols mappings for `verified_user`, `workspace_premium`, `local_florist`, `fact_check`, `send`, and `open_in_new`.
- Patterns: preserve the current `{ ios, other } as const` map and `IconName` derivation.
- Acceptance: existing names remain byte-for-byte semantically unchanged; only required keys are added; no new library or custom SVG.

## T3 — Buyer Directory screen

- Owner: one implementation subagent after this specification exists; it may work concurrently with T1/T2 because imports are predetermined.
- Files: `src/screens/buyer-list/index.tsx` only.
- Scope: implement the full universal screen, local Stitch display data, helpers, filters/search, call/detail navigation, quotation modal, toast, responsive/safe-area layout, and exact styles/content from the spec.
- Patterns: Market Prices for header/search/filter/modal mechanics, Profile for source assets/screen-local font usage, existing `Link` adapters for routing.
- Acceptance: no changes outside the owned file; route adapter and shared mock data unchanged; all controls work; no blank top gap; screen compiles once T1/T2 land.

## T4 — independent implementation review

- Owner: a read-only review subagent after T1–T3 finish.
- Files: no edits.
- Scope: compare the combined diff with this specification and flag architecture violations, missing interactions, unsafe platform behavior, and likely visual mismatches.
- Acceptance: return an actionable list with file/line references, or explicitly report no issues; do not rewrite code.

## Orchestrator-only integration and QA

- Review every worker diff and resolve inconsistencies.
- Run targeted format/lint, full typecheck, appropriate lint/export checks, and GitNexus `detect_changes`.
- Render actual `/buyers` at `390 × 884` and full-page state with the previously approved local Chrome/Playwright path.
- Put reference and implementation into the same comparison image, run the Product Design QA rubric, fix all P0/P1/P2 issues, and overwrite root `design-qa.md` with a passing Buyer Directory report.
- Preserve `.serena/` and every unrelated file; no commit/push/MR without a separate user request.
