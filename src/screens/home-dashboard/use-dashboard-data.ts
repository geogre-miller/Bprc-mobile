import { BUYERS, BUYING_DEMANDS, COMMODITIES, latestObservation, previousObservation } from '@/data/mock-data';
import { usePersistedState } from '@/hooks/use-persisted-state';
import type {
  BuyerProfile,
  BuyingDemand,
  Commodity,
  FarmerInventoryItem,
  GeoLocation,
  PriceObservation,
  SellingJournalEntry,
} from '@/types/domain';

import { rankNearbyOffers } from './best-offer';

export const HOME_REGION = 'Ngọc Hồi, Kon Tum';
/** Mock: approximate Ngọc Hồi town centre until the seller's real location is captured. */
export const HOME_LOCATION: GeoLocation = { latitude: 14.71, longitude: 107.65 };

/** One commodity's market state, joined with how much of it the farmer holds. */
export type PriceRow = {
  id: Commodity;
  label: string;
  latest?: PriceObservation;
  changeAmount?: number;
  changePercent?: number;
  heldQuantity: number;
};

export type DemandHighlight = {
  demand: BuyingDemand;
  buyer: BuyerProfile;
  distanceKm: number;
  commodityLabel?: string;
  postedLabel: string;
  /** Offer minus the latest reference market price; absent when no reference price exists. */
  gapVsMarket?: number;
  otherCount: number;
};

export type DashboardData = {
  now: Date;
  inventoryValue: number;
  inventoryChangePercent?: number;
  gainVsQuoted: number;
  revenueThisMonth: number;
  closedDealCount: number;
  priceRows: PriceRow[];
  /** Rows for commodities the seller currently holds. */
  myRows: PriceRow[];
  movers: PriceRow[];
  updatedLabel?: string;
  /** True when no price was observed today, so the UI must not present prices as current. */
  pricesStale: boolean;
  demandHighlight?: DemandHighlight;
};

function isSameMonth(isoDate: string, reference: Date): boolean {
  const date = new Date(isoDate);
  return date.getMonth() === reference.getMonth() && date.getFullYear() === reference.getFullYear();
}

export function formatRelativeTime(isoDate: string, reference: Date): string {
  const minutes = Math.max(0, Math.round((reference.getTime() - new Date(isoDate).getTime()) / 60000));
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.round(hours / 24)} ngày trước`;
}

/**
 * Derives everything the dashboard renders from persisted farmer state plus the
 * price feed. Returns `null` until persisted state has loaded, so the screen can
 * stay a pure presentation layer.
 */
export function useDashboardData(): DashboardData | null {
  const [inventory, , inventoryLoaded] = usePersistedState<FarmerInventoryItem[]>('inventory', []);
  const [journal, , journalLoaded] = usePersistedState<SellingJournalEntry[]>('selling-journal', []);

  if (!inventoryLoaded || !journalLoaded) return null;

  const now = new Date();

  const inventoryValue = inventory.reduce(
    (sum, item) => sum + (latestObservation(item.commodity)?.pricePerUnit ?? 0) * item.quantity,
    0,
  );
  const previousInventoryValue = inventory.reduce((sum, item) => {
    const previous = previousObservation(item.commodity) ?? latestObservation(item.commodity);
    return sum + (previous?.pricePerUnit ?? 0) * item.quantity;
  }, 0);
  const inventoryChangePercent =
    previousInventoryValue > 0 ? ((inventoryValue - previousInventoryValue) / previousInventoryValue) * 100 : undefined;

  const soldThisMonth = journal.filter((entry) => isSameMonth(entry.soldAt, now));
  const revenueThisMonth = soldThisMonth.reduce((sum, entry) => sum + entry.actualPricePerUnit * entry.quantity, 0);
  const gainVsQuoted = soldThisMonth.reduce(
    (sum, entry) =>
      entry.quotedPricePerUnit != null
        ? sum + (entry.actualPricePerUnit - entry.quotedPricePerUnit) * entry.quantity
        : sum,
    0,
  );

  const priceRows: PriceRow[] = COMMODITIES.map((commodity) => {
    const latest = latestObservation(commodity.id);
    const previous = previousObservation(commodity.id);
    const changeAmount = latest && previous ? latest.pricePerUnit - previous.pricePerUnit : undefined;
    const changePercent =
      latest && previous && previous.pricePerUnit ? (changeAmount! / previous.pricePerUnit) * 100 : undefined;
    const heldQuantity = inventory
      .filter((item) => item.commodity === commodity.id)
      .reduce((sum, item) => sum + item.quantity, 0);
    return { ...commodity, latest, changeAmount, changePercent, heldQuantity };
  });

  const movers = [...priceRows]
    .filter((row) => row.changePercent != null)
    .sort((a, b) => Math.abs(b.changePercent!) - Math.abs(a.changePercent!));

  const latestObservedAt = priceRows
    .map((row) => row.latest?.observedAt)
    .filter((value): value is string => !!value)
    .sort()
    .at(-1);

  const myRows = priceRows.filter((row) => row.heldQuantity > 0);
  const offers = rankNearbyOffers(
    BUYING_DEMANDS,
    BUYERS,
    new Map(myRows.map((row) => [row.id, row.heldQuantity])),
    HOME_LOCATION,
    now,
  );
  const best = offers[0];
  const bestReference = best && latestObservation(best.demand.commodity);

  return {
    now,
    inventoryValue,
    inventoryChangePercent,
    gainVsQuoted,
    revenueThisMonth,
    closedDealCount: soldThisMonth.length,
    priceRows,
    myRows,
    movers,
    updatedLabel: latestObservedAt ? formatRelativeTime(latestObservedAt, now) : undefined,
    pricesStale: !latestObservedAt || new Date(latestObservedAt).toDateString() !== now.toDateString(),
    demandHighlight: best && {
      ...best,
      commodityLabel: COMMODITIES.find((c) => c.id === best.demand.commodity)?.label,
      postedLabel: formatRelativeTime(best.demand.periodStart, now),
      gapVsMarket:
        bestReference?.kind === 'reference_market'
          ? best.demand.priceRangeMax - bestReference.pricePerUnit
          : undefined,
      otherCount: offers.length - 1,
    },
  };
}
