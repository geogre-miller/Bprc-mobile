import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing, Layout } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { CommodityPriceRow } from './commodity-price-row';
import { Icon } from './icons';
import type { PriceRow } from './use-dashboard-data';

/** The seller's held commodities at today's price: the first thing home answers. */
export function MyCommodities({ rows }: { rows: PriceRow[] }) {
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <ThemedText type="headlineSm" accessibilityRole="header">
        Hàng của tôi hôm nay
      </ThemedText>
      {rows.length > 0 ? (
        rows.map((row) => <CommodityPriceRow key={row.id} row={row} />)
      ) : (
        <ThemedView type="backgroundElement" style={[styles.empty, { borderColor: theme.border }]}>
          <ThemedText type="bodySm" themeColor="textSecondary">
            Bạn chưa có hàng trong kho. Nhập kho để xem giá trị hàng và thương lái gần bạn đang trả giá bao nhiêu.
          </ThemedText>
          <Link href={{ pathname: '/inventory', params: { add: '1' } }} asChild>
            <Pressable accessibilityRole="button">
              {({ pressed }) => (
                <View style={[styles.button, { backgroundColor: pressed ? theme.primaryPressed : theme.primary }]}>
                  <Icon name="post_add" size={18} color={theme.onPrimary} />
                  <ThemedText type="titleMd" style={{ color: theme.onPrimary }}>
                    Nhập kho
                  </ThemedText>
                </View>
              )}
            </Pressable>
          </Link>
        </ThemedView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Layout.gutter,
  },
  empty: {
    borderRadius: Radius.container,
    borderWidth: 1,
    padding: Spacing.three,
    gap: 12,
  },
  button: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: Radius.container,
  },
});
