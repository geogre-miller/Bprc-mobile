# Buyer Detail — Implementation Specification

This document is the authoritative source of truth for the Buyer Detail implementation. Stitch is authoritative for visual treatment and visible copy; the existing Expo Router application is authoritative for route structure, native behavior, shared components, and navigation conventions.

## Source material

- Stitch project: `AgriFinance Market Tracker` (`16177202758777999982`)
- Stitch screen: `Buyer Detail` (`0ced5acd5b5046468537bc9b688772a4`)
- Screen metadata: mobile, 780 × 3700 reported by Stitch.
- Downloaded source capture: `.stitch/buyer-detail/stitch-screen-original.png`, actual 780 × 3612 JPEG pixels, interpreted as a 390 × 1806 logical-pixel capture at 2× density.
- Normalized reference: `.stitch/buyer-detail/stitch-screen-390.png` (390 × 1806).
- Generated markup: `.stitch/buyer-detail/stitch-screen.html`.
- Downloaded source assets: `.stitch/buyer-detail/buyer-portrait.jpg` (286 × 512) and `.stitch/buyer-detail/warehouse.jpg` (512 × 279).

## Required correction to the Stitch source

The generated HTML combines a fixed 64 px header, `main pt-24` (96 px), and an additional `pt-20` (80 px) on the first navigation row. This creates roughly 112 px of unintended empty space below the header. The user explicitly requested that this gap be fixed.

The implementation must therefore:

- hide the Expo Router native header for `buyer/[id]` so there is only one screen header;
- render the branded 64 px header in normal safe-area layout flow;
- begin scroll content 8 px below that header;
- use 8 px vertical padding on the detail navigation row;
- place the buyer card 12 px below that row;
- never recreate the source HTML's `pt-24 + pt-20` stacking.

At a 390 px web viewport with zero top inset, the expected geometry is approximately: branded header y=0–64, content begins y=72, navigation controls y=80–120, buyer card begins near y=140. On notched devices, the safe-area inset is added once above the 64 px header.

## Architecture and route behavior

- Existing route remains `src/app/buyer/[id].tsx`; it already passes `buyerId` to `BuyerDetail`.
- Replace only the presentation in `src/screens/buyer-detail/index.tsx`; do not add a duplicate route.
- Change the existing `buyer/[id]` Stack option in `src/app/_layout.tsx` to `headerShown: false`.
- Follow `src/screens/commodity-detail/index.tsx` for shell width, safe-area insets, in-screen brand header, absolute footer, five-item detail navigation, native `Linking`, `Share`, and router behavior.
- Keep the maximum mobile shell width at 430 px and center it on wider web canvases.
- Preserve the existing not-found state for invalid buyer IDs. For a valid route, render the exact Stitch Buyer Detail fixture; do not modify shared `BUYERS`, `BUYING_DEMANDS`, or `PRICE_OBSERVATIONS`, because those records have broad upstream impact and are not required for this visual scope.
- Use `useSafeAreaInsets()` exactly once for top and bottom safe-area handling.
- Main content scrolls vertically. The branded header stays above the `ScrollView`; the footer remains fixed above the bottom inset. No horizontal scrolling or overflow.

## Component hierarchy

`BuyerDetail`

1. full-screen surface container
2. centered mobile shell (max width 430)
3. safe-area-aware branded header (64 px)
   - NôngSản Pro logo and region
   - notification control with red unread dot
   - farmer profile avatar
4. vertical `ScrollView`
   - detail navigation row: back/Danh bạ, call, share
   - buyer identity/trust card
   - buying-price section header and update chip
   - three quote cards
   - warehouse image banner with dark bottom gradient/caption
   - user transaction-history section
   - buying standards/support card
   - call CTA
   - create-sale CTA
5. fixed detail footer
   - five navigation items matching the established commodity-detail implementation
6. native `Modal` bottom sheet for the create-sale flow

Small screen-local render helpers are acceptable for repeated structures: `QuoteCard`, `TrustStat`, `TransactionRow`, `PolicyRow`, and `BottomNavItem`. Keep them in the buyer-detail module; do not introduce a new app-wide abstraction.

## Layout measurements

- Logical target width: 390 px; outer shell max width: 430 px.
- Page background: `#F6FBF5`.
- Horizontal gutter: 16 px.
- Header height: 64 px; logo approximately 36 × 32; notification hit target 44 × 44; profile avatar 34 × 34.
- Primary section stack gap: 12 px. Related-card internal stack gaps: 8–12 px.
- Card padding: 16 px.
- Card radius: 8 px (`Radius.container`); inner wells typically 4 px; pills use full radius.
- Buyer portrait slot: 56 × 56, radius 8, `cover`; verified badge overlays lower right at 16 × 16.
- Buyer trust grid: three equal columns, 8 px gaps, about 54–58 px high.
- Top controls: call and share are 40 × 40; back target at least 44 px high.
- Quote stack: 8 px between cards. Hero quote prices use 28/36 typography; third compact quote price uses 18/24.
- Warehouse banner: full content width, 144 px high, radius 8, `cover`, caption padding 12.
- Transaction summary banner: 16 px padding; dark green main body; lower translucent strip extends edge to edge.
- Policy icon wells: 28 × 28, radius 4; 10 px between icon and copy.
- CTAs: full width, 48 px high, radius 4–8 according to source; 8 px between CTAs.
- Scroll bottom padding: enough to keep both CTAs fully clear of the fixed footer (at least 144 px plus `insets.bottom`).
- Footer: 64 px plus `insets.bottom`, white at 95% opacity, subtle upward shadow.

