import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Chip } from '@/components/ui/chip';
import { Layout, LightPalette, Radius } from '@/constants/theme';
import { COMMODITIES } from '@/data/mock-data';
import type { Commodity, FarmerInventoryItem } from '@/types/domain';

import { parseAmount, type StockInput } from './inventory-ops';

type StockSheetProps = {
  /** The row being corrected. Without it the sheet adds a new lot. */
  existing?: FarmerInventoryItem;
  onSave: (input: StockInput) => void;
  onDelete?: () => void;
  onClose: () => void;
};

type Errors = Partial<Record<'quantity' | 'unitCost', string>>;

const COLORS = LightPalette;
const grouped = (value: number | undefined) => (value == null ? '' : value.toLocaleString('en-US'));

/** Add a lot to the stock, or correct the weighed quantity and cost of one row. */
export function StockSheet({ existing, onSave, onDelete, onClose }: StockSheetProps) {
  const editing = existing != null;
  const [commodity, setCommodity] = useState<Commodity>(existing?.commodity ?? COMMODITIES[0].id);
  const [quantity, setQuantity] = useState(existing ? String(existing.quantity) : '');
  const [unitCost, setUnitCost] = useState(existing?.unitCost != null ? String(existing.unitCost) : '');
  const [errors, setErrors] = useState<Errors>({});
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const label = COMMODITIES.find((option) => option.id === commodity)?.label ?? commodity;

  const save = () => {
    const parsedQuantity = parseAmount(quantity);
    const parsedCost = parseAmount(unitCost);
    const next: Errors = {};
    // Editing may set a lot to 0 (sold off outside the app); adding must bring something in.
    if (parsedQuantity == null || Number.isNaN(parsedQuantity) || (!editing && parsedQuantity <= 0)) {
      next.quantity = editing ? 'Nhập số kg đang có trong kho.' : 'Nhập số kg nhập kho lớn hơn 0.';
    }
    if (parsedCost !== undefined && Number.isNaN(parsedCost)) next.unitCost = 'Giá vốn chỉ gồm chữ số, hoặc để trống.';
    setErrors(next);
    if (Object.keys(next).length) return;
    onSave({ commodity, quantity: parsedQuantity as number, unitCost: parsedCost });
  };

  return (
    <BottomSheet
      title={editing ? `Sửa số cân ${label}` : 'Nhập kho mới'}
      subtitle={editing ? 'Nhập số cân thực tế trong kho' : 'Ghi lại lô hàng bạn đang giữ'}
      closeLabel="Đóng"
      onClose={onClose}>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          {!editing && (
            <View style={styles.field}>
              <ThemedText type="labelMd" style={styles.label}>
                Mặt hàng
              </ThemedText>
              <View style={styles.chips}>
                {COMMODITIES.map((option) => (
                  <Chip
                    key={option.id}
                    size="sm"
                    label={option.label}
                    selected={option.id === commodity}
                    onPress={() => setCommodity(option.id)}
                  />
                ))}
              </View>
            </View>
          )}

          <View style={styles.field}>
            <ThemedText type="labelMd" style={styles.label}>
              Khối lượng {editing ? 'trong kho' : 'nhập kho'} (kg)
            </ThemedText>
            <ThemedTextInput
              accessibilityLabel="Khối lượng kg"
              value={quantity}
              onChangeText={(text) => {
                setQuantity(text);
                setErrors((current) => ({ ...current, quantity: undefined }));
              }}
              keyboardType="number-pad"
              placeholder="Ví dụ: 1500"
              style={styles.input}
            />
            {errors.quantity && (
              <ThemedText type="labelSm" accessibilityRole="alert" style={styles.error}>
                {errors.quantity}
              </ThemedText>
            )}
          </View>

          <View style={styles.field}>
            <ThemedText type="labelMd" style={styles.label}>
              Giá vốn (đ/kg), không bắt buộc
            </ThemedText>
            <ThemedTextInput
              accessibilityLabel="Giá vốn đồng trên kg"
              value={unitCost}
              onChangeText={(text) => {
                setUnitCost(text);
                setErrors((current) => ({ ...current, unitCost: undefined }));
              }}
              keyboardType="number-pad"
              placeholder="Ví dụ: 78000"
              style={styles.input}
            />
            {errors.unitCost ? (
              <ThemedText type="labelSm" accessibilityRole="alert" style={styles.error}>
                {errors.unitCost}
              </ThemedText>
            ) : (
              <ThemedText type="labelSm" style={styles.hint}>
                {existing?.unitCost != null && editing
                  ? `Đang là ${grouped(existing.unitCost)} đ/kg. `
                  : ''}
                Có giá vốn, ứng dụng mới tính được lãi tạm tính.
              </ThemedText>
            )}
          </View>

          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={onClose} style={[styles.button, styles.cancel]}>
              <ThemedText type="titleMd" style={styles.cancelText}>
                Hủy
              </ThemedText>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={save} style={[styles.button, styles.save]}>
              <ThemedText type="titleMd" style={styles.saveText}>
                {editing ? 'Lưu số cân' : 'Nhập kho'}
              </ThemedText>
            </Pressable>
          </View>

          {editing && onDelete && (
            <View style={styles.deleteRow}>
              {confirmingDelete ? (
                <>
                  <ThemedText type="labelMd" style={styles.error}>
                    Xóa {label} khỏi kho?
                  </ThemedText>
                  <Pressable accessibilityRole="button" onPress={onDelete} style={styles.deleteAction}>
                    <ThemedText type="labelMd" style={styles.error}>
                      Xác nhận xóa
                    </ThemedText>
                  </Pressable>
                  <Pressable accessibilityRole="button" onPress={() => setConfirmingDelete(false)} style={styles.deleteAction}>
                    <ThemedText type="labelMd" style={styles.hint}>
                      Giữ lại
                    </ThemedText>
                  </Pressable>
                </>
              ) : (
                <Pressable accessibilityRole="button" onPress={() => setConfirmingDelete(true)} style={styles.deleteAction}>
                  <ThemedText type="labelMd" style={styles.error}>
                    Xóa mặt hàng này khỏi kho
                  </ThemedText>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: Layout.sectionGap,
  },
  field: {
    gap: 6,
  },
  label: {
    color: COLORS.onSurface,
    fontWeight: '600',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: Layout.gutter,
    borderRadius: Radius.container,
    backgroundColor: COLORS.surfaceLow,
    color: COLORS.onSurface,
  },
  error: {
    color: COLORS.error,
  },
  hint: {
    color: COLORS.onSurfaceVariant,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.container,
  },
  cancel: {
    backgroundColor: COLORS.surfaceContainer,
  },
  cancelText: {
    color: COLORS.onSurface,
  },
  save: {
    backgroundColor: COLORS.primaryContainer,
  },
  saveText: {
    color: COLORS.onPrimary,
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: Layout.gutter,
  },
  deleteAction: {
    minHeight: Layout.touchTarget,
    justifyContent: 'center',
  },
});
