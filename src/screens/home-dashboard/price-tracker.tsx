import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { CommodityPriceRow } from './commodity-price-row';
import { Icon } from './icons';
import type { PriceRow } from './use-dashboard-data';

type PriceFilter = 'all' | 'mine' | 'up' | 'down';

function matchesFilter(row: PriceRow, filter: PriceFilter): boolean {
  if (filter === 'mine') return row.heldQuantity > 0;
  if (filter === 'up') return (row.changePercent ?? 0) > 0;
  if (filter === 'down') return (row.changePercent ?? 0) < 0;
  return true;
}

/** Today's prices: section head, scrolling filter chips, and the commodity ledger. */
export function PriceTracker({ rows }: { rows: PriceRow[] }) {
  const theme = useTheme();
  const [filter, setFilter] = useState<PriceFilter>('all');

  const filters: [PriceFilter, string][] = [
    ['all', 'Tất cả'],
    ['mine', `Của tôi (${rows.filter((row) => row.heldQuantity > 0).length})`],
    ['up', 'Tăng mạnh ↗'],
    ['down', 'Giảm ↘'],
  ];

  return (
    <ThemedView style={styles.section}>
      <ThemedView style={styles.headerRow}>
        <Icon name="analytics" size={20} color={theme.accent} />
        <ThemedText type="headlineSm">Giá nông sản hôm nay</ThemedText>
      </ThemedView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}>
        {filters.map(([value, label]) => {
          const selected = filter === value;
          return (
            <Pressable key={value} onPress={() => setFilter(value)}>
              <ThemedView
                type={selected ? undefined : 'backgroundSelected'}
                style={[styles.pill, selected && { backgroundColor: theme.primary }]}>
                <ThemedText type="labelMd" themeColor={selected ? 'onPrimary' : 'textSecondary'}>
                  {label}
                </ThemedText>
              </ThemedView>
            </Pressable>
          );
        })}
      </ScrollView>

      <ThemedView style={styles.list}>
        {rows
          .filter((row) => matchesFilter(row, filter))
          .map((row) => (
            <CommodityPriceRow key={row.id} row={row} />
          ))}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterScroll: {
    marginHorizontal: -Spacing.one,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.one,
    paddingVertical: Spacing.half,
  },
  pill: {
    borderRadius: Radius.sheet,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  list: {
    gap: Spacing.two,
  },
});
