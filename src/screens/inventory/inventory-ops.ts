import type { Commodity, FarmerInventoryItem } from '@/types/domain';

export type StockInput = { commodity: Commodity; quantity: number; unitCost?: number };

/**
 * Adds a lot to the stock. A commodity already held gets its quantity added and its cost
 * averaged by weight (a missing cost on either side keeps the known one), so one commodity is one row.
 */
export function addStock(items: FarmerInventoryItem[], input: StockInput): FarmerInventoryItem[] {
  const index = items.findIndex((item) => item.commodity === input.commodity && item.unit === 'kg');
  if (index === -1) {
    return [...items, { commodity: input.commodity, quantity: input.quantity, unit: 'kg', unitCost: input.unitCost }];
  }
  return items.map((item, i) => {
    if (i !== index) return item;
    const total = item.quantity + input.quantity;
    const unitCost =
      item.unitCost == null || item.quantity <= 0
        ? input.unitCost
        : input.unitCost == null
          ? item.unitCost
          : Math.round((item.unitCost * item.quantity + input.unitCost * input.quantity) / total);
    return { ...item, quantity: total, unitCost };
  });
}

/** Replaces the weighed quantity and cost of one row (the "Sửa số cân" correction). */
export function setStock(items: FarmerInventoryItem[], index: number, input: Omit<StockInput, 'commodity'>) {
  return items.map((item, i) => (i === index ? { ...item, quantity: input.quantity, unitCost: input.unitCost } : item));
}

export function removeStock(items: FarmerInventoryItem[], index: number) {
  return items.filter((_, i) => i !== index);
}

/** Parses a digits-only text field. Returns undefined for empty, NaN for anything that is not a plain number. */
export function parseAmount(text: string): number | undefined {
  const cleaned = text.replace(/[\s,.]/g, '');
  if (cleaned === '') return undefined;
  return /^\d+$/.test(cleaned) ? Number(cleaned) : Number.NaN;
}
