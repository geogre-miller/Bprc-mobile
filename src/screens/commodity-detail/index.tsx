import { ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { BUYERS, COMMODITIES, PRICE_OBSERVATIONS } from '@/data/mock-data';
import type { Commodity } from '@/types/domain';
import { formatPricePerUnit } from '@/utils/format-price';
import { CONFIDENCE_LABEL } from '@/utils/price-confidence';

const PRICE_KIND_LABEL = {
  reference_market: 'Giá tham chiếu thị trường',
  buyer_quoted: 'Giá đầu mối chào mua',
  confirmed_transaction: 'Giá giao dịch thực tế',
} as const;

export function CommodityDetail({ commodity }: { commodity?: Commodity }) {
  const label = COMMODITIES.find((item) => item.id === commodity)?.label ?? commodity;
  const observations = PRICE_OBSERVATIONS.filter((observation) => observation.commodity === commodity).sort(
    (a, b) => b.observedAt.localeCompare(a.observedAt),
  );

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ThemedText type="title" style={styles.title}>
        {label}
      </ThemedText>

      {observations.length === 0 && (
        <ThemedText themeColor="textSecondary">Chưa có dữ liệu giá cho mặt hàng này.</ThemedText>
      )}

      {observations.map((observation) => {
        const buyer = observation.buyerId ? BUYERS.find((b) => b.id === observation.buyerId) : undefined;
        return (
          <ThemedView key={observation.id} type="backgroundElement" style={styles.card}>
            <ThemedText type="small" themeColor="textSecondary">
              {PRICE_KIND_LABEL[observation.kind]}
            </ThemedText>
            <ThemedText type="subtitle" style={styles.price}>
              {formatPricePerUnit(observation.pricePerUnit, observation.unit)}
            </ThemedText>
            {buyer && <ThemedText type="small">{buyer.name}</ThemedText>}
            <ThemedText type="small" themeColor="textSecondary">
              {CONFIDENCE_LABEL[observation.confidence]}
            </ThemedText>
          </ThemedView>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.half,
  },
  price: {
    fontSize: 24,
    lineHeight: 30,
  },
});
