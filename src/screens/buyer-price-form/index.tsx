import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { COMMODITIES } from '@/data/mock-data';
import { usePersistedState } from '@/hooks/use-persisted-state';
import { useTheme } from '@/hooks/use-theme';
import type { Commodity, CurrentBuyingPrice } from '@/types/domain';

export function BuyerPriceForm({ commodity: editingCommodity }: { commodity?: Commodity }) {
  const theme = useTheme();
  const [prices, setPrices, isLoaded] = usePersistedState<CurrentBuyingPrice[]>('my-buyer-prices', []);
  const existing = prices.find((price) => price.commodity === editingCommodity);
  const [commodity, setCommodity] = useState<Commodity>(existing?.commodity ?? editingCommodity ?? COMMODITIES[0].id);
  const [price, setPrice] = useState(existing ? String(existing.pricePerUnit) : '');

  const save = () => {
    const parsedPrice = Number(price);
    if (!parsedPrice || parsedPrice <= 0) return;
    setPrices((current) => [
      ...current.filter((row) => row.commodity !== commodity),
      { buyerId: 'me-buyer', commodity, pricePerUnit: parsedPrice, unit: 'kg', updatedAt: new Date().toISOString() },
    ]);
    router.back();
  };

  if (!isLoaded) return null;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ThemedText type="subtitle">Chọn mặt hàng</ThemedText>
      <ThemedView style={styles.commodityPicker}>
        {COMMODITIES.map((option) => (
          <Pressable key={option.id} onPress={() => setCommodity(option.id)}>
            <ThemedView
              type={commodity === option.id ? 'backgroundSelected' : 'backgroundElement'}
              style={styles.commodityChip}>
              <ThemedText type="small">{option.label}</ThemedText>
            </ThemedView>
          </Pressable>
        ))}
      </ThemedView>

      <TextInput
        value={price}
        onChangeText={setPrice}
        placeholder="Giá thu mua (đ/kg)"
        placeholderTextColor={theme.textSecondary}
        keyboardType="numeric"
        style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
      />

      <Pressable onPress={save}>
        <ThemedView type="text" style={styles.saveButton}>
          <ThemedText themeColor="background" type="smallBold">
            Lưu giá
          </ThemedText>
        </ThemedView>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  commodityPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  commodityChip: {
    borderRadius: Spacing.five,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  input: {
    fontSize: 16,
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  saveButton: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
});