## Typography

Use the existing bundled font files under `assets/fonts/` through a buyer-detail-local font hook so this screen cannot change app-wide typography.

- Headings and buyer name: Manrope Semibold or Bold.
- Body, labels, and numeric values: Public Sans Regular/Medium/Semibold/Bold.
- `headline-sm`: 18 px / 24 px, weight 600, letter spacing -0.09.
- `title-md`: 16 px / 22 px, weight 600.
- `body-md`: 14 px / 20 px, weight 400.
- `body-sm`: 12 px / 16 px, weight 400, letter spacing 0.12.
- `label-md`: 13 px / 18 px, weight 500, letter spacing 0.13.
- `label-sm`: 11 px / 14 px, weight 600, letter spacing 0.44.
- `numeric-lg`: 18 px / 24 px, weight 600, letter spacing -0.18.
- `numeric-hero`: 28 px / 36 px, weight 700, letter spacing -0.56.
- Avoid platform synthetic bold where an exact bundled font weight exists.

## Colors

- `surface`: `#F6FBF5`
- `surfaceLowest`: `#FFFFFF`
- `surfaceLow`: `#F0F5F0`
- `surfaceContainer`: `#EBEFEA`
- `surfaceHigh`: `#E5E9E4`
- `surfaceHighest`: `#DFE4DF`
- `onSurface`: `#181D1A`
- `onSurfaceVariant`: `#414844`
- `outline`: `#717973`
- `outlineVariant`: `#C1C8C2`
- `primary`: `#012D1D`
- `primaryContainer`: `#1B4332`
- `onPrimary`: `#FFFFFF`
- `onPrimaryContainer`: `#86AF99`
- `secondary`: `#2C694E`
- `secondaryContainer`: `#AEEECB`
- `onSecondaryContainer`: `#316E52`
- `amber`: `#F48C24`
- `error`: `#BA1A1A`

Card shadow: green-black `#1B4332`, y=1, opacity around 0.05–0.06, radius 4, elevation 1. Header shadow: y=1, opacity 0.04, radius 4. Footer shadow: y=-2, opacity 0.06, radius 10.

## Assets and icons

- Reuse `assets/images/nongsan-pro-logo.png` and `assets/images/nongsan-pro-profile.png` for the common header.
- Add the downloaded Stitch portrait as `assets/images/buyer-detail-portrait.jpg` without altering its aspect ratio; crop with `resizeMode="cover"` inside the 56 px square.
- Add the downloaded Stitch warehouse as `assets/images/buyer-detail-warehouse.jpg`; use `cover` inside the 144 px banner.
- Use the existing `Icon` / `IconName` wrapper backed by `expo-symbols`.
- Add only missing semantic names required by the screen to the existing map: `price_change`, `history`, `shopping_bag`, `warehouse`, `verified_user`, `water_drop`, and `send`. Map each to a close SF Symbol on iOS and its Material name on Android/web. Existing names such as `arrow_back`, `call`, `share`, `verified`, `check_circle`, `scale`, `star`, `payments`, `local_shipping`, `receipt_long`, `home`, `trending_up`, `inventory_2`, `person`, and `post_add` must be reused.
- Do not draw or fake icons, images, gradients, or badges with text symbols/emoji/handmade SVG.

## Exact visible content

Buyer card:

- `Đại lý Toàn Thắng`
- `Chủ cơ sở: Anh Trần Toàn Thắng`
- `Cấp phép bởi Sở Công Thương Đắk Lắk`
- `Hạn ngạch cần thu:` / `Đang cần 3 tấn`
- stats: `4.9` / `48 đánh giá`; `8 năm` / `Thâm niên`; `100%` / `Đúng hạn`

Quotes:

- header `Giá thu mua hôm nay`; chip `Cập nhật 08:30`
- Robusta: `Cà phê Robusta`, `Nhân xô`, `Yêu cầu ẩm ≤ 15% • Tạp chất ≤ 1%`, `119,200 ₫/kg`, `+700 ₫ so với sàn`, `Cần gấp 10 tấn`
- Pepper: `Hồ tiêu đen`, `Dung trọng 550g/l`, `Tiêu khô đều, không ẩm mốc`, `148,500 ₫/kg`, `Bằng giá thị trường`, `Đang cần 3 tấn`
- Fresh coffee: `Cà phê quả tươi`, `Hái chín >85%`, `Cân xô tại vườn hoặc tại kho`, `24,500 ₫/kg`

Warehouse:

- `Kho tổng Buôn Hồ • Sức chứa 2,500 tấn`

Transactions:

