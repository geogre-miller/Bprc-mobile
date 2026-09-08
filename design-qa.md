# Buyer Detail — Design QA

## Comparison target

- Stitch source: `.stitch/buyer-detail/stitch-screen-original.png`.
- Stitch source pixels: 780 × 3612, interpreted as a 390 × 1806 logical-pixel mobile capture at 2× density.
- Implementation route: `http://127.0.0.1:8081/buyer/b1`.
- Implementation screenshot: `.stitch/buyer-detail/implementation-buyer-390.png`.
- Same-input comparison: `.stitch/buyer-detail/buyer-detail-comparison.png` (Stitch left, implementation right).
- Modal state screenshot: `.stitch/buyer-detail/implementation-sale-modal-390.png`.
- Rendered state: 390 × 1806 viewport, device scale factor 2, light theme, Vietnamese locale, reduced motion.

## Required source correction

The Stitch HTML applied `pt-24` to the main area and another `pt-20` to its first row beneath a fixed 64 px header. This produced roughly 112 logical pixels of unintended empty space at the top. The implementation intentionally removes that defect: the branded header occupies y=0–64, scroll content begins at y=72, the back row control begins at y=80, and the buyer-name baseline begins at y=156. The Buyer Detail card is therefore visible immediately below the navigation row without a duplicate native header or oversized spacer.

## Verification result

- Reference and implementation captures are both exactly 780 × 3612 pixels and were inspected together in one side-by-side comparison image.
- Browser metrics at the reference viewport: width 390, height 1806, scroll width 390, scroll height 1806, fonts loaded.
- Compact mobile check at 360 × 844: scroll width remained 360 with no horizontal overflow.
- No browser console errors or uncaught page errors were observed.
- Real Stitch portrait and warehouse assets are used byte-for-byte; header logo/avatar reuse existing real project assets.
- Create-sale flow opened as a bottom sheet, switched to `Tiêu Đen`, exposed `aria-selected="true"`, accepted `1000` kg, and recalculated the estimate to `148,500,000 ₫`; cancel closed the sheet.
- Footer navigation reached `/market`; header controls reached `/alerts` and `/account`.
- `/buyer/missing` retained and displayed the invalid-buyer state.
- Expo SDK 57 production web export completed successfully.
- TypeScript, targeted ESLint, and `git diff --check` pass.

## Visual findings

- No remaining P0, P1, or P2 defects.
- Layout, 16 px gutters, 12 px section rhythm, card dimensions, 8 px radii, muted shadows, palette, type hierarchy, image crops, and fixed footer match the Stitch source closely after accounting for the requested top-gap removal.
- [P3] SF Symbol equivalents used by `expo-symbols` have minor platform-specific optical differences from the Material Symbols in the Stitch HTML. Semantic names, sizes, color roles, and alignment are preserved.
- [P3] The Stitch raster capture omits visible copy in two pale quota strips and its secondary CTA even though the generated Stitch HTML contains that copy and behavior. The implementation follows the inspected HTML and renders those elements rather than reproducing the capture defect.
- [P3] Removing the source's 112 px top gap leaves more breathing room above the fixed footer at the tall 1806 px comparison viewport. On ordinary phone-height viewports, this becomes scrollable content rather than a persistent blank region.

## Scrolling, safe areas, and states

- Top and bottom safe-area insets are applied once via `useSafeAreaInsets`.
- The 64 px branded header stays outside the vertical `ScrollView`; the 64 px bottom navigation stays fixed above the bottom inset.
- Scroll content reserves 148 px plus bottom inset so both CTAs clear the fixed navigation.
- Notification, avatar, back, call, share, five footer destinations, commodity tabs, numeric input, modal close/cancel, and submit confirmation are implemented as native controls.
- Invalid buyer, loading fonts, modal selected/unselected, input focus, pressed, and confirmation states are covered by code or runtime verification.

## Automated-check note

Full-project `npm run lint` still reports one pre-existing error in `src/hooks/use-color-scheme.web.ts` (`react-hooks/set-state-in-effect` at line 11). That file is unchanged and outside this screen's scope. Targeted lint for every changed TypeScript/TSX file passes.

## Graph review

GitNexus change detection reports high aggregate reach because the shared icon module participates in eight known app processes. Review confirmed that its implementation was not changed: seven additive key mappings were appended to `ICONS`. Typecheck, targeted lint, runtime render, navigation checks, and production export cover the affected surface. Buyer Detail itself remains a single-route, low-upstream-risk screen.

## Visual punch list

- Optional P3 only: compare platform-native SF Symbols on physical iOS hardware if exact glyph shape is release-critical.
- Optional P3 only: revisit the five-item detail footer in a separate product-wide navigation task if it should converge with the four-tab top-level architecture.

final result: passed
