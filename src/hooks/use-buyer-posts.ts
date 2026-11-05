import { usePersistedState } from '@/hooks/use-persisted-state';
import type { BuyerProfile, BuyingDemand } from '@/types/domain';

/** Local-only identity for the trader using this device, until accounts exist. */
export const MY_BUYER_ID = 'me-buyer';

export const EMPTY_BUYER_PROFILE: BuyerProfile = {
  id: MY_BUYER_ID,
  name: '',
  address: { line: '', district: 'Ngọc Hồi', province: 'Kon Tum' },
  commodities: [],
  contactPhone: '',
  verified: false,
};

/** Posts saved before the single-price model carried priceRangeMin/Max; read them at their max. */
const normalize = (post: BuyingDemand & { priceRangeMax?: number }): BuyingDemand => ({
  ...post,
  pricePerUnit: post.pricePerUnit ?? post.priceRangeMax ?? 0,
});

export function useMyBuyerPosts() {
  const [stored, setPosts, loaded] = usePersistedState<BuyingDemand[]>('my-buyer-demands', []);
  return [stored.map(normalize), setPosts, loaded] as const;
}

export function useMyBuyerProfile() {
  return usePersistedState<BuyerProfile>('my-buyer-profile', EMPTY_BUYER_PROFILE);
}

const DAY_MS = 86_400_000;

export function isPostActive(post: BuyingDemand, now: Date): boolean {
  return (!post.periodEnd || new Date(post.periodEnd) >= now) && (post.remainingQuantity ?? 1) > 0;
}

export function expiryLabel(post: BuyingDemand, now: Date): string {
  if (!post.periodEnd) return 'Không thời hạn';
  const days = Math.ceil((new Date(post.periodEnd).getTime() - now.getTime()) / DAY_MS);
  if (days < 0) return 'Đã hết hạn';
  if (days === 0) return 'Hết hạn hôm nay';
  return `Còn ${days} ngày`;
}

export function addDays(from: Date, days: number): string {
  return new Date(from.getTime() + days * DAY_MS).toISOString();
}
