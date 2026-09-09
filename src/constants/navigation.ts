export const BOTTOM_NAV_ITEMS = [
  { key: 'home', tabName: 'index', href: '/', label: 'Tổng quan', icon: 'home' },
  { key: 'market', tabName: '(market)', href: '/market', label: 'Thị trường', icon: 'trending_up' },
  { key: 'buyers', tabName: '(buyers)', href: '/buyers', label: 'Đầu mối', icon: 'storefront' },
  { key: 'inventory', tabName: '(inventory)', href: '/inventory', label: 'Kho & Lãi', icon: 'inventory_2' },
  { key: 'account', tabName: '(account)', href: '/account', label: 'Của tôi', icon: 'person' },
] as const;

export type BottomNavRoute = (typeof BOTTOM_NAV_ITEMS)[number]['key'];
