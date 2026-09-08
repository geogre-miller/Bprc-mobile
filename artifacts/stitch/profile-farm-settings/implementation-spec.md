# Profile & Farm Settings implementation spec

## Source of truth

- Stitch project: `AgriFinance Market Tracker` (`16177202758777999982`).
- Stitch screen: `Profile & Farm Settings` (`0f8d30f6f5ce44c199b0493d9dd77bc2`).
- Generated HTML: `.stitch/profile-farm-settings/stitch-screen.html`.
- Full reference screenshot: `.stitch/profile-farm-settings/stitch-screen-original.png` (`780 x 3276`, interpreted as a `390px`-wide 2x mobile capture).
- Original screen assets: `.stitch/profile-farm-settings/logo.png` and `.stitch/profile-farm-settings/profile.png`; the codebase already has visually matching, optimized copies at `assets/images/nongsan-pro-logo.png` and `assets/images/nongsan-pro-profile.png`.

## Architecture and ownership

- Keep Expo Router's existing account tab route: `src/app/(tabs)/account.tsx` renders `Account`.
- Replace the placeholder implementation in `src/screens/account/index.tsx`; do not create a parallel route.
- Preserve the existing `AppTabs` navigation shell. Native tabs own the device bottom navigation and safe-area behavior; do not render a second bottom bar inside the account screen. At narrow web widths (`<= 600px`), the existing web tab shell must use a bottom bar so it does not cover the mobile header or force horizontal overflow; retain the current desktop web navigation above that breakpoint.
- Reuse `ThemedText`, `ThemedView`, `Radius`, `Spacing`, `BottomTabInset`, `Icon`, `useTheme`, Expo Router, and React Native primitives.
- Add only missing icon names to `src/screens/home-dashboard/icons.tsx`; do not introduce another icon library or handcrafted SVG/icon art.
- Reuse the existing logo and profile photo assets. Do not generate or approximate them.
- Use `expo-font` (already installed) with local Google Fonts files so this screen uses Manrope for headings and Public Sans for body/labels/numerics without changing typography globally.

## Component hierarchy

```text
SafeAreaView(top)
  ScreenHeader
    BrandAndRegion
    NotificationButton + FarmerAvatar
    ScreenTitleRow (Cá Nhân + Trực tuyến)
  ScrollView
    ProfileCard
      IdentityRow
      FarmerIdVerificationRow
    FarmScaleCard
      SectionHeader
      ThreeStatGrid
    BankAndSettlementCard
      SectionHeader + change action
      BankDetailsPanel
      LinkedIdentityCallout
    MarketPreferencesCard
      ReferenceRegionRow
      PriceAlertToggleRow
      MeasurementUnitRow
    FarmerSupportCard
      HotlineRow
      FarmingGuideRow
      PriceFloorPolicyRow
    LogoutButton
    AppVersionBlock
```

Small helpers may remain private in `src/screens/account/index.tsx` (for example `SettingRow`, `SupportRow`, and `FarmStat`). Avoid exporting or generalizing them.

## Layout measurements

- Target content width: full device width up to `430px`; fidelity reference is `390px` CSS width.
- Screen canvas: `#F6FBF5`.
- Header: sticky/non-scrolling visual region, `64px` brand row plus a compact title/status row; apply top safe-area inset at screen level.
- Main horizontal margins: `16px`.
- Main vertical card gap: `16px`; the first card begins at `96px` from the top of the reference viewport, leaving an `8px` gap below the compact header.
- Cards: white, `8px` radius, `16px` padding, no heavy border; micro-shadow only (`0/1`, low-opacity forest, radius `4`, elevation `1`).
- Inner neutral panels and chips: `#F0F5F0`, `4px` radius, typically `10-12px` padding. Reserve `8px` for outer cards and the logout button.
- Minimum interactive target: `44px`; logout height `48px`; notification target `44x44`.
- Profile avatar: `80x80`, `12px` radius (the Stitch `rounded-full` token resolves to `12px`, so it is a rounded square at this size). Verified badge: `24x24` and circular at lower right.
- Header avatar: `32x32`, `12px` radius. Logo slot: about `32x32` with `contain` crop.
- Farm stat grid: 3 equal columns, `4px` gap, each with `10px` padding and centered text.
- Support icon wells: `36x36` with `12px` radius; support rows use `10px` vertical padding and subtle `1px` dividers. The `32x32` bank icon well also uses `12px` radius.
- Scroll content bottom padding must clear the existing native/web tab shell using `BottomTabInset` plus at least `24px`.
- On tablets/web, center the content column with `maxWidth: 430`; keep the single-column mobile hierarchy.
- The narrow web tab shell stays within the viewport, reserves `64px` below `TabSlot`, and shows the existing four tab destinations without the desktop-only `Rẫy Giá`/Docs items. This is a responsive presentation of the existing navigation, not a second screen-local navigation.

