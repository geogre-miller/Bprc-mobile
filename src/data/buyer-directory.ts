import type { IconName } from '@/screens/home-dashboard/icons';

import { getBuyer } from './mock-data';

export type BuyerPrice = {
  label: string;
  value: string;
  note: string;
  noteTone?: 'positive' | 'muted';
  badge?: string;
};

export type BuyerDirectoryEntry = {
  /** Id of the record in BUYERS. */
  id: string;
  name: string;
  verified: boolean;
  verificationIcon: IconName;
  rating: string;
  metadata: string[];
  badge: string;
  badgeTone: 'green' | 'orange' | 'neutral';
  trust?: string;
  /** Part of `trust` shown in bold. */
  trustHighlight?: string;
  trustIcon?: IconName;
  trustTone?: 'green' | 'orange';
  prices: [BuyerPrice, BuyerPrice];
  addressIcon: IconName;
  address: string;
  distance: string;
  policyIcon: IconName;
  policy: string;
  phone: string;
  callLabel: string;
  quote?: boolean;
  productTags: string[];
  distanceKm: number;
};

/**
 * The directory's display copy (badges, price wells, policy lines) for the buyer list.
 * Identity (name, verified, rating, phone) is read from BUYERS by id so it never drifts from the
 * detail page, Home, Match or the sale journal. Swap this file for the API response later.
 */
const roster = (id: string) => {
  const buyer = getBuyer(id);
  if (!buyer) throw new Error(`BUYERS has no record for directory entry ${id}`);
  return {
    name: buyer.name,
    verified: buyer.verified,
    rating: buyer.reputationScore != null ? buyer.reputationScore.toFixed(1) : '',
    phone: (buyer.contactPhone ?? '').replace(/\D/g, ''),
  };
};

export const BUYER_DIRECTORY: BuyerDirectoryEntry[] = [
  {
    id: 'b1',
    ...roster('b1'),
    verificationIcon: 'verified',
    metadata: ['48 lượt đánh giá'],
    badge: 'Đã chốt 4 vụ',
    badgeTone: 'green',
    trust: 'Bạn đã bán thành công 14.2 tấn với đại lý này',
    trustHighlight: '14.2 tấn',
    trustIcon: 'handshake',
    trustTone: 'green',
    prices: [
      { label: 'Cà phê nhân xô (Xô đẹp)', value: '119,200', note: '+1,200₫ so với hôm qua', noteTone: 'positive' },
      { label: 'Tiêu đen khô (Dung trọng 550)', value: '148,500', note: 'Ổn định', noteTone: 'muted' },
    ],
    addressIcon: 'pin_drop',
    address: 'Km 14, Quốc lộ 14, TX. Buôn Hồ',
    distance: '(Cách bạn 3.8 km)',
    policyIcon: 'payments',
    policy: 'Tiền mặt / Chuyển khoản trong 5 phút. Xe bốc tận vườn.',
    callLabel: '0914.829.xxx',
    productTags: ['coffee', 'pepper'],
    distanceKm: 3.8,
  },
  {
    id: 'b4',
    ...roster('b4'),
    verificationIcon: 'workspace_premium',
    metadata: ['82 nông hộ liên kết', 'Uy tín 6 năm'],
    badge: 'Xuất khẩu & OCOP',
    badgeTone: 'orange',
    trust: 'Ưu tiên thu mua quả chín cây tự nhiên, bảo trợ giá sàn 1 năm',
    trustIcon: 'local_florist',
    trustTone: 'orange',
    prices: [
      { label: 'Hái chín > 90%', value: '122,000', note: '+3,500₫ chênh lệch', noteTone: 'positive', badge: 'Cộng thưởng' },
      { label: 'Robusta Tiêu Chuẩn', value: '118,500', note: 'Nhân sàn 16/18', noteTone: 'muted' },
    ],
    addressIcon: 'location_on',
    address: 'Xã Ea Tu, TP. Buôn Ma Thuột',
    distance: '(Cách bạn 8.2 km)',
    policyIcon: 'fact_check',
    policy: 'Hợp đồng bao tiêu dài hạn, tạm ứng trước phân bón hữu cơ.',
    callLabel: 'Gọi HTX Ea Tu',
    quote: true,
    productTags: ['coffee'],
    distanceKm: 8.2,
  },
  {
    id: 'b5',
    ...roster('b5'),
    verificationIcon: 'verified',
    metadata: ['Thương vụ lớn (> 2 tấn)'],
    badge: 'Thu mua số lượng',
    badgeTone: 'neutral',
    prices: [
      { label: 'Sầu riêng Dona (Loại 1)', value: '107,000', note: 'Hái theo lứa cắt', noteTone: 'muted' },
      { label: 'Sầu riêng Ri6 (Loại A)', value: '89,000', note: 'Cần 15 tấn gấp', noteTone: 'positive' },
    ],
    addressIcon: 'place',
    address: 'Huyện Krông Pắk, Đắk Lắk',
    distance: '(Cách bạn 14.5 km)',
    policyIcon: 'local_shipping',
    policy: 'Điều đội xe container & thợ cắt chuyên nghiệp đến tận lô.',
    callLabel: 'Gọi An Phát',
    productTags: ['durian'],
    distanceKm: 14.5,
  },
];
