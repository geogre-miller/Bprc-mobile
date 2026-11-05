import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { CommodityPriceRow } from './commodity-price-row';
import { Icon } from './icons';
import type { PriceRow } from './use-dashboard-data';

type PriceFilter = 'all' | 'up' | 'down';

function matchesFilter(row: PriceRow, filter: PriceFilter): boolean {
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
    ['up', 'Đang tăng'],
    ['down', 'Đang giảm'],
  ];

  return (
    <ThemedView style={styles.section}>
      <ThemedView style={styles.headerRow}>
        <Icon name="analytics" size={20} color={theme.accent} />
        <ThemedText type="headlineSm" accessibilityRole="header">
          Bảng giá thị trường
        </ThemedText>
      </ThemedView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}>
        {filters.map(([value, label]) => {
          const selected = filter === value;
          return (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setFilter(value)}>
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
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: Radius.sheet,
    paddingHorizontal: Spacing.three,
  },
  list: {
    gap: Spacing.two,
  },
});
