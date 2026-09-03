import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { BUYERS, BUYING_DEMANDS, COMMODITIES, PRICE_OBSERVATIONS } from '@/data/mock-data';
import { usePersistedState } from '@/hooks/use-persisted-state';
import type { BuyerFeedback } from '@/types/domain';
import { formatPricePerUnit, formatVnd } from '@/utils/format-price';

const FEEDBACK_CRITERIA = [
  { key: 'priceMatched', label: 'Giá đúng như báo' },
  { key: 'weighingClear', label: 'Cân đo minh bạch' },
  { key: 'paymentReliable', label: 'Thanh toán đúng hẹn' },
] as const;

export function BuyerDetail({ buyerId }: { buyerId?: string }) {
  const buyer = BUYERS.find((item) => item.id === buyerId);
  const [allFeedback, setAllFeedback, isLoaded] = usePersistedState<BuyerFeedback[]>('buyer-feedback', []);
  const [draft, setDraft] = useState({ priceMatched: true, weighingClear: true, paymentReliable: true });

  if (!isLoaded) return null;

  if (!buyer) {
    return (
      <ThemedView style={styles.empty}>
        <ThemedText themeColor="textSecondary">Không tìm thấy đầu mối này.</ThemedText>
      </ThemedView>
    );
  }

  const currentPrices = PRICE_OBSERVATIONS.filter(
    (observation) => observation.buyerId === buyer.id,
  );
  const demands = BUYING_DEMANDS.filter((demand) => demand.buyerId === buyer.id);
  const feedback = allFeedback.filter((item) => item.buyerId === buyer.id);

  const submitFeedback = (criteria: { priceMatched: boolean; weighingClear: boolean; paymentReliable: boolean }) => {
    setAllFeedback((current) => [
      {
        id: String(Date.now()),
        buyerId: buyer.id,
        farmerId: 'me',
        ...criteria,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ThemedText type="title" style={styles.title}>
        {buyer.name}
      </ThemedText>
      <ThemedText themeColor="textSecondary">
        {buyer.address.line}, {buyer.address.district}, {buyer.address.province}
      </ThemedText>
      {buyer.verified && <ThemedText type="small">Đã xác minh</ThemedText>}

      {buyer.contactPhone && (
        <Pressable onPress={() => Linking.openURL(`tel:${buyer.contactPhone}`)}>
          <ThemedText type="linkPrimary">Gọi {buyer.contactPhone}</ThemedText>
        </Pressable>
      )}

      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Giá đang thu mua
      </ThemedText>
      {currentPrices.length === 0 && (
        <ThemedText themeColor="textSecondary">Chưa cập nhật giá.</ThemedText>
      )}
      {currentPrices.map((observation) => (
        <ThemedView key={observation.id} type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold">
            {COMMODITIES.find((c) => c.id === observation.commodity)?.label}
          </ThemedText>
          <ThemedText>{formatPricePerUnit(observation.pricePerUnit, observation.unit)}</ThemedText>
        </ThemedView>
      ))}

      {demands.length > 0 && (
        <>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Đang cần mua
          </ThemedText>
          {demands.map((demand) => (
            <ThemedView key={demand.id} type="backgroundElement" style={styles.card}>
              <ThemedText type="smallBold">
                {COMMODITIES.find((c) => c.id === demand.commodity)?.label}
              </ThemedText>
              <ThemedText>
                {formatVnd(demand.priceRangeMin)} - {formatVnd(demand.priceRangeMax)}/{demand.unit}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Còn cần {demand.remainingQuantity} {demand.unit}
              </ThemedText>
              {demand.qualityRequirements && (
                <ThemedText type="small" themeColor="textSecondary">
                  {demand.qualityRequirements}
                </ThemedText>
              )}
            </ThemedView>
          ))}
        </>
      )}

      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Đánh giá từ nông dân
      </ThemedText>
      {feedback.length === 0 ? (
        <ThemedText themeColor="textSecondary">Chưa có đánh giá nào.</ThemedText>
      ) : (
        FEEDBACK_CRITERIA.map(({ key, label }) => {
          const positive = feedback.filter((item) => item[key]).length;
          return (
            <ThemedText key={key} type="small" themeColor="textSecondary">
              {label}: {positive}/{feedback.length}
            </ThemedText>
          );
        })
      )}

      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="smallBold">Đánh giá đầu mối này</ThemedText>
        {FEEDBACK_CRITERIA.map(({ key, label }) => (
          <Pressable key={key} onPress={() => setDraft((current) => ({ ...current, [key]: !current[key] }))}>
            <ThemedText type="small">
              {draft[key] ? '✓' : '✗'} {label}
            </ThemedText>
          </Pressable>
        ))}
        <Pressable onPress={() => submitFeedback(draft)}>
          <ThemedText type="linkPrimary">Gửi đánh giá</ThemedText>
        </Pressable>
      </ThemedView>
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
    fontSize: 20,
    lineHeight: 26,
    marginTop: Spacing.three,
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.half,
  },
});
