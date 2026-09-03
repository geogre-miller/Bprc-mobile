import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { COMMODITIES, latestObservation } from '@/data/mock-data';
import { usePersistedState } from '@/hooks/use-persisted-state';
import { useTheme } from '@/hooks/use-theme';
import type { Commodity, FarmerInventoryItem } from '@/types/domain';
import { formatVnd } from '@/utils/format-price';

export function Inventory() {
  const theme = useTheme();
  const [items, setItems, isLoaded] = usePersistedState<FarmerInventoryItem[]>('inventory', []);
  const [commodity, setCommodity] = useState<Commodity>(COMMODITIES[0].id);
  const [quantity, setQuantity] = useState('');

  const addItem = () => {
    const parsedQuantity = Number(quantity);
    if (!parsedQuantity || parsedQuantity <= 0) return;
    setItems((current) => [...current, { commodity, quantity: parsedQuantity, unit: 'kg' }]);
    setQuantity('');
  };

  const removeItem = (index: number) => {
    setItems((current) => current.filter((_, i) => i !== index));
  };

  const totalValue = items.reduce((sum, item) => {
    const price = latestObservation(item.commodity)?.pricePerUnit ?? 0;
    return sum + price * item.quantity;
  }, 0);

  if (!isLoaded) return null;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ThemedText type="title" style={styles.title}>
        Nông sản đang có
      </ThemedText>

      <ThemedView type="backgroundElement" style={styles.summaryCard}>
        <ThemedText type="small" themeColor="textSecondary">
          Ước tính tổng giá trị
        </ThemedText>
        <ThemedText type="subtitle">{formatVnd(totalValue)}</ThemedText>
      </ThemedView>

      {items.map((item, index) => {
        const label = COMMODITIES.find((c) => c.id === item.commodity)?.label ?? item.commodity;
        const price = latestObservation(item.commodity)?.pricePerUnit;
        return (
          <ThemedView key={`${item.commodity}-${index}`} type="backgroundElement" style={styles.row}>
            <ThemedView type="backgroundElement" style={styles.rowLeft}>
              <ThemedText type="smallBold">{label}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {item.quantity} {item.unit}
                {price ? ` · ước tính ${formatVnd(price * item.quantity)}` : ''}
              </ThemedText>
            </ThemedView>
            <Pressable onPress={() => removeItem(index)}>
              <ThemedText type="small" themeColor="textSecondary">
                Xóa
              </ThemedText>
            </Pressable>
          </ThemedView>
        );
      })}

      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Thêm nông sản
      </ThemedText>
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

      <ThemedView type="backgroundElement" style={styles.formRow}>
        <TextInput
          value={quantity}
          onChangeText={setQuantity}
          placeholder="Số kg"
          placeholderTextColor={theme.textSecondary}
          keyboardType="numeric"
          style={[styles.input, { color: theme.text }]}
        />
        <Pressable onPress={addItem}>
          <ThemedText type="linkPrimary">Thêm</ThemedText>
        </Pressable>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  summaryCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.half,
    marginBottom: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  rowLeft: {
    gap: Spacing.half,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 26,
    marginTop: Spacing.three,
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
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
});
