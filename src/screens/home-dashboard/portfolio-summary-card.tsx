import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatAmount, formatVnd } from '@/utils/format-price';

import { Icon } from './icons';
import type { DashboardData } from './use-dashboard-data';

type Props = Pick<
  DashboardData,
  'now' | 'inventoryValue' | 'inventoryChangePercent' | 'gainVsQuoted' | 'revenueThisMonth' | 'closedDealCount'
>;

/** DESIGN.md's "portfolio summary block": hero valuation, tonal metric well, primary actions. */
export function PortfolioSummaryCard({
  now,
  inventoryValue,
  inventoryChangePercent,
  gainVsQuoted,
  revenueThisMonth,
  closedDealCount,
}: Props) {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={[styles.card, { borderColor: theme.border }]}>
      <ThemedView type="backgroundElement" style={styles.topRow}>
        <ThemedView type="backgroundElement">
          <ThemedView type="backgroundElement" style={styles.labelRow}>
            <Icon name="account_balance_wallet" size={16} color={theme.textSecondary} />
            <ThemedText type="labelSm" themeColor="textSecondary" style={styles.uppercaseLabel}>
              Ước tính giá trị kho
            </ThemedText>
          </ThemedView>
          <ThemedView type="backgroundElement" style={styles.heroRow}>
            <ThemedText type="numericHero">{formatAmount(inventoryValue)}</ThemedText>
            <ThemedText type="titleMd" themeColor="textSecondary">
              ₫
            </ThemedText>
          </ThemedView>
        </ThemedView>
        {inventoryChangePercent != null && (
          <ThemedView
            style={[
              styles.trendBadge,
              { backgroundColor: inventoryChangePercent >= 0 ? theme.gainContainer : theme.lossContainer },
            ]}>
            <Icon
              name={inventoryChangePercent >= 0 ? 'trending_up' : 'trending_down'}
              size={14}
              color={inventoryChangePercent >= 0 ? theme.gain : theme.loss}
            />
            <ThemedText type="labelSm" style={{ color: inventoryChangePercent >= 0 ? theme.gain : theme.loss }}>
              {inventoryChangePercent >= 0 ? '+' : ''}
              {inventoryChangePercent.toFixed(1)}%
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      {/* Tonal inset sub-metrics */}
      <ThemedView type="backgroundSelected" style={styles.metricsRow}>
        <ThemedView type="backgroundSelected" style={styles.metric}>
          <ThemedText type="labelSm" themeColor="textSecondary">
            Lãi tạm tính (bán nay)
          </ThemedText>
          <ThemedText
            type="smallBold"
            style={[styles.metricValue, { color: gainVsQuoted >= 0 ? theme.gain : theme.loss }]}>
            {gainVsQuoted >= 0 ? '+' : ''}
            {formatVnd(gainVsQuoted)}
          </ThemedText>
        </ThemedView>
        <ThemedView type="backgroundSelected" style={styles.metric}>
          <ThemedText type="labelSm" themeColor="textSecondary">
            Doanh thu tháng {now.getMonth() + 1}
          </ThemedText>
          <ThemedText type="smallBold" style={styles.metricValue}>
            {formatVnd(revenueThisMonth)}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.metricFootnote}>
            {closedDealCount} giao dịch đã chốt
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Action buttons: 3/5 + 2/5 split */}
      <ThemedView type="backgroundElement" style={styles.actionRow}>
        <Link href="/selling-intents" asChild>
          <Pressable style={styles.primaryWrapper}>
            {({ pressed }) => (
              <ThemedView
                style={[styles.button, { backgroundColor: pressed ? theme.primaryPressed : theme.primary }]}>
                <Icon name="add_circle" size={18} color={theme.onPrimary} />
                <ThemedText type="titleMd" style={{ color: theme.onPrimary }}>
                  Bán nông sản
                </ThemedText>
              </ThemedView>
            )}
          </Pressable>
        </Link>
        <Link href="/inventory" asChild>
          <Pressable style={styles.secondaryWrapper}>
            <ThemedView type="backgroundSelected" style={styles.buttonSecondary}>
              <Icon name="post_add" size={18} color={theme.primary} />
              <ThemedText type="titleMd" style={{ color: theme.primary }}>
                Nhập kho
              </ThemedText>
            </ThemedView>
          </Pressable>
        </Link>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.container,
    borderWidth: 1,
    padding: Spacing.three,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  uppercaseLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.55,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: Spacing.one,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
    borderRadius: Radius.base,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    borderRadius: Radius.container,
    padding: 10,
  },
  metric: {
    flex: 1,
  },
  metricValue: {
    marginTop: Spacing.half,
  },
  metricFootnote: {
    fontSize: 11,
    lineHeight: 14,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingTop: Spacing.one,
  },
  primaryWrapper: {
    flex: 3,
  },
  secondaryWrapper: {
    flex: 2,
  },
  button: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.container,
  },
  buttonSecondary: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.container,
  },
});
