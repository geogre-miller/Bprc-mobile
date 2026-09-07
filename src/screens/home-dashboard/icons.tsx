import { SymbolView } from 'expo-symbols';

/** Approximates the Stitch design's Material Symbols, using SF Symbols on iOS. */
const ICONS = {
  bolt: { ios: 'bolt.fill', other: 'bolt' },
  chevron_right: { ios: 'chevron.right', other: 'chevron_right' },
  add_circle: { ios: 'plus.circle.fill', other: 'add_circle' },
  post_add: { ios: 'doc.badge.plus', other: 'post_add' },
  analytics: { ios: 'chart.bar.fill', other: 'analytics' },
  account_balance_wallet: { ios: 'wallet.pass.fill', other: 'account_balance_wallet' },
  handshake: { ios: 'person.2.fill', other: 'handshake' },
  call: { ios: 'phone.fill', other: 'call' },
  lightbulb: { ios: 'lightbulb.fill', other: 'lightbulb' },
  arrow_forward: { ios: 'arrow.right', other: 'arrow_forward' },
  arrow_upward: { ios: 'arrow.up', other: 'arrow_upward' },
  arrow_downward: { ios: 'arrow.down', other: 'arrow_downward' },
  trending_up: { ios: 'chart.line.uptrend.xyaxis', other: 'trending_up' },
  trending_down: { ios: 'chart.line.downtrend.xyaxis', other: 'trending_down' },
  location_on: { ios: 'location.fill', other: 'location_on' },
  notifications: { ios: 'bell.fill', other: 'notifications' },
  tune: { ios: 'slider.horizontal.3', other: 'tune' },
  person: { ios: 'person.crop.circle.fill', other: 'person' },
  storefront: { ios: 'leaf.fill', other: 'storefront' },
  coffee: { ios: 'cup.and.saucer.fill', other: 'coffee' },
  grain: { ios: 'circle.grid.3x3.fill', other: 'grain' },
  eco: { ios: 'leaf.fill', other: 'eco' },
  grass: { ios: 'leaf.fill', other: 'grass' },
  nutrition: { ios: 'carrot.fill', other: 'nutrition' },
  forest: { ios: 'tree.fill', other: 'forest' },
  search: { ios: 'magnifyingglass', other: 'search' },
  close: { ios: 'xmark', other: 'close' },
  swap_vert: { ios: 'arrow.up.arrow.down', other: 'swap_vert' },
  expand_more: { ios: 'chevron.down', other: 'expand_more' },
  check_circle: { ios: 'checkmark.circle.fill', other: 'check_circle' },
  psychology: { ios: 'brain.head.profile', other: 'psychology' },
  notification_important: { ios: 'bell.badge.fill', other: 'notification_important' },
  psychiatry: { ios: 'circle.hexagongrid.fill', other: 'psychiatry' },
  arrow_back: { ios: 'arrow.left', other: 'arrow_back' },
  share: { ios: 'square.and.arrow.up', other: 'share' },
  add_alert: { ios: 'bell.badge', other: 'add_alert' },
  pin_drop: { ios: 'mappin.and.ellipse', other: 'pin_drop' },
  schedule: { ios: 'clock', other: 'schedule' },
  star: { ios: 'star.fill', other: 'star' },
  verified: { ios: 'checkmark.seal.fill', other: 'verified' },
  scale: { ios: 'scalemass.fill', other: 'scale' },
  local_shipping: { ios: 'truck.box.fill', other: 'local_shipping' },
  payments: { ios: 'banknote.fill', other: 'payments' },
  chat: { ios: 'message.fill', other: 'chat' },
  store: { ios: 'building.2.fill', other: 'store' },
  receipt_long: { ios: 'doc.text.fill', other: 'receipt_long' },
  inventory_2: { ios: 'shippingbox.fill', other: 'inventory_2' },
  home: { ios: 'house.fill', other: 'home' },
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 18, color }: { name: IconName; size?: number; color: string }) {
  const icon = ICONS[name];
  return <SymbolView name={{ ios: icon.ios, android: icon.other, web: icon.other }} size={size} tintColor={color} />;
}
