import type { IconName } from '@/screens/home-dashboard/icons';

import { BUYERS } from './mock-data';

export type BuyerPrice = {
  label: string;
  value: string;
  note: string;
  noteTone?: 'positive' | 'muted';
  badge?: string;
};

export type BuyerDirectoryEntry = {
  id: 'b1' | 'b2' | 'b3';
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
 * Entry b1 reads its identity (name, rating, phone) from BUYERS so those never drift.
 * b2 and b3 are directory-only mock buyers with no BUYERS record yet: swap this file for the
 * API response when buyer profiles exist.
 */
const b1Profile = BUYERS.find((buyer) => buyer.id === 'b1')!;
const phoneDigits = (phone?: string) => (phone ?? '').replace(/\D/g, '');

export const BUYER_DIRECTORY: BuyerDirectoryEntry[] = [
  {
    id: 'b1',
    name: b1Profile.name,
    verified: b1Profile.verified,
    verificationIcon: 'verified',
    rating: String(b1Profile.reputationScore),
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
    phone: phoneDigits(b1Profile.contactPhone),
    callLabel: '0914.829.xxx',
    productTags: ['coffee', 'pepper'],
    distanceKm: 3.8,
  },
  {
    id: 'b2',
    name: 'HTX Cà Phê Bền Vững Ea Tu',
    verified: true,
    verificationIcon: 'workspace_premium',
    rating: '4.8',
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
    phone: '0943187291',
    callLabel: 'Gọi HTX Ea Tu',
    quote: true,
    productTags: ['coffee'],
    distanceKm: 8.2,
  },
  {
    id: 'b3',
    name: 'Kho Nông Sản XK An Phát',
    verified: true,
    verificationIcon: 'verified',
    rating: '4.7',
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
    phone: '0905112233',
    callLabel: 'Gọi An Phát',
    productTags: ['durian'],
    distanceKm: 14.5,
  },
];
