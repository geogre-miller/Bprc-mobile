import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { getPriceTrendDirection, PriceAmount, PriceChangePercent } from '@/components/price-presentation';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Commodity } from '@/types/domain';
import { formatAmount, formatVnd } from '@/utils/format-price';

import { Icon, type IconName } from './icons';
import type { PriceRow } from './use-dashboard-data';

const COMMODITY_ICON: Record<Commodity, IconName> = {
  coffee: 'coffee',
  pepper: 'grain',
  cassava: 'nutrition',
  rubber: 'forest',
  cashew: 'psychiatry',
  rice: 'grass',
  fruit: 'eco',
  vegetable: 'eco',
};

/** The design tints each commodity glyph differently; keyed here so rows stay stable. */
const COMMODITY_TINT: Record<Commodity, 'pending' | 'primary' | 'accent' | 'textSecondary'> = {
  coffee: 'pending',
  pepper: 'primary',
  cassava: 'textSecondary',
  rubber: 'accent',
  cashew: 'accent',
  rice: 'textSecondary',
  fruit: 'accent',
  vegetable: 'accent',
};

/** One ledger-aligned commodity card: glyph and name left, price and delta flush right. */
export function CommodityPriceRow({ row }: { row: PriceRow }) {
  const theme = useTheme();
  const trendDirection = getPriceTrendDirection(row.changePercent);
  const flat = trendDirection === 'flat';
  const trendColor = flat ? theme.textSecondary : trendDirection === 'up' ? theme.gain : theme.loss;

  return (
    <Link href={{ pathname: '/commodity/[id]', params: { id: row.id } }} asChild>
      <Pressable>
        <ThemedView type="backgroundElement" style={[styles.row, { borderColor: theme.border }]}>
          <ThemedView type="backgroundElement" style={styles.left}>
            <ThemedView type="backgroundSelected" style={styles.iconTile}>
              <Icon name={COMMODITY_ICON[row.id]} size={22} color={theme[COMMODITY_TINT[row.id]]} />
            </ThemedView>
            <ThemedView type="backgroundElement" style={styles.text}>
              <ThemedView type="backgroundElement" style={styles.nameRow}>
                <ThemedText type="titleMd" numberOfLines={1} style={styles.name}>
                  {row.label}
                </ThemedText>
                {row.latest?.location?.province && (
                  <ThemedView type="backgroundSelected" style={styles.gradeBadge}>
                    <ThemedText type="labelSm" style={styles.gradeBadgeText}>
                      {row.latest.location.province}
                    </ThemedText>
                  </ThemedView>
                )}
              </ThemedView>
              <ThemedText type="bodySm" themeColor="textSecondary">
                {row.heldQuantity > 0 ? 'Kho còn: ' : 'Thị trường theo dõi'}
                {row.heldQuantity > 0 && (
                  <ThemedText type="bodySm" style={styles.held}>
                    {formatAmount(row.heldQuantity)} kg
                  </ThemedText>
                )}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.figures}>
            {row.latest && (
              <ThemedView type="backgroundElement" style={styles.priceRow}>
                <PriceAmount amount={row.latest.pricePerUnit} unit={row.latest.unit} />
              </ThemedView>
            )}
            <ThemedView type="backgroundElement" style={styles.changeRow}>
              {!flat && (
                <Icon
                  name={trendDirection === 'up' ? 'arrow_upward' : 'arrow_downward'}
                  size={12}
                  color={trendColor}
                />
              )}
              <PriceChangePercent
                changePercent={row.changePercent}
                flatLabel="0,0% (Đứng giá)"
                suffix={
                  !flat ? ` (${row.changeAmount! > 0 ? '+' : ''}${formatVnd(row.changeAmount!)})` : undefined
                }
                style={{ color: trendColor }}
              />
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.container,
    borderWidth: 1,
    padding: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: Radius.container,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flexShrink: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    flexShrink: 1,
  },
  held: {
    fontWeight: '600',
  },
  gradeBadge: {
    borderRadius: 2,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  gradeBadgeText: {
    fontSize: 10,
    lineHeight: 13,
  },
  figures: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
});
