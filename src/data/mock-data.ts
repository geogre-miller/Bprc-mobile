/**
 * Placeholder data standing in for the future prices/buyers API.
 * Replace with real fetches once the backend exists — shape mirrors
 * src/types/domain.ts so the swap only touches this file's callers.
 */
import type { BuyerProfile, BuyingDemand, Commodity, PriceObservation } from '@/types/domain';

export const COMMODITIES: { id: Commodity; label: string }[] = [
  { id: 'coffee', label: 'Cà phê' },
  { id: 'pepper', label: 'Hồ tiêu' },
  { id: 'cassava', label: 'Sắn' },
  { id: 'rubber', label: 'Cao su' },
  { id: 'cashew', label: 'Điều' },
];

export const PRICE_OBSERVATIONS: PriceObservation[] = [
  {
    id: 'p1',
    commodity: 'coffee',
    kind: 'reference_market',
    pricePerUnit: 112000,
    unit: 'kg',
    source: 'public_reference',
    observedAt: '2026-09-03T02:00:00Z',
    confidence: 'high',
  },
  {
    id: 'p2',
    commodity: 'coffee',
    kind: 'buyer_quoted',
    pricePerUnit: 114500,
    unit: 'kg',
    source: 'verified_buyer',
    buyerId: 'b1',
    observedAt: '2026-09-03T06:30:00Z',
    confidence: 'recently_verified',
  },
  {
    id: 'p3',
    commodity: 'pepper',
    kind: 'reference_market',
    pricePerUnit: 158000,
    unit: 'kg',
    source: 'public_reference',
    observedAt: '2026-09-02T02:00:00Z',
    confidence: 'should_confirm',
  },
  {
    id: 'p4',
    commodity: 'cassava',
    kind: 'buyer_quoted',
    pricePerUnit: 2450,
    unit: 'kg',
    source: 'verified_buyer',
    buyerId: 'b2',
    observedAt: '2026-09-03T05:00:00Z',
    confidence: 'recently_verified',
  },
  {
    id: 'p5',
    commodity: 'rubber',
    kind: 'reference_market',
    pricePerUnit: 385000,
    unit: 'kg',
    source: 'public_reference',
    observedAt: '2026-08-30T02:00:00Z',
    confidence: 'outdated',
  },
  {
    id: 'p6',
    commodity: 'cashew',
    kind: 'reference_market',
    pricePerUnit: 41000,
    unit: 'kg',
    source: 'public_reference',
    observedAt: '2026-09-03T02:00:00Z',
    confidence: 'high',
  },
];

export const BUYERS: BuyerProfile[] = [
  {
    id: 'b1',
    name: 'Đại lý Nông sản Minh Tâm',
    address: {
      line: 'QL40, Thôn 1',
      district: 'Ngọc Hồi',
      province: 'Kon Tum',
      location: { latitude: 14.7, longitude: 107.68 },
    },
    commodities: ['coffee', 'pepper'],
    contactPhone: '0905 123 456',
    verified: true,
    reputationScore: 4.6,
  },
  {
    id: 'b2',
    name: 'Kho thu mua Bờ Y',
    address: {
      line: 'Cửa khẩu Bờ Y',
      district: 'Ngọc Hồi',
      province: 'Kon Tum',
      location: { latitude: 14.75, longitude: 107.58 },
    },
    commodities: ['cassava', 'rubber'],
    contactPhone: '0912 555 789',
    verified: true,
    reputationScore: 4.2,
  },
  {
    id: 'b3',
    name: 'Vựa Điều Thành Phát',
    address: {
      line: 'Thôn 3, Xã Đắk Xú',
      district: 'Ngọc Hồi',
      province: 'Kon Tum',
    },
    commodities: ['cashew'],
    contactPhone: '0987 222 111',
    verified: false,
  },
];

export const BUYING_DEMANDS: BuyingDemand[] = [
  {
    id: 'd1',
    buyerId: 'b1',
    commodity: 'coffee',
    priceRangeMin: 113000,
    priceRangeMax: 116000,
    unit: 'kg',
    desiredQuantity: 5000,
    remainingQuantity: 3200,
    qualityRequirements: 'Độ ẩm dưới 13%',
    periodStart: '2026-09-01T00:00:00Z',
    periodEnd: '2026-09-15T00:00:00Z',
  },
  {
    id: 'd2',
    buyerId: 'b2',
    commodity: 'cassava',
    priceRangeMin: 2400,
    priceRangeMax: 2500,
    unit: 'kg',
    desiredQuantity: 20000,
    remainingQuantity: 20000,
    periodStart: '2026-09-03T00:00:00Z',
  },
];
