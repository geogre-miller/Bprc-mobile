# Market Prices — Stitch vs current app

## Sources

- Stitch project: `AgriFinance Market Tracker` (`16177202758777999982`)
- Stitch screen: `Market Prices` (`848d6cbeea93436baac1e09fb4ed9996`)
- Screenshot: `market-prices-full.png` (780 × 2602)
- Generated prototype: `market-prices.html`
- Current route: `src/app/(tabs)/market.tsx`
- Current screen: `src/screens/market-prices/index.tsx`
- Current row: `src/screens/market-prices/market-price-row.tsx`
- Current navigation: `src/components/app-tabs.tsx`

## What this screen is

This is the full farmer-facing market-price ledger. In the current app it maps directly to the dedicated `Thị trường` tab (`/market`) rendered by `MarketPrices`. It is not the smaller `Giá nông sản hôm nay` price tracker embedded on the home dashboard, although both surfaces share `useDashboardData` and the same price observations.

## Stitch screenshot description

The screen uses a warm, pale agricultural-finance palette: an oat/very-light-green canvas, white ledger surfaces, deep forest-green headings and CTA surfaces, mint gain indicators, brick-red loss indicators, and muted gray metadata. The visual language is deliberately dense and practical rather than decorative.

The top header contains a small agricultural logo, the brand `NôngSản Pro`, the location `Tây Nguyên • Đắk Lắk`, a notification control with an unread red dot, and a circular farmer portrait.

There is an unusually large empty vertical area below the header. The screenshot then shows a dark-green market summary banner: `18 tăng • 4 giảm • Cập nhật lúc 08:...`, with a rising-trend icon and a live-status dot.

The main content is a white, rounded ledger card with three columns: `MẶT HÀNG`, `GIÁ (₫/KG)`, and `24H / XU HƯỚNG`. Commodity and price headers show sort icons.

Eight rows are visible:

1. Cà phê Robusta — `118,500`, `+3,200 ₫`, `+2.8%`, Đắk Lắk, with a `Đỉnh 30 ngày` badge.
2. Cà phê Arabica — `135,000`, `+2,000 ₫`, `+1.5%`, Lâm Đồng.
3. Tiêu đen — `148,000`, `+2,000 ₫`, `+1.4%`, Chư Sê • Gia Lai.
4. Sầu riêng Ri6 — `88,000`, `-2,000 ₫`, `-2.2%`, Loại 1 • Xuất khẩu.
5. Sầu Monthong — `105,000`, `-2,000 ₫`, `-1.9%`, Dona Tây Nguyên.
6. Lúa khô ST25 — `11,500`, ngang giá, `0.0%`, Sóc Trăng.
7. Hạt điều tươi — `32,500`, `+1,000 ₫`, `+3.1%`, Bình Phước.
8. Bắp khô (Ngô) — `7,200`, `-100 ₫`, `-1.4%`, Nông trại.

Each row includes freshness metadata and a small sparkline. The signs, numbers, and line direction reinforce green/red color semantics.

Below the ledger is a harvest insight card. It says Tây Nguyên coffee prices remain strong because dealer supply is limited and advises farmers to take profit in portions.

A dark-green automatic-alert card follows, offering an alert when coffee reaches `120,000 ₫/kg`, with a `Đặt báo` button.

The bottom navigation has five destinations: `Trang chủ`, `Thị trường`, `Giao dịch`, `Kho & Lãi`, and `Cá nhân`.

## Generated HTML vs generated screenshot

The HTML contains controls that are not visible in the screenshot:

- A search field with the placeholder `Tìm cà phê, tiêu, lúa, sầu riêng...`.
- A tune/filter button.
- Pills for `Cà phê Robusta`, `Khu vực: Đắk Lắk`, `Đã xác thực`, and `Tăng nhiều nhất`.

Their absence explains much of the large blank region under the header. This is an export/render mismatch inside the Stitch artifact, not a difference caused by the current React Native app.

The HTML's search works by hiding rows. The alert button only shows temporary confirmation and resets after 2.5 seconds. The region/verification pills are visually buttons but the supplied script targets a different CSS class, so their intended filter interaction is not wired. Commodity rows look clickable but are plain `div` elements with no navigation behavior.

## Comparison with the current app

### Strong matches

