import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { Icon } from '@/screens/home-dashboard/icons';

function formatMarketAmount(amount: number) {
  return amount.toLocaleString('en-US');
}

export type MarketPriceRowData = {
  id: string;
  /** Existing commodity route, when this design row has a detail screen in the app. */
  href?: string;
  label: string;
  detail: string;
  updatedLabel: string;
  price: number;
  changeAmount?: number;
  changePercent: number;
  badge?: string;
};

/** A compact, high-density ledger row matching the Stitch 5/4/3 column split. */
export function MarketPriceRow({ row }: { row: MarketPriceRowData }) {
  const flat = row.changePercent === 0;
  const rising = row.changePercent > 0;
  const trendColor = flat ? '#717973' : rising ? '#2C694E' : '#BA1A1A';
  const pillBackground = flat ? '#DFE4DF' : rising ? '#AEEECB' : '#FFDAD6';
  const trendIcon = flat ? 'swap_vert' : rising ? 'trending_up' : 'trending_down';

  const content = (
    <Pressable
      accessibilityRole={row.href ? 'button' : undefined}
      accessibilityLabel={`${row.label}, ${formatMarketAmount(row.price)} đồng một ki-lô-gam`}
      onPress={row.href ? () => router.push({ pathname: '/commodity/[id]', params: { id: row.href! } }) : undefined}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <ThemedView type="backgroundElement" style={styles.name}>
        <ThemedText type="titleMd" numberOfLines={1} style={[styles.label, { color: '#012D1D' }]}>
          {row.label}
        </ThemedText>
        {row.badge && (
          <View style={[styles.badge, { backgroundColor: '#FFDCC3' }]}>
            <ThemedText type="labelSm" style={{ color: '#2F1500' }}>
              {row.badge}
            </ThemedText>
          </View>
        )}
        <ThemedText type="bodySm" numberOfLines={1} style={{ color: '#414844' }}>
          {row.detail}
        </ThemedText>
        <ThemedText type="labelSm" style={{ color: '#717973' }}>
          {row.updatedLabel}
        </ThemedText>
      </ThemedView>

      <ThemedView type="backgroundElement" style={styles.figures}>
        <ThemedText type="numericLg" style={[styles.price, { color: '#181D1A' }]}>
          {formatMarketAmount(row.price)}
        </ThemedText>
        <ThemedText type="bodySm" style={{ color: trendColor }}>
          {flat || row.changeAmount == null
            ? 'Ngang giá'
            : `${rising ? '+' : ''}${formatMarketAmount(row.changeAmount)} ₫`}
        </ThemedText>
      </ThemedView>

      <ThemedView type="backgroundElement" style={styles.trend}>
        <View style={[styles.pill, { backgroundColor: pillBackground }]}>
          <ThemedText type="labelSm" style={[styles.pillText, { color: trendColor }]}>
            {flat ? '0.0%' : `${rising ? '+' : ''}${row.changePercent.toFixed(1)}%`}
          </ThemedText>
        </View>
        <Icon name={trendIcon} size={20} color={trendColor} />
      </ThemedView>
    </Pressable>
  );

  return content;
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
  },
  pressed: {
    opacity: 0.7,
  },
  name: {
    flex: 5,
    minWidth: 0,
    paddingRight: Spacing.one,
    gap: 1,
  },
  label: {
    flexShrink: 1,
  },
  badge: {
    borderRadius: Radius.base,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  figures: {
    flex: 4,
    minWidth: 0,
    alignItems: 'flex-end',
  },
  price: {
    fontWeight: '600',
  },
  trend: {
    flex: 3,
    minWidth: 0,
    alignItems: 'flex-end',
    paddingLeft: Spacing.one,
    gap: 4,
  },
  pill: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
  },
  pillText: {
    fontWeight: '700',
  },
});
