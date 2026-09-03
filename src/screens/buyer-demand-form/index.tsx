import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { COMMODITIES } from '@/data/mock-data';
import { usePersistedState } from '@/hooks/use-persisted-state';
import { useTheme } from '@/hooks/use-theme';
import type { BuyingDemand, Commodity } from '@/types/domain';

export function BuyerDemandForm({ id }: { id?: string }) {
  const theme = useTheme();
  const [demands, setDemands, isLoaded] = usePersistedState<BuyingDemand[]>('my-buyer-demands', []);
  const existing = demands.find((demand) => demand.id === id);

  const [commodity, setCommodity] = useState<Commodity>(existing?.commodity ?? COMMODITIES[0].id);
  const [priceMin, setPriceMin] = useState(existing ? String(existing.priceRangeMin) : '');
  const [priceMax, setPriceMax] = useState(existing ? String(existing.priceRangeMax) : '');
  const [quantity, setQuantity] = useState(existing ? String(existing.desiredQuantity) : '');
  const [qualityRequirements, setQualityRequirements] = useState(existing?.qualityRequirements ?? '');

  const save = () => {
    const parsedMin = Number(priceMin);
    const parsedMax = Number(priceMax);
    const parsedQuantity = Number(quantity);
    if (!parsedMin || !parsedMax || !parsedQuantity) return;

    const saved: BuyingDemand = {
      id: existing?.id ?? String(Date.now()),
      buyerId: 'me-buyer',
      commodity,
      priceRangeMin: parsedMin,
      priceRangeMax: parsedMax,
      unit: 'kg',
      desiredQuantity: parsedQuantity,
      remainingQuantity: existing?.remainingQuantity ?? parsedQuantity,
      qualityRequirements: qualityRequirements || undefined,
      periodStart: existing?.periodStart ?? new Date().toISOString(),
    };

    setDemands((current) => [...current.filter((demand) => demand.id !== saved.id), saved]);
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

      <ThemedView style={styles.inputRow}>
        <TextInput
          value={priceMin}
          onChangeText={setPriceMin}
          placeholder="Giá thấp nhất (đ/kg)"
          placeholderTextColor={theme.textSecondary}
          keyboardType="numeric"
          style={[styles.input, styles.inputHalf, { color: theme.text, backgroundColor: theme.backgroundElement }]}
        />
        <TextInput
          value={priceMax}
          onChangeText={setPriceMax}
          placeholder="Giá cao nhất (đ/kg)"
          placeholderTextColor={theme.textSecondary}
          keyboardType="numeric"
          style={[styles.input, styles.inputHalf, { color: theme.text, backgroundColor: theme.backgroundElement }]}
        />
      </ThemedView>

      <TextInput
        value={quantity}
        onChangeText={setQuantity}
        placeholder="Số lượng cần mua (kg)"
        placeholderTextColor={theme.textSecondary}
        keyboardType="numeric"
        style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
      />

      <TextInput
        value={qualityRequirements}
        onChangeText={setQualityRequirements}
        placeholder="Yêu cầu chất lượng (không bắt buộc)"
        placeholderTextColor={theme.textSecondary}
        style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
      />

      <Pressable onPress={save}>
        <ThemedView type="text" style={styles.saveButton}>
          <ThemedText themeColor="background" type="smallBold">
            Lưu nhu cầu
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
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  inputHalf: {
    flex: 1,
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
