import type { IconName } from '@/screens/home-dashboard/icons';
import type { Commodity } from '@/types/domain';

import { BUYER_DIRECTORY } from './buyer-directory';
import { BUYING_DEMANDS, COMMODITIES, PRICE_OBSERVATIONS } from './mock-data';

/** One purchase price a buyer publishes, normalized for the buyer detail page. */
export type BuyerQuote = {
  key: string;
  /** Set when the price maps to a tracked commodity, so a sale can be started for it. */
  commodity?: Commodity;
  title: string;
  badge?: string;
  description?: string;
  price: number;
  priceNote?: string;
  /** Highlights the note as a premium over the market price. */
  gain?: boolean;
  quota?: string;
  urgent?: boolean;
  compact?: boolean;
};

export type BuyerPolicy = { icon: IconName; title: string; description: string };

/** Rich profile copy that only some buyers have (owner, licence, history, warehouse, policies). */
export type BuyerExtras = {
  portraitLabel: string;
  owner: string;
  license: string;
  quota: string;
  stats: { icon: IconName; value: string; label: string; tone: 'amber' | 'primary' | 'secondary' }[];
  quotes: BuyerQuote[];
  warehouseLabel: string;
  warehouseCaption: string;
  history: {
    note: string;
    dealsLabel: string;
    total: string;
    volume: string;
    rows: { title: string; detail: string; value: string }[];
  };
  policies: BuyerPolicy[];
};

/** Only b1 has a full profile so far. Other buyers fall back to `buildBuyerQuotes` and the directory. */
export const BUYER_EXTRAS: Record<string, BuyerExtras> = {
  b1: {
    portraitLabel: 'Anh Trần Toàn Thắng tại kho nông sản',
    owner: 'Chủ cơ sở: Anh Trần Toàn Thắng',
    license: 'Cấp phép bởi Sở Công Thương Đắk Lắk',
    quota: 'Đang cần 3 tấn',
    stats: [
      { icon: 'star', value: '4.9', label: '48 đánh giá', tone: 'amber' },
      { icon: 'history', value: '8 năm', label: 'Thâm niên', tone: 'primary' },
      { icon: 'payments', value: '100%', label: 'Đúng hạn', tone: 'secondary' },
    ],
    quotes: [
      {
        key: 'coffee',
        commodity: 'coffee',
        title: 'Cà phê Robusta',
        badge: 'Nhân xô',
        description: 'Yêu cầu ẩm ≤ 15% • Tạp chất ≤ 1%',
        price: 119200,
        priceNote: '+700 ₫ so với sàn',
        gain: true,
        quota: 'Cần gấp 10 tấn',
        urgent: true,
      },
      {
        key: 'pepper',
        commodity: 'pepper',
        title: 'Hồ tiêu đen',
        badge: 'Dung trọng 550g/l',
        description: 'Tiêu khô đều, không ẩm mốc',
        price: 148500,
        priceNote: 'Bằng giá thị trường',
        quota: 'Đang cần 3 tấn',
      },
      {
        key: 'fresh-coffee',
        title: 'Cà phê quả tươi',
        badge: 'Hái chín >85%',
        description: 'Cân xô tại vườn hoặc tại kho',
        price: 24500,
        compact: true,
      },
    ],
    warehouseLabel: 'Kho tổng Buôn Hồ',
    warehouseCaption: 'Kho tổng Buôn Hồ • Sức chứa 2,500 tấn',
    history: {
      note: 'Khách hàng thân thiết',
      dealsLabel: '4 vụ đã chốt',
      total: '1,480,000,000',
      volume: '14.2 tấn',
      rows: [
        { title: '3,500 kg Cà phê Robusta', detail: 'Ngày 18/09/2024 • Đơn giá 116,000 ₫/kg', value: '406,000,000 ₫' },
        { title: '1,200 kg Tiêu đen', detail: 'Ngày 05/06/2024 • Đơn giá 142,000 ₫/kg', value: '170,400,000 ₫' },
      ],
    },
    policies: [
      {
        icon: 'water_drop',
        title: 'Độ ẩm & Tạp chất',
        description: 'Độ ẩm tiêu chuẩn: Cà phê ≤ 15%, Tạp chất ≤ 1%. Kiểm tra bằng máy Kett điện tử trước mặt chủ vườn.',
      },
      {
        icon: 'scale',
        title: 'Cân điện tử kiểm định',
        description:
          'Hệ thống cân điện tử 80 tấn và cân bàn có tem kiểm định định kỳ của Chi cục Tiêu chuẩn Đo lường Chất lượng.',
      },
      {
        icon: 'local_shipping',
        title: 'Vận chuyển bốc hàng miễn phí',
        description:
          'Có đội xe tải 2.5 - 5 tấn hỗ trợ bốc hàng tận kho vườn miễn phí trong bán kính 15 km (từ 1 tấn trở lên).',
      },
    ],
  },
};

const toNumber = (value: string) => Number(value.replace(/[^\d]/g, ''));

/**
 * Prices to show for a buyer: the full profile if there is one, else the directory price wells,
 * else the buyer's quoted observations and still-open buying posts. Empty when nothing is published.
 */
export function buildBuyerQuotes(buyerId: string, now: Date): BuyerQuote[] {
  const extras = BUYER_EXTRAS[buyerId];
  if (extras) return extras.quotes;

  const entry = BUYER_DIRECTORY.find((item) => item.id === buyerId);
  if (entry) {
    return entry.prices.map((price) => ({
      key: price.label,
      title: price.label,
      badge: price.badge,
      price: toNumber(price.value),
      priceNote: price.note,
      gain: price.noteTone === 'positive',
    }));
  }

  const label = (commodity: Commodity) => COMMODITIES.find((item) => item.id === commodity)?.label ?? commodity;
  const quoted = PRICE_OBSERVATIONS.filter(
    (observation) => observation.buyerId === buyerId && observation.kind === 'buyer_quoted',
  ).map<BuyerQuote>((observation) => ({
    key: observation.id,
    commodity: observation.commodity,
    title: label(observation.commodity),
    badge: 'Giá báo',
    price: observation.pricePerUnit,
  }));
  const open = BUYING_DEMANDS.filter(
    (demand) =>
      demand.buyerId === buyerId &&
      (!demand.periodEnd || new Date(demand.periodEnd) >= now) &&
      (demand.remainingQuantity ?? 1) > 0,
  ).map<BuyerQuote>((demand) => ({
    key: demand.id,
    commodity: demand.commodity,
    title: label(demand.commodity),
    badge: 'Tin thu mua',
    description: demand.qualityRequirements,
    price: demand.pricePerUnit,
    priceNote: demand.priceNote,
    quota: demand.remainingQuantity != null ? `Còn cần ${demand.remainingQuantity.toLocaleString('en-US')} ${demand.unit}` : undefined,
  }));
  return [...open, ...quoted.filter((quote) => !open.some((demand) => demand.commodity === quote.commodity))];
}
