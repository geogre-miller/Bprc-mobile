import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Icon } from './icons';
import type { PriceRow } from './use-dashboard-data';

/** Single-line flash of the day's two biggest movers, linking to the largest one. */
export function MarketBulletin({ movers }: { movers: PriceRow[] }) {
  const theme = useTheme();
  const lead = movers[0];
  if (!lead) return null;

  const summary = movers
    .slice(0, 2)
    .map((row) => `${row.label} ${row.changePercent! >= 0 ? 'tăng' : 'giảm'} ${Math.abs(row.changePercent!).toFixed(1)}%`)
    .join(' • ');

  return (
    <Link href={{ pathname: '/commodity/[id]', params: { id: lead.id } }} asChild>
      <Pressable>
        <ThemedView style={[styles.bulletin, { backgroundColor: theme.pendingContainer }]}>
          <ThemedView style={[styles.icon, { backgroundColor: theme.pending }]}>
            <Icon name="bolt" size={15} color={theme.onPrimary} />
          </ThemedView>
          <ThemedText type="labelSm" numberOfLines={1} style={[styles.text, { color: theme.pending }]}>
            <ThemedText type="labelSm" style={[styles.lead, { color: theme.pending }]}>
              Thị trường:{' '}
            </ThemedText>
            {summary}
          </ThemedText>
          <Icon name="chevron_right" size={16} color={theme.pending} />
        </ThemedView>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  bulletin: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: Radius.container,
    paddingHorizontal: 12,
    paddingVertical: Spacing.two,
  },
  icon: {
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
  },
  lead: {
    fontWeight: '700',
  },
});
