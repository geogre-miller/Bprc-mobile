# Buyer Directory implementation specification

This document is the authoritative implementation source for Stitch screen `52f49f27b2634f3480b258942a98e578` in project `16177202758777999982`. Subagents must implement this specification without independently redesigning the screen.

## Route and architecture

- Target the existing `Đầu mối` tab at `/buyers`.
- Keep `src/app/(tabs)/buyers.tsx` as the thin route adapter and keep the existing four-tab navigation unchanged.
- Replace only the presentation owned by `src/screens/buyer-list/index.tsx`.
- Keep shared `BUYERS` and the domain model unchanged because they feed many other flows. Define Stitch-specific directory display data locally and map the three visible cards to existing detail IDs `b1`, `b2`, and `b3`.
- Reuse `ThemedText`, `useTheme`, `Icon`, Expo Router `Link`, React Native `Modal`, `ScrollView`, `TextInput`, `Pressable`, `Linking`, and `SafeAreaView` patterns already used by Market Prices and Profile.
- Load the existing bundled Manrope/Public Sans TTF files with a screen-local hook in `src/screens/buyer-list/fonts.ts`; do not introduce dependencies.

## Component hierarchy

```text
BuyerList
└─ SafeAreaView(top)
   └─ centered shell (100%, max-width 430)
      ├─ BuyerDirectoryHeader (64)
      │  ├─ source logo + brand/region
      │  ├─ notification button -> /alerts
      │  └─ source profile image -> /account
      ├─ ScrollView
      │  └─ content stack
      │     ├─ title/status row
      │     ├─ search + advanced-filter row
      │     ├─ horizontal filter chips
      │     ├─ safety-tip banner
      │     ├─ buyer-card list (3)
      │     └─ trust/safeguard panel
      ├─ FilterSheet (conditional modal)
      ├─ QuotationSheet (conditional modal)
      └─ transient success toast
```

Keep small render helpers and display data in the screen module. Do not create a generic component library for one screen.

## Layout measurements

- Design coordinate system: Stitch artifact `780 × 3452`, rendered at `390 px` logical width; local normalized reference is `.stitch/buyer-directory/stitch-source-390.png` (`390 × 1714`).
- Root canvas: `#F6FBF5`; centered shell width `100%`, maximum `430`.
- Safe area: consume top inset with `SafeAreaView edges={['top']}`. The shared tabs own the bottom safe area/tab inset.
- Header: `64` high, horizontal padding `16`; bottom hairline/micro-shadow; logo `32 × 32`; notification target `44 × 44`; avatar `32 × 32`; action gap `8`.
- Scroll content: horizontal padding `16`, top padding `16`, stack gap `16`, bottom padding at least `BottomTabInset + 64 + 24` so the trust panel clears native/web tabs.
- Title/status row: title icon `22`, gap `6`; headline can wrap to two lines; open-buyers badge uses horizontal padding `10`, vertical `4`, full pill radius.
- Search/filter row: height `44`, gap `8`; search field flexes, white surface, horizontal padding `12`, icon `20`; filter button `44 × 44`. The source screenshot contains an empty slot here while the returned HTML contains the complete control. Render the functional control to eliminate the design-renderer blank space.
- Filter strip: horizontal, edge-to-edge scrolling via negative content margin; chip height `36`, horizontal padding `14`, gap `8`, full/pill radius.
- Safety banner: padding `14`, radius `8`, copy gap `12`; icon well `32 × 32` with radius `8`.
- Buyer list: vertical gap `12`.
- Buyer cards: white, padding `16`, radius `8`, restrained `shadow-sm`; do not add borders. Preserve single-line truncation on long names, program copy, address, and policy rows.
- Card top row bottom margin `10`; trust/program strip bottom margin `12`; price grid is two equal columns with gap `8` and bottom margin `12`; price wells padding `10`, radius `8`; location/policy stack gap `6` and bottom margin `14`; CTA grid gap `8`, button height `44`.
- Trust panel: surface-high background, padding `16`, radius `8`, internal gap `8`, bottom margin `8`.
- Bottom tabs are the existing app shell and must not be recreated inside `BuyerList`.
- Responsive: under `600` use the centered 390/430 mobile treatment; wider web remains centered inside the existing desktop tab shell with no stretched cards.

## Typography

