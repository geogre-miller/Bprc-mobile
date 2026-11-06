import { Link, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Layout } from '@/constants/theme';
import { BUYERS, BUYING_DEMANDS, COMMODITIES, PRICE_OBSERVATIONS } from '@/data/mock-data';
import { usePersistedState } from '@/hooks/use-persisted-state';
import type { SellingIntent } from '@/types/domain';
import { formatVnd } from '@/utils/format-price';

import { buildJournalHref } from '../selling-journal/journal-link';
import { rankOffers } from './offers';

export function Match({ id }: { id?: string }) {
  const router = useRouter();
  const [intents, , isLoaded] = usePersistedState<SellingIntent[]>('selling-intents', []);
  const intent = intents.find((item) => item.id === id);

  if (!isLoaded) return null;

  if (!intent) {
    return (
      <ThemedView style={styles.empty}>
        <ThemedText themeColor="textSecondary">Không tìm thấy mục này. Có thể bạn đã xóa nó.</ThemedText>
      </ThemedView>
    );
  }

  const label = COMMODITIES.find((c) => c.id === intent.commodity)?.label ?? intent.commodity;

  const offers = rankOffers(intent, BUYERS, PRICE_OBSERVATIONS, BUYING_DEMANDS, new Date());

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ThemedText themeColor="textSecondary">
        {label} · {intent.quantity} {intent.unit}
      </ThemedText>

      {offers.length > 0 && (
        <ThemedText type="small" themeColor="textSecondary">
          Gọi đầu mối để chốt giá, rồi bấm Ghi nhận bán để ghi vào sổ khi bán xong.
        </ThemedText>
      )}

      {offers.length === 0 && (
        <ThemedText themeColor="textSecondary" style={styles.sectionTitle}>
          Chưa có đầu mối nào thu mua mặt hàng này.
        </ThemedText>
      )}

      {offers.map(({ buyer, price, demand, estimatedValue }, index) => (
        <ThemedView key={buyer.id} type="backgroundElement" style={styles.card}>
          <Link href={{ pathname: '/buyer/[id]', params: { id: buyer.id } }} asChild>
            <Pressable accessibilityRole="link" accessibilityLabel={`Xem hồ sơ ${buyer.name}`}>
              <View style={styles.cardCopy}>
                <ThemedText type="smallBold">
                  {index === 0 ? '★ ' : ''}
                  {buyer.name}
                </ThemedText>
                <ThemedText>{formatVnd(price)}/kg</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Ước tính thu về {formatVnd(estimatedValue)}
                </ThemedText>
                {demand?.remainingQuantity != null && (
                  <ThemedText type="small" themeColor="textSecondary">
                    Còn cần {demand.remainingQuantity} {demand.unit}
                  </ThemedText>
                )}
                {buyer.verified && (
                  <ThemedText type="small" themeColor="textSecondary">
                    Đã xác minh
                  </ThemedText>
                )}
              </View>
            </Pressable>
          </Link>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Ghi nhận bán ${label} cho ${buyer.name}`}
            onPress={() =>
              router.push(
                buildJournalHref({
                  commodity: intent.commodity,
                  price,
                  weight: intent.quantity,
                  buyerId: buyer.id,
                  buyerName: buyer.name,
                }),
              )
            }
            style={styles.recordButton}>
            <ThemedText type="linkPrimary">Ghi nhận bán</ThemedText>
          </Pressable>
        </ThemedView>
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
    padding: Layout.screenMargin,
    gap: Layout.gutter,
  },
  sectionTitle: {
    marginTop: Spacing.three,
  },
  cardCopy: {
    gap: Spacing.half,
  },
  recordButton: {
    minHeight: Layout.touchTarget,
    justifyContent: 'center',
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.half,
  },
});
