# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

Ships as one Expo / React Native app on iOS and Android with a single shared design language (DESIGN.md). Per OS differences are limited to native icons (SF Symbols on iOS, Material Symbols on Android) and OS guarantees (safe area insets, system back gesture, Reduce Motion, Dynamic Type / font scale). Do not fork the visual design per OS.

## Users

Two primary audiences, weighted equally:

1. **Sellers:** farmers and smallholders in Vietnam's commodity regions (coffee, pepper, durian, cashew, rice). Job: sell my stock at the best price from a buyer near me, at the right moment.
2. **Buyers:** traders, đại lý (local agents), and purchasing or export companies. Job: post what they want to buy and at what price, so nearby sellers find them.

Both rely on the price board and on price movement notifications to decide when to act.

## Product Purpose

A commodity price and trading app that connects sellers with nearby buyers. It shows current prices by commodity and region, notifies users when prices move, lets buyers publish buying posts (commodity, quantity, price, area), and lets sellers record sales and inventory in a selling journal. Success means a seller closes a sale at a better price, closer to home, with less guesswork, and a buyer fills demand faster.

## Positioning

Unlike Zalo groups, word of mouth, or a generic price board, the product combines:

1. Verified buyers, so sellers can trust who is posting a price.
2. Matching by distance, so the best price is weighed against how far the stock must travel.
3. Price movement alerts, so users act on changes instead of checking constantly.
4. A selling journal, so sellers keep their own record of stock, sales, and revenue.

## Operating Context

Used on phones outdoors, in the field, at drying yards, and at buying points, often in strong sunlight and with patchy connectivity. Users check prices several times a day and act quickly when a price moves. Commodities are measured in kg, tấn, or bao; prices are in VND. The interface language is Vietnamese.

## Capabilities and Constraints

1. Existing flows: home dashboard, market price board and commodity detail, notifications, inventory, selling journal and Record Sale, selling intents, buyer list and buyer detail, buyer dashboard, buying demand form, buyer price form, matching.
2. Light mode only (`userInterfaceStyle: light`). Portrait only.
3. Vietnamese currency and unit notation rules live in DESIGN.md.
4. **Product name (chosen, pending clearance):** "Mùa Vàng", always paired with a descriptive store title such as "Mùa Vàng: Giá nông sản" so that searches without diacritics ("mua vang") are not confused with buying gold. The app shows "Mùa Vàng" (Expo display name too); the technical identifiers stay as they were (slug `bprice`, scheme `bprcmobile`, bundle ID `com.geogremiller.bprice`, storage prefix `rayGia:`). The logo asset `assets/images/nongsan-pro-logo.png` is a placeholder reading "Agrivest Capital" and must be replaced with a real Mùa Vàng mark. Trademark, domain, and app store availability are not yet checked and must be cleared before launch.
5. **Open decision, buyer verification:** the verification mechanism and criteria are not yet defined.

## Brand Commitments

Name: "Mùa Vàng" (golden harvest), with a descriptive store title; no logo yet. Visual identity is defined in DESIGN.md ("AgroFinance Editorial"): trustworthy, pragmatic, legible, rooted in agriculture rather than cold fintech.

## Evidence on Hand

All data in the app is mock data: buyer names (for example Simexco Đắk Lắk, Đại lý Toàn Thắng), prices, distances, ratings, review counts, "nông hộ liên kết" counts, and sale history. None of it may be presented as real customers, partners, testimonials, or market figures. There are no real users, partners, press, or metrics to cite yet.

## Product Principles

1. Price truth first: every price shows its source, region, and time of update; stale or unverified data is labeled, never dressed up.
2. Both sides matter equally: no flow should serve buyers at the cost of sellers' trust, or the reverse.
3. Near and now: distance and timing are part of the price, not secondary filters.
4. Fast in the field: the key jobs (check price, see an alert, post or respond to a buy offer, record a sale) take a few taps, one handed, in sunlight.
5. Plain language: copy a farmer understands on first read, in Vietnamese, without trade jargon where a simpler word exists.

## Accessibility & Inclusion

1. Many sellers are older and some have limited literacy or limited smartphone experience. Favor icons paired with text, plain words, large touch targets, and clear confirmation of actions.
2. Support large system text (iOS Dynamic Type, Android font scale) without truncating prices or units.
3. High contrast for outdoor use in direct sunlight; never rely on color alone for price up or down (pair with arrow or sign).
4. Screen reader labels in Vietnamese for prices, trends, and actions.
5. Target standard: WCAG 2.2 AA equivalents for mobile, plus Apple and Android accessibility guidelines.
6. **Open item, regulatory:** price data, buyer verification, and personal data (phone numbers, location) may fall under Vietnamese rules on personal data protection, commercial advertising, and market information. Specific obligations are not yet confirmed and must be checked with legal counsel before launch.