- Headline family: Manrope; all body, label, title, and numeric copy: Public Sans.
- Screen title: Manrope Semibold, `18/24`, slight negative tracking.
- Brand and buyer names: Public Sans Semibold/Bold, `16/22`.
- Body: Public Sans Regular, `12/16` or `14/20` according to Stitch.
- Labels: Public Sans Medium/Semibold, `13/18` and `11/14`.
- Prices: Public Sans Semibold/Bold, `18/24`, `-0.18` letter spacing; suffix `₫/kg` uses `11/14`.
- Ensure numeric values use `fontVariant: ['tabular-nums']` where supported.

## Color tokens

- `background/surface`: `#F6FBF5`
- `surfaceLowest/card`: `#FFFFFF`
- `surfaceLow/wells`: `#F0F5F0`
- `surfaceContainer`: `#EBEFEA`
- `surfaceHigh/trust`: `#E5E9E4`
- `onSurface`: `#181D1A`
- `onSurfaceVariant`: `#414844`
- `outline`: `#717973`
- `primary`: `#012D1D`
- `primaryContainer`: `#1B4332`
- `secondary`: `#2C694E`
- `secondaryContainer`: `#AEEECB`
- `secondaryFixed`: `#B1F0CE`
- `onSecondaryContainer`: `#316E52`
- `tertiary/orange copy`: `#6E3900`; `tertiaryFixed`: `#FFDCC3`; star: `#F48C24`
- `error`: `#BA1A1A`
- Modal backdrop: approximately `rgba(1,45,29,0.28)`.

## Assets and icons

- Reuse `assets/images/nongsan-pro-logo.png` and `assets/images/nongsan-pro-profile.png`. They are existing 512 px derivatives of the two hosted Stitch assets downloaded into `.stitch/buyer-directory/`.
- Use the shared Expo Symbols wrapper; add only the missing nearest mappings required by this screen: `verified_user`, `workspace_premium`, `local_florist`, `fact_check`, `send`, and `open_in_new`.
- Never substitute emoji, text glyphs, inline SVG, or hand-drawn shapes for visible icons.

## Default content

- Header: `NôngSản Pro`, `Tây Nguyên • Đắk Lắk`.
- Title: `Thương lái & Đại lý thu mua`; badge `38 đại lý mở kho`.
- Search placeholder: `Tìm tên đại lý, thương lái, HTX...`.
- Chips: active `Cà phê Robusta`; `Bán kính: < 15km`; `Đã xác thực`; `Giá cao nhất`.
- Safety tip and the three buyer cards must use the exact Vietnamese copy and numbers from `stitch-screen.html`.
- Cards, in order: `Đại lý Nông Sản Toàn Thắng`, `HTX Cà Phê Bền Vững Ea Tu`, `Kho Nông Sản XK An Phát`.
- Trust panel must use the exact Stitch heading, paragraph, and two links.

## Interaction behavior

- Search filters visible cards case-insensitively across buyer/card text and exposes a clear button while non-empty.
- Product/radius chips open a bottom filter sheet. Verified and highest-price chips toggle selected state and filter/sort the local list. The advanced-filter button opens a combined sheet and its indicator reflects active filters.
- Notification and avatar navigate through existing routes.
- Call CTAs use `Linking.openURL('tel:...')` with the Stitch phone values.
- `Xem chi tiết` navigates to the existing `/buyer/[id]` route using the mapped local ID.
- `Gửi báo giá` opens a bottom sheet with commodity, quantity, desired price, and note fields matching Stitch. Cancel/backdrop close it; submit closes it and displays `Đại lý sẽ gọi lại trong 15 phút!` briefly.
- Report/policy actions provide immediate in-app feedback (Alert is acceptable; no new route).
- Buttons expose roles/labels, inputs expose labels/placeholders, modal dismiss works with Android back, and touch targets are at least `44 px`.
- No network request, persistence migration, or domain-data mutation is in scope.

## Visual acceptance criteria

- At `390 × 884`, the header, title, visible search row, first filters, safety banner, and beginning of the first card align with Stitch’s scale and rhythm without a large blank top region.
- Full-page capture preserves the three-card order and dense `1714 px`-class composition, with the existing tab bar over the bottom edge.
- All typefaces, weights, colors, radii, icon sizes, truncation, and shadows match the reference closely.
- Search, chips, call/detail/quote actions, modal dismissal/submission, and scrolling work on web; code remains universal React Native.
- Typecheck passes and no new lint failures are introduced.
