import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { COMMODITIES } from '@/data/mock-data';
import { usePersistedState } from '@/hooks/use-persisted-state';
import { useTheme } from '@/hooks/use-theme';
import type { Commodity, SellingIntent } from '@/types/domain';
import { formatVnd } from '@/utils/format-price';

export function SellingIntents() {
  const theme = useTheme();
  const [intents, setIntents, isLoaded] = usePersistedState<SellingIntent[]>('selling-intents', []);
  const [commodity, setCommodity] = useState<Commodity>(COMMODITIES[0].id);
  const [quantity, setQuantity] = useState('');
  const [desiredPrice, setDesiredPrice] = useState('');

  const addIntent = () => {
    const parsedQuantity = Number(quantity);
    if (!parsedQuantity || parsedQuantity <= 0) return;
    setIntents((current) => [
      {
        id: String(Date.now()),
        farmerId: 'me',
        commodity,
        quantity: parsedQuantity,
        unit: 'kg',
        desiredPricePerUnit: Number(desiredPrice) || undefined,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setQuantity('');
    setDesiredPrice('');
  };

  const removeIntent = (id: string) => {
    setIntents((current) => current.filter((intent) => intent.id !== id));
  };

  if (!isLoaded) return null;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ThemedText type="title" style={styles.title}>
        Ý định bán
      </ThemedText>
      <ThemedText themeColor="textSecondary">Đăng nông sản bạn muốn bán để so sánh các đầu mối.</ThemedText>

      {intents.map((intent) => {
        const label = COMMODITIES.find((c) => c.id === intent.commodity)?.label ?? intent.commodity;
        return (
          <ThemedView key={intent.id} type="backgroundElement" style={styles.row}>
            <ThemedView type="backgroundElement" style={styles.rowLeft}>
              <ThemedText type="smallBold">
                {label} · {intent.quantity} {intent.unit}
              </ThemedText>
              {intent.desiredPricePerUnit != null && (
                <ThemedText type="small" themeColor="textSecondary">
                  Mong muốn {formatVnd(intent.desiredPricePerUnit)}/{intent.unit}
                </ThemedText>
              )}
              <Link href={{ pathname: '/match/[id]', params: { id: intent.id } }} asChild>
                <Pressable>
                  <ThemedText type="linkPrimary">So sánh đầu mối</ThemedText>
                </Pressable>
              </Link>
            </ThemedView>
            <Pressable onPress={() => removeIntent(intent.id)}>
              <ThemedText type="small" themeColor="textSecondary">
                Xóa
              </ThemedText>
            </Pressable>
          </ThemedView>
        );
      })}

      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Thêm ý định bán
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

      <ThemedView type="backgroundElement" style={styles.formColumn}>
        <TextInput
          value={quantity}
          onChangeText={setQuantity}
          placeholder="Số kg muốn bán"
          placeholderTextColor={theme.textSecondary}
          keyboardType="numeric"
          style={[styles.input, { color: theme.text }]}
        />
        <TextInput
          value={desiredPrice}
          onChangeText={setDesiredPrice}
          placeholder="Giá mong muốn (đ/kg, tùy chọn)"
          placeholderTextColor={theme.textSecondary}
          keyboardType="numeric"
          style={[styles.input, { color: theme.text }]}
        />
        <Pressable onPress={addIntent}>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
