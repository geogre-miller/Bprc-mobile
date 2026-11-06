/**
 * Ranks the buyers that would take a selling intent, best price first.
 * Pure on purpose: data comes in as arguments, so `npm test` can load it.
 */

type Buyer = { id: string; name: string; commodities: string[]; verified: boolean };
type Observation = { buyerId?: string; commodity: string; pricePerUnit: number };
type Demand = {
  buyerId: string;
  commodity: string;
  pricePerUnit: number;
  remainingQuantity?: number;
  unit: string;
  periodEnd?: string;
};

export type Offer<B extends Buyer, D extends Demand> = {
  buyer: B;
  price: number;
  demand?: D;
  estimatedValue: number;
};

/**
 * A buyer's quoted price wins over their open buying post. A post that has run out (past its end
 * date or nothing left to buy) is ignored, so the list never promises a price nobody still pays.
 */
export function rankOffers<B extends Buyer, D extends Demand>(
  intent: { commodity: string; quantity: number },
  buyers: readonly B[],
  observations: readonly Observation[],
  demands: readonly D[],
  now: Date,
): Offer<B, D>[] {
  const offers: Offer<B, D>[] = [];
  for (const buyer of buyers) {
    if (!buyer.commodities.includes(intent.commodity)) continue;
    const quoted = observations.find((o) => o.buyerId === buyer.id && o.commodity === intent.commodity)?.pricePerUnit;
    const demand = demands.find(
      (d) =>
        d.buyerId === buyer.id &&
        d.commodity === intent.commodity &&
        (!d.periodEnd || new Date(d.periodEnd) >= now) &&
        (d.remainingQuantity ?? 1) > 0,
    );
    const price = quoted ?? demand?.pricePerUnit;
    if (price == null) continue;
    offers.push({ buyer, price, demand, estimatedValue: price * intent.quantity });
  }
  return offers.sort((a, b) => b.price - a.price);
}