## Typography

- Headings/brand: Manrope 600/700.
- Body, labels, IDs, account numbers, and metrics: Public Sans 400/500/600/700.
- `headline-sm`: `18/24`, weight 600, letter spacing about `-0.09px`.
- `title-md`: `16/22`, weight 600.
- `body-sm`: `12/16`, weight 400, letter spacing `0.12px`.
- `label-sm`: `11/14`, weight 600, letter spacing `0.44px`.
- `numeric-lg`: `18/24`, weight 600, tabular figures where supported.
- `numeric-md`: `14/20`, weight 600; use for the farmer ID, bank account, linked-record ID, and unit chip.
- Keep existing `ThemedText` size/line-height metrics; supply screen-local font-family and weight styles rather than changing shared typography.

## Colors and elevation

- Surface: `#F6FBF5`; card: `#FFFFFF`.
- Neutral low/container/highest: `#F0F5F0` / `#EBEFEA` / `#DFE4DF`.
- Primary text/mark: `#012D1D`; primary container: `#1B4332`.
- Secondary/accent: `#2C694E`; mint container: `#AEEECB`; mint text: `#316E52`.
- Main text: `#181D1A`; secondary text: `#414844`; outline: `#717973`.
- Error/logout: `#BA1A1A`.
- Notification dot: `8x8`, red with a `2px` canvas-colored ring.
- Avoid gradients, glass effects, heavy shadows, and decorative illustration.

## Exact content

- Brand: `NôngSản Pro`; region: `Tây Nguyên • Đắk Lắk`.
- Screen title/status: `Cá Nhân`; `Trực tuyến`.
- Farmer: `Nguyễn Văn Năm`; nickname `Chú Năm`; cooperative `HTX Nông nghiệp Tân Lập`; address `Ea Kpam, Cư M'gar, Đắk Lắk`.
- Farmer ID: `DL-2024-8891`; verification: `Chính chủ đã duyệt`.
- Farm card: `Quy mô nông trại`; `Niên vụ 2024`; stats `4.5 / Hecta (ha)`, `Cà & Tiêu / Robusta/Tiêu`, `18.2 / Tấn / năm`.
- Bank: `Tài khoản & Thanh toán`; `Thay đổi`; `Vietcombank`; `Chi nhánh Đắk Lắk`; `0231••••89`; linked ID copy ending `ĐL-671203`.
- Preferences: `Cài đặt báo giá & Thị trường`; reference region `Đắk Lắk`; Zalo/SMS threshold `> 2,000 ₫/kg`; unit `VND (₫) / kg`.
- Support: hotline `1800 68xx (Nhánh 1)`; guide and policy copy exactly as in the Stitch HTML.
- Footer: `Đăng xuất tài khoản`; `NôngSản Pro v2.4.1`; `Bản chuẩn cho Nông hộ & Hợp tác xã Việt Nam`.

## Interaction behavior

- Notification opens `/alerts` through Expo Router.
- Header avatar stays on the current account screen and remains pressable/accessibility-labeled.
- Region selector is a real pressable; show a native alert or small local selection behavior without adding a route.
- Zalo/SMS switch is controlled local state, initially on, with `accessibilityRole="switch"` and checked state.
- `Thay đổi` is a real pressable; show a native informational alert until a bank-edit flow exists.
- Hotline opens `tel:18006800` using `Linking`.
- Guide and policy rows are pressable and provide clear native feedback without creating unrequested routes.
- Logout asks for confirmation with `Alert.alert`; do not implement backend auth or destructive persistence.
- All pressables expose roles/labels/states and pressed feedback. Important controls must have at least a `44px` hit target.

## Safe area, scrolling, and responsiveness

- Use `SafeAreaView` with top edge. Let the tab navigator own the bottom system inset.
- Header stays above the scrolling card stack; only the main body scrolls.
- Do not place app content under the status bar or native tab bar.
- At narrow widths, text blocks shrink before trailing controls; use `flexShrink`, `numberOfLines`, and bounded trailing widths to avoid overlap.
- The 3-column stat grid must remain one row at `390px`; preserve readable 11-18px typography and 4px gaps.

## Acceptance criteria

- At a `390px` mobile width, section order, dimensions, spacing, copy, palette, radii, shadows, imagery, and icon placement visually track the full Stitch reference.
- Screen scrolls smoothly and the native/web account tab remains reachable without duplicated navigation.
- Toggle, notification, region, bank change, support actions, hotline, avatar, and logout produce appropriate behavior/feedback.
- No custom SVG, emoji, glyph-as-icon, placeholder, or generated replacement is used for supplied assets/icons.
- `npm run typecheck` and `npm run lint` pass.
- Final browser/device render is compared against the normalized Stitch screenshot and `design-qa.md` ends with `final result: passed` before handoff.
