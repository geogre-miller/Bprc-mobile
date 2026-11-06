import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback } from 'react';

import { persistedStorageKey, usePersistedState } from '@/hooks/use-persisted-state';
import type { Commodity, FarmerInventoryItem, SellingJournalEntry } from '@/types/domain';

const JOURNAL_KEY = 'selling-journal';
const INVENTORY_KEY = 'inventory';

/** Starting stock shown before the farmer has saved any inventory of their own. */
export const DEFAULT_INVENTORY: FarmerInventoryItem[] = [
  { commodity: 'coffee', quantity: 2500, unit: 'kg' },
  { commodity: 'pepper', quantity: 800, unit: 'kg' },
  { commodity: 'fruit', quantity: 1200, unit: 'kg' },
  { commodity: 'rice', quantity: 5000, unit: 'kg' },
];

export function reconcileInventory(
  items: FarmerInventoryItem[],
  commodity: Commodity,
  quantity: number,
  fallbackStock: number,
): FarmerInventoryItem[] {
  const hasMatchingItem = items.some((item) => item.commodity === commodity && item.unit === 'kg');
  if (!hasMatchingItem) {
    return [...items, { commodity, quantity: Math.max(0, fallbackStock - quantity), unit: 'kg' }];
  }

  let remaining = quantity;
  return items.map((item) => {
    if (item.commodity !== commodity || item.unit !== 'kg' || remaining <= 0) return item;
    const deduction = Math.min(Math.max(0, item.quantity), remaining);
    remaining -= deduction;
    return { ...item, quantity: Math.max(0, item.quantity - deduction) };
  });
}

type SaleInput = {
  entry: SellingJournalEntry;
  commodity: Commodity;
  quantity: number;
  /** Stock to assume when the inventory has no matching row yet. */
  fallbackStock: number;
};

/**
 * Owns the selling journal and the farmer's inventory, which a sale changes together.
 * `recordSale` writes both or neither: if the inventory write fails, the journal is rolled back.
 */
export function useSaleLedger() {
  const [entries, setEntries, entriesLoaded] = usePersistedState<SellingJournalEntry[]>(JOURNAL_KEY, []);
  const [inventory, setInventory, inventoryLoaded] = usePersistedState<FarmerInventoryItem[] | null>(INVENTORY_KEY, null);

  const recordSale = useCallback(
    async ({ entry, commodity, quantity, fallbackStock }: SaleInput) => {
      const nextEntries = [entry, ...entries];
      const nextInventory = reconcileInventory(inventory ?? DEFAULT_INVENTORY, commodity, quantity, fallbackStock);
      const journalKey = persistedStorageKey(JOURNAL_KEY);

      await AsyncStorage.setItem(journalKey, JSON.stringify(nextEntries));
      try {
        await AsyncStorage.setItem(persistedStorageKey(INVENTORY_KEY), JSON.stringify(nextInventory));
      } catch (error) {
        // Best effort: if the rollback also fails the original error is still the one reported.
        await AsyncStorage.setItem(journalKey, JSON.stringify(entries)).catch(() => undefined);
        throw error;
      }
      setEntries(nextEntries);
      setInventory(nextInventory);
    },
    [entries, inventory, setEntries, setInventory],
  );

  const removeEntry = useCallback(
    (id: string) => setEntries((current) => current.filter((entry) => entry.id !== id)),
    [setEntries],
  );

  return { entries, inventory, isLoaded: entriesLoaded && inventoryLoaded, recordSale, removeEntry };
}
