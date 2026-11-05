import type { BuyerProfile, BuyingDemand, Commodity, GeoLocation } from '@/types/domain';

/** Default "near me" radius. Offers beyond it are not shown as "near you". */
export const NEARBY_RADIUS_KM = 20;

export type RankedOffer = {
  demand: BuyingDemand;
  buyer: BuyerProfile;
  distanceKm: number;
  /** What the seller could earn from this offer: price × min(held stock, quantity still wanted). */
  potentialRevenue: number;
};

/** Great-circle distance; accurate enough for "how far to haul the stock". */
export function distanceKm(a: GeoLocation, b: GeoLocation): number {
  const rad = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * rad;
  const dLon = (b.longitude - a.longitude) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/**
 * Open demands from verified buyers within the radius, for commodities the seller holds,
 * ranked by potential revenue (highest first), then distance (closest first).
 * Raw ₫/kg is not comparable across commodities, so it is not the ranking key.
 * Buyers without a known location are excluded: "nearby" cannot be claimed for them.
 */
export function rankNearbyOffers(
  demands: BuyingDemand[],
  buyers: BuyerProfile[],
  held: Map<Commodity, number>,
  home: GeoLocation,
  now: Date,
  radiusKm = NEARBY_RADIUS_KM,
): RankedOffer[] {
  const offers: RankedOffer[] = [];
  for (const demand of demands) {
    const heldQuantity = held.get(demand.commodity) ?? 0;
    if (heldQuantity <= 0 || demand.remainingQuantity <= 0) continue;
    if (demand.periodEnd && new Date(demand.periodEnd) < now) continue;
    const buyer = buyers.find((candidate) => candidate.id === demand.buyerId);
    const location = buyer?.address.location;
    if (!buyer?.verified || !location) continue;
    const distance = distanceKm(home, location);
    if (distance > radiusKm) continue;
    const potentialRevenue = demand.priceRangeMax * Math.min(heldQuantity, demand.remainingQuantity);
    offers.push({ demand, buyer, distanceKm: distance, potentialRevenue });
  }
  return offers.sort((a, b) => b.potentialRevenue - a.potentialRevenue || a.distanceKm - b.distanceKm);
}
