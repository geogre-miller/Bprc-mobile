import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { BUYERS, COMMODITIES } from '@/data/mock-data';
import { usePersistedState } from '@/hooks/use-persisted-state';
import { useTheme } from '@/hooks/use-theme';
import type { Commodity, SellingJournalEntry } from '@/types/domain';
import { formatVnd } from '@/utils/format-price';

export function SellingJournal() {
  const theme = useTheme();
  const [entries, setEntries, isLoaded] = usePersistedState<SellingJournalEntry[]>('selling-journal', []);
  const [commodity, setCommodity] = useState<Commodity>(COMMODITIES[0].id);
  const [buyerId, setBuyerId] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState('');
  const [actualPrice, setActualPrice] = useState('');

  const addEntry = () => {
    const parsedQuantity = Number(quantity);
    const parsedPrice = Number(actualPrice);
    if (!parsedQuantity || !parsedPrice) return;
    setEntries((current) => [
      {
        id: String(Date.now()),
        farmerId: 'me',
        commodity,
        quantity: parsedQuantity,
        unit: 'kg',
        buyerId,
        actualPricePerUnit: parsedPrice,
        soldAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setQuantity('');
    setActualPrice('');
  };

  const removeEntry = (id: string) => {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  };

  const averagesByCommodity = COMMODITIES.map((option) => {
    const matching = entries.filter((entry) => entry.commodity === option.id);
    if (matching.length === 0) return null;
    const average = matching.reduce((sum, entry) => sum + entry.actualPricePerUnit, 0) / matching.length;
    return { label: option.label, average };
  }).filter((row): row is { label: string; average: number } => row !== null);

  if (!isLoaded) return null;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ThemedText type="title" style={styles.title}>
        Nhật ký bán hàng
      </ThemedText>

      {averagesByCommodity.length > 0 && (
        <ThemedView type="backgroundElement" style={styles.summaryCard}>
          <ThemedText type="small" themeColor="textSecondary">
            Giá bán trung bình
          </ThemedText>
          {averagesByCommodity.map((row) => (
            <ThemedText key={row.label} type="small">
              {row.label}: {formatVnd(Math.round(row.average))}/kg
            </ThemedText>
          ))}
        </ThemedView>
      )}

      {entries.map((entry) => {
        const label = COMMODITIES.find((c) => c.id === entry.commodity)?.label ?? entry.commodity;
        const buyer = entry.buyerId ? BUYERS.find((b) => b.id === entry.buyerId) : undefined;
        return (
          <ThemedView key={entry.id} type="backgroundElement" style={styles.row}>
            <ThemedView type="backgroundElement" style={styles.rowLeft}>
              <ThemedText type="smallBold">
                {label} · {entry.quantity} {entry.unit}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {formatVnd(entry.actualPricePerUnit)}/{entry.unit}
                {buyer ? ` · ${buyer.name}` : ''}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {new Date(entry.soldAt).toLocaleDateString('vi-VN')}
              </ThemedText>
            </ThemedView>
            <Pressable onPress={() => removeEntry(entry.id)}>
              <ThemedText type="small" themeColor="textSecondary">
                Xóa
              </ThemedText>
            </Pressable>
          </ThemedView>
        );
      })}

      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Ghi lại giao dịch mới
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

      <ThemedView style={styles.commodityPicker}>
        {BUYERS.map((option) => (
          <Pressable key={option.id} onPress={() => setBuyerId(buyerId === option.id ? undefined : option.id)}>
            <ThemedView
              type={buyerId === option.id ? 'backgroundSelected' : 'backgroundElement'}
              style={styles.commodityChip}>
              <ThemedText type="small">{option.name}</ThemedText>
            </ThemedView>
          </Pressable>
        ))}
      </ThemedView>

      <ThemedView type="backgroundElement" style={styles.formColumn}>
        <TextInput
          value={quantity}
          onChangeText={setQuantity}
          placeholder="Số kg đã bán"
          placeholderTextColor={theme.textSecondary}
          keyboardType="numeric"
          style={[styles.input, { color: theme.text }]}
        />
        <TextInput
          value={actualPrice}
          onChangeText={setActualPrice}
          placeholder="Giá thực nhận (đ/kg)"
          placeholderTextColor={theme.textSecondary}
          keyboardType="numeric"
          style={[styles.input, { color: theme.text }]}
        />
        <Pressable onPress={addEntry}>
          <ThemedText type="linkPrimary">Lưu</ThemedText>
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
  formColumn: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  input: {
    fontSize: 16,
  },
});
