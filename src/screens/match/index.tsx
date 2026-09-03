import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { BUYERS, BUYING_DEMANDS, COMMODITIES, PRICE_OBSERVATIONS } from '@/data/mock-data';
import { usePersistedState } from '@/hooks/use-persisted-state';
import type { SellingIntent } from '@/types/domain';
import { formatVnd } from '@/utils/format-price';

export function Match({ id }: { id?: string }) {
  const [intents, , isLoaded] = usePersistedState<SellingIntent[]>('selling-intents', []);
  const intent = intents.find((item) => item.id === id);

  if (!isLoaded) return null;

  if (!intent) {
    return (
      <ThemedView style={styles.empty}>
        <ThemedText themeColor="textSecondary">Không tìm thấy ý định bán này.</ThemedText>
      </ThemedView>
    );
  }

  const label = COMMODITIES.find((c) => c.id === intent.commodity)?.label ?? intent.commodity;

  const offers = BUYERS.filter((buyer) => buyer.commodities.includes(intent.commodity))
    .map((buyer) => {
      const price = PRICE_OBSERVATIONS.find(
        (o) => o.buyerId === buyer.id && o.commodity === intent.commodity,
      )?.pricePerUnit;
      const demand = BUYING_DEMANDS.find((d) => d.buyerId === buyer.id && d.commodity === intent.commodity);
      const effectivePrice = price ?? demand?.priceRangeMax;
      if (effectivePrice == null) return null;
      return { buyer, price: effectivePrice, demand, estimatedValue: effectivePrice * intent.quantity };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)
    .sort((a, b) => b.price - a.price);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ThemedText type="title" style={styles.title}>
        So sánh đầu mối
      </ThemedText>
      <ThemedText themeColor="textSecondary">
        {label} · {intent.quantity} {intent.unit}
      </ThemedText>

      {offers.length === 0 && (
        <ThemedText themeColor="textSecondary" style={styles.sectionTitle}>
          Chưa có đầu mối nào thu mua mặt hàng này.
        </ThemedText>
      )}

      {offers.map(({ buyer, price, demand, estimatedValue }, index) => (
        <Link key={buyer.id} href={{ pathname: '/buyer/[id]', params: { id: buyer.id } }} asChild>
          <Pressable>
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText type="smallBold">
                {index === 0 ? '★ ' : ''}
                {buyer.name}
              </ThemedText>
              <ThemedText>{formatVnd(price)}/kg</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Ước tính thu về {formatVnd(estimatedValue)}
              </ThemedText>
              {demand && (
                <ThemedText type="small" themeColor="textSecondary">
                  Còn cần {demand.remainingQuantity} {demand.unit}
                </ThemedText>
              )}
              {buyer.verified && (
                <ThemedText type="small" themeColor="textSecondary">
                  Đã xác minh
                </ThemedText>
              )}
            </ThemedView>
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  sectionTitle: {
    marginTop: Spacing.three,
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.half,
  },
});