- Same overall purpose: a dedicated market ledger for farmers.
- Same section order: header → controls → market bulletin → three-column price table → harvest insight → automatic-alert CTA → tabs.
- Same 5/4/3 row column proportions and 64px minimum row height.
- Same warm-neutral/forest-green visual tokens, white cards, subtle borders, 8–12px radii, and red/green financial semantics.
- Same search, sortable name/price headings, positive/negative/flat trend treatment, relative update times, insight card, and `120,000 ₫/kg` alert concept.
- Current rows navigate to `/commodity/[id]`, and the current alert CTA navigates to `/alerts`; these are more complete than the generated HTML prototype.

### Main differences

| Area | Stitch screen | Current app |
| --- | --- | --- |
| Header region | `Tây Nguyên • Đắk Lắk` | `Ngọc Hồi, Kon Tum` |
| Header identity | Real logo and farmer portrait | Storefront and person glyphs |
| Search | Long example-rich placeholder in HTML; missing in screenshot | `Tìm mặt hàng`, visible and functional |
| Filters | Commodity, region, verification, top-gainer concepts in HTML | `Tất cả`, `Đang giữ`, `Tăng giá`, `Giảm giá` |
| Filter icon | Suggests opening advanced filters | Resets active search/filter state despite using a tune icon |
| Dataset | Eight detailed variants across several regions | Five generic commodities from mock data |
| Current prices | 118,500 Robusta; 135,000 Arabica; etc. | 114,500 coffee; 158,000 pepper; 2,450 cassava; 385,000 rubber; 41,000 cashew |
| Market summary | `18 tăng • 4 giảm` | Derived from mock rows: 3 gainers and 2 losers |
| Default order | Editorial/prominence order | Price descending: rubber, pepper, coffee, cashew, cassava |
| Row metadata | Grade/type and geographic market | Province when available, otherwise confidence label; current mocks lack locations |
| Row badge | `Đỉnh 30 ngày` | `Đang giữ` when inventory contains that commodity |
| Trend visualization | Percentage pill plus sparkline | Percentage pill only |
| Insight | Static coffee-specific regional advice | Dynamically names the largest mover |
| Alert wording | Price `chạm` the threshold | Price `vượt` the threshold |
| Alert behavior | Temporary visual confirmation in HTML | Navigates to the real `/alerts` screen |
| Bottom navigation | Five: Home, Market, Transactions, Inventory/Profit, Profile | Four: Overview, Market, Buyers, Mine |
| Platform navigation | Custom fixed bar | Native tabs on mobile; a separate custom bar on web |
| Empty state | Not represented | `Không có mặt hàng nào khớp bộ lọc.` |
| Dark mode | Light-only artifact | Current app defines light and dark semantic colors |

## UX and accessibility observations

### Strengths

- The dense ledger supports fast scanning: names left, prices aligned right, change separated from the main price, and percentage trend isolated in a pill.
- Trend meaning does not depend solely on color; `+`, `-`, percentages, delta values, and sparkline direction provide redundant cues.
- The 64px rows and bottom-navigation cells are comfortably sized for touch.
- The current implementation provides a real no-results state and real navigation from rows and the alert CTA.

### Risks

- The Stitch screenshot's large blank region looks broken and pushes the most important market data below the fold.
- The 11–12px metadata and muted gray-on-pale backgrounds may be difficult in outdoor glare, a likely use context for farmers.
- Several Stitch HTML elements appear interactive but are incomplete: rows are not links/buttons, bottom-nav links use `#`, and advanced filters are not wired.
- The Stitch filter pills are 36px high, below the design system's own 44px touch-target goal. The current filter chips are also 36px high.
- In the current app, the tune icon is semantically misleading because it clears filters instead of opening filtering options.
- The Stitch screenshot implies market-wide aggregation (`18 tăng`, `4 giảm`) while displaying only eight rows; the relationship between summary scope and visible data is not explained.
- Screenshot evidence cannot confirm contrast ratios, screen-reader names, reading order, keyboard focus, zoom/reflow, or pressed-state announcements.

## Verdict

The Stitch screen is an expanded, editorially richer version of the current dedicated Market Prices screen. The current code already implements most of its information architecture and has stronger real navigation and state handling. The largest product changes implied by Stitch are a broader and more specific market dataset, regional/verification filters, sparklines, five-way navigation, richer identity assets, and a different geographic focus. Before implementation, the blank header gap and the mismatch between Stitch screenshot and HTML should be resolved so there is one authoritative visual target.

## Evidence limit

The Stitch screenshot and HTML were captured and inspected directly. The current app was traced from its current route, screen, row, data, theme, and navigation source. A fresh screenshot of the current Expo render could not be captured because the in-app browser connection failed during this run, so pixel-level current-vs-Stitch fidelity is not claimed.
