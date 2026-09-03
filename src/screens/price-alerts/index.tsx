import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { COMMODITIES, latestObservation } from '@/data/mock-data';
import { usePersistedState } from '@/hooks/use-persisted-state';
import { useTheme } from '@/hooks/use-theme';
import type { Commodity, PriceAlert } from '@/types/domain';
import { formatVnd } from '@/utils/format-price';

export function PriceAlerts() {
  const theme = useTheme();
  const [alerts, setAlerts, isLoaded] = usePersistedState<PriceAlert[]>('price-alerts', []);
  const [commodity, setCommodity] = useState<Commodity>(COMMODITIES[0].id);
  const [targetPrice, setTargetPrice] = useState('');

  const addAlert = () => {
    const price = Number(targetPrice);
    if (!price || price <= 0) return;
    setAlerts((current) => [
      ...current,
      { id: String(Date.now()), farmerId: 'me', commodity, targetPricePerUnit: price, unit: 'kg', active: true },
    ]);
    setTargetPrice('');
  };

  const removeAlert = (id: string) => {
    setAlerts((current) => current.filter((alert) => alert.id !== id));
  };

  if (!isLoaded) return null;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ThemedText type="title" style={styles.title}>
        Báo giá mục tiêu
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Nhận biết khi giá đạt mức bạn muốn bán
      </ThemedText>

      {alerts.map((alert) => {
        const label = COMMODITIES.find((c) => c.id === alert.commodity)?.label ?? alert.commodity;
        const current = latestObservation(alert.commodity)?.pricePerUnit;
        const reached = current !== undefined && current >= alert.targetPricePerUnit;
        return (
          <ThemedView key={alert.id} type="backgroundElement" style={styles.row}>
            <ThemedView type="backgroundElement" style={styles.rowLeft}>
              <ThemedText type="smallBold">{label}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Mục tiêu {formatVnd(alert.targetPricePerUnit)}/{alert.unit}
                {current !== undefined ? ` · hiện tại ${formatVnd(current)}` : ''}
              </ThemedText>
              {reached && (
                <ThemedText type="small" themeColor="text">
                  Đã đạt mức giá mục tiêu
                </ThemedText>
              )}
            </ThemedView>
            <Pressable onPress={() => removeAlert(alert.id)}>
              <ThemedText type="small" themeColor="textSecondary">
                Xóa
              </ThemedText>
            </Pressable>
          </ThemedView>
        );
      })}

      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Đặt báo giá mới
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
          value={targetPrice}
          onChangeText={setTargetPrice}
          placeholder="Giá mục tiêu (đ/kg)"
          placeholderTextColor={theme.textSecondary}
          keyboardType="numeric"
          style={[styles.input, { color: theme.text }]}
        />
        <Pressable onPress={addAlert}>
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