- `Lịch sử giao dịch của bạn`; `Khách hàng thân thiết`
- `TỔNG GIÁ TRỊ ĐÃ GIAO DỊCH`; `4 vụ đã chốt`; `1,480,000,000 ₫`; `Tổng sản lượng cung ứng:`; `14.2 tấn`
- `3,500 kg Cà phê Robusta`; `Ngày 18/09/2024 • Đơn giá 116,000 ₫/kg`; `406,000,000 ₫`; `Đã thanh toán đủ`
- `1,200 kg Tiêu đen`; `Ngày 05/06/2024 • Đơn giá 142,000 ₫/kg`; `170,400,000 ₫`; `Đã thanh toán đủ`

Policy card:

- `Quy chuẩn thu mua & Hỗ trợ`
- `Độ ẩm & Tạp chất` — `Độ ẩm tiêu chuẩn: Cà phê ≤ 15%, Tạp chất ≤ 1%. Kiểm tra bằng máy Kett điện tử trước mặt chủ vườn.`
- `Cân điện tử kiểm định` — `Hệ thống cân điện tử 80 tấn và cân bàn có tem kiểm định định kỳ của Chi cục Tiêu chuẩn Đo lường Chất lượng.`
- `Vận chuyển bốc hàng miễn phí` — `Có đội xe tải 2.5 - 5 tấn hỗ trợ bốc hàng tận kho vườn miễn phí trong bán kính 15 km (từ 1 tấn trở lên).`

Actions:

- `Gọi ngay 0914.829.xxx`
- `Tạo phiếu bán cho đại lý này`

## Interaction contract

- Back: `router.back()` when possible, otherwise `router.replace('/buyers')`.
- Header notification: navigate to `/alerts`.
- Header avatar: navigate to `/account`.
- Both call controls: `Linking.openURL('tel:0914829374')` (or a normalized valid buyer phone if deliberately used, while keeping the displayed masked Stitch number).
- Share: native `Share.share` with the buyer title and screen/profile message.
- Footer nav: follow the established detail-screen routing from Commodity Detail. Buyer/contacts destination should be active; all five controls have working navigation and accessibility selected state.
- Create-sale CTA opens a native bottom-sheet-style `Modal` with dim scrim.
- Modal defaults to `Robusta Nhân xô`, 2,000 kg, 119,200 ₫/kg, estimated `238,400,000 ₫`.
- Commodity chips switch between Robusta (119,200) and Tiêu Đen (148,500); selected styling and accessibility selected state must update.
- Numeric weight input recalculates the displayed estimate live.
- Close, cancel, scrim/back request close the modal.
- Submit closes the modal and shows native confirmation feedback. Do not persist or mutate shared market data in this scope.
- Press feedback may use opacity around 0.68 and a subtle 0.99 scale for primary CTAs.

## File ownership and delegated task DAG

Tasks are non-overlapping and may run in parallel only after this spec is complete.

1. `buyer_screen` owns only `src/screens/buyer-detail/index.tsx`.
   - Implement the entire screen, screen-local helper components, state, modal, styles, and interactions from this spec.
   - Import the screen-local font hook and existing icon wrapper; do not modify their files.
   - Acceptance: exact content hierarchy, no large top gap, scrolling/footer/safe areas correct, invalid buyer state retained, modal interactions work, no unrelated changes.
2. `buyer_assets_fonts` owns only `assets/images/buyer-detail-portrait.jpg`, `assets/images/buyer-detail-warehouse.jpg`, and `src/screens/buyer-detail/fonts.ts`.
   - Copy the inspected Stitch assets from `.stitch/buyer-detail/`; reference the existing bundled TTFs in a screen-local font loader.
   - Acceptance: real downloaded assets, correct formats/dimensions, no regenerated placeholders, font hook reports ready on load or error.
3. `buyer_icons` owns only `src/screens/home-dashboard/icons.tsx`.
   - Add the seven missing icon mappings listed above; no refactor or existing mapping change.
   - Acceptance: `IconName` includes them and `Icon` still works on iOS/Android/web.
4. `buyer_route_shell` owns only `src/app/_layout.tsx`.
   - Set only `buyer/[id]` to `headerShown: false`; preserve every other route option.
   - Acceptance: no native header or duplicate top bar on Buyer Detail.

After workers finish, the orchestrator owns diff review, integration corrections, typecheck/lint, runtime checks, visual comparison, punch-list prioritization, and final graph change analysis.

## Acceptance criteria

- `/buyer/b1` renders the Stitch Buyer Detail design with the large source top gap removed.
- At 390 px viewport width there is no horizontal overflow; content begins immediately after the 64 px brand header with the geometry described above.
- All visible source assets are real downloaded Stitch assets or existing real project assets.
- Typography, colors, spacing, card radii, shadows, images, and footer visually match Stitch within practical React Native rendering differences.
- Header, back, call, share, footer navigation, modal selection, live estimate, cancel, and submit behaviors work.
- Safe-area top and bottom are applied exactly once.
- Typecheck and lint pass, or any pre-existing unrelated failure is documented with evidence.
- Final QA uses the 390 px route state and source capture in the same comparison input, records P0/P1/P2/P3 findings, iterates all P0–P2 issues, and leaves root `design-qa.md` ending with `final result: passed` only after true visual review.
