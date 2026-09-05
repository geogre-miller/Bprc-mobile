import { BUYERS, BUYING_DEMANDS, COMMODITIES, latestObservation, previousObservation } from '@/data/mock-data';
import { usePersistedState } from '@/hooks/use-persisted-state';
import type {
  BuyerProfile,
  BuyingDemand,
  Commodity,
  FarmerInventoryItem,
  PriceObservation,
  SellingJournalEntry,
} from '@/types/domain';

export const HOME_REGION = 'Ngọc Hồi, Kon Tum';
export const FARMER_NAME = 'Chú Năm';

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
  buyer?: BuyerProfile;
  commodityLabel?: string;
  postedLabel: string;
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
  movers: PriceRow[];
  topMover?: PriceRow;
  updatedLabel?: string;
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

  const demand = BUYING_DEMANDS[0];

  return {
    now,
    inventoryValue,
    inventoryChangePercent,
    gainVsQuoted,
    revenueThisMonth,
    closedDealCount: soldThisMonth.length,
    priceRows,
    movers,
    topMover: movers[0],
    updatedLabel: latestObservedAt ? formatRelativeTime(latestObservedAt, now) : undefined,
    demandHighlight: demand && {
      demand,
      buyer: BUYERS.find((buyer) => buyer.id === demand.buyerId),
      commodityLabel: COMMODITIES.find((c) => c.id === demand.commodity)?.label,
      postedLabel: formatRelativeTime(demand.periodStart, now),
      otherCount: Math.max(0, BUYING_DEMANDS.length - 1),
    },
  };
}
