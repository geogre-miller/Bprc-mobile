import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing, Layout } from '@/constants/theme';
import { COMMODITIES } from '@/data/mock-data';
import { addDays, MY_BUYER_ID, useMyBuyerPosts, useMyBuyerProfile } from '@/hooks/use-buyer-posts';
import { useTheme } from '@/hooks/use-theme';
import { Icon } from '@/screens/home-dashboard/icons';
import type { BuyingDemand, Commodity } from '@/types/domain';
import { formatAmount } from '@/utils/format-price';

const VALIDITY_DAYS = [3, 7, 14, 30] as const;

const digitsOnly = (value: string) => value.replace(/[^\d]/g, '');
const groupDigits = (value: string) => (value ? formatAmount(Number(value)) : '');

/** Create or edit one "tin thu mua": a single firm price for a stated quality, valid for a set period. */
export function BuyerDemandForm({ id }: { id?: string }) {
  const [posts, setPosts, postsLoaded] = useMyBuyerPosts();
  const [profile, , profileLoaded] = useMyBuyerProfile();
  if (!postsLoaded || !profileLoaded) return <ActivityIndicator style={styles.loading} size="large" />;

  const existing = posts.find((post) => post.id === id);
  const defaultArea = [profile.address.district, profile.address.province].filter(Boolean).join(', ');
  return (
    <PostForm
      existing={existing}
      defaultArea={defaultArea}
      onSave={(saved) => setPosts((current) => [...current.filter((post) => post.id !== saved.id), saved])}
    />
  );
}

type Errors = Partial<Record<'price' | 'quantity', string>>;

function PostForm({
  existing,
  defaultArea,
  onSave,
}: {
  existing?: BuyingDemand;
  defaultArea: string;
  onSave: (post: BuyingDemand) => void;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [commodity, setCommodity] = useState<Commodity>(existing?.commodity ?? COMMODITIES[0].id);
  const [price, setPrice] = useState(existing ? String(existing.pricePerUnit) : '');
  const [quantity, setQuantity] = useState(existing?.desiredQuantity != null ? String(existing.desiredQuantity) : '');
  const [quality, setQuality] = useState(existing?.qualityRequirements ?? '');
  const [priceNote, setPriceNote] = useState(existing?.priceNote ?? '');
  const [area, setArea] = useState(existing?.area ?? defaultArea);
  // Editing keeps the current end date until the buyer picks a new period.
  const [validityDays, setValidityDays] = useState<number | null>(existing ? null : 7);
  const [errors, setErrors] = useState<Errors>({});

  const save = () => {
    const parsedPrice = Number(price);
    const parsedQuantity = quantity ? Number(quantity) : undefined;
    const sold = existing?.desiredQuantity != null ? existing.desiredQuantity - (existing.remainingQuantity ?? 0) : 0;

    const nextErrors: Errors = {};
    if (!parsedPrice) nextErrors.price = 'Nhập giá thu mua lớn hơn 0.';
    if (parsedQuantity === 0) nextErrors.quantity = 'Số lượng phải lớn hơn 0, hoặc để trống nếu không giới hạn.';
    else if (parsedQuantity != null && parsedQuantity < sold)
      nextErrors.quantity = `Bạn đã mua ${formatAmount(sold)} kg theo tin này; số lượng không thể nhỏ hơn.`;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const now = new Date();
    onSave({
      id: existing?.id ?? String(now.getTime()),
      buyerId: MY_BUYER_ID,
      commodity,
      pricePerUnit: parsedPrice,
      unit: 'kg',
      desiredQuantity: parsedQuantity,
      remainingQuantity: parsedQuantity != null ? parsedQuantity - sold : undefined,
      qualityRequirements: quality.trim() || undefined,
      priceNote: priceNote.trim() || undefined,
      area: area.trim() || undefined,
      periodStart: existing?.periodStart ?? now.toISOString(),
      periodEnd: validityDays != null ? addDays(now, validityDays) : existing?.periodEnd,
    });
    router.back();
  };

  const inputStyle = [styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.backgroundElement }];
  const endLabel = existing?.periodEnd && new Date(existing.periodEnd).toLocaleDateString('vi-VN');

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Field label="Mặt hàng">
          <View style={styles.chips}>
            {COMMODITIES.map((option) => {
              const selected = commodity === option.id;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => setCommodity(option.id)}
                  style={[
                    styles.chip,
                    selected
                      ? { backgroundColor: theme.primaryContainer, borderColor: theme.primaryContainer }
                      : { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                  ]}>
                  <ThemedText type="labelMd" style={{ color: selected ? theme.onPrimary : theme.text }}>
                    {option.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </Field>

        <Field label="Giá thu mua" error={errors.price}>
          <View style={[styles.suffixInput, { borderColor: errors.price ? theme.loss : theme.border, backgroundColor: theme.backgroundElement }]}>
            <ThemedTextInput
              accessibilityLabel="Giá thu mua, đồng một ký"
              value={groupDigits(price)}
              onChangeText={(value) => setPrice(digitsOnly(value))}
              placeholder="Ví dụ: 116.000"
              placeholderTextColor={theme.outline}
              keyboardType="number-pad"
              style={[styles.numberInput, !price && styles.numberEmpty, { color: theme.text }]}
            />
            <ThemedText type="bodySm" themeColor="textSecondary" style={styles.suffix}>
              ₫/kg
            </ThemedText>
          </View>
        </Field>

        <Field label="Yêu cầu chất lượng" hint="Giá trên áp dụng cho hàng đạt yêu cầu này.">
          <ThemedTextInput
            accessibilityLabel="Yêu cầu chất lượng"
            value={quality}
            onChangeText={setQuality}
            placeholder="Ví dụ: Độ ẩm dưới 13%, tạp chất dưới 1%"
            placeholderTextColor={theme.outline}
            style={inputStyle}
          />
        </Field>

        <Field label="Giá theo chất lượng (không bắt buộc)">
          <ThemedTextInput
            accessibilityLabel="Ghi chú giá theo chất lượng"
            value={priceNote}
            onChangeText={setPriceNote}
            placeholder="Ví dụ: trừ 1.000 ₫/kg mỗi 1% ẩm trên 13%"
            placeholderTextColor={theme.outline}
            style={inputStyle}
          />
        </Field>

        <Field label="Số lượng cần mua" hint="Để trống nếu thu mua không giới hạn." error={errors.quantity}>
          <View style={[styles.suffixInput, { borderColor: errors.quantity ? theme.loss : theme.border, backgroundColor: theme.backgroundElement }]}>
            <ThemedTextInput
              accessibilityLabel="Số lượng cần mua, ký"
              value={groupDigits(quantity)}
              onChangeText={(value) => setQuantity(digitsOnly(value))}
              placeholder="Không giới hạn"
              placeholderTextColor={theme.outline}
              keyboardType="number-pad"
              style={[styles.numberInput, !quantity && styles.numberEmpty, { color: theme.text }]}
            />
            <ThemedText type="bodySm" themeColor="textSecondary" style={styles.suffix}>
              kg
            </ThemedText>
          </View>
        </Field>

        <Field label="Khu vực thu mua">
          <ThemedTextInput
            accessibilityLabel="Khu vực thu mua"
            value={area}
            onChangeText={setArea}
            placeholder="Ví dụ: Ngọc Hồi, Đắk Tô"
            placeholderTextColor={theme.outline}
            style={inputStyle}
          />
        </Field>

        <Field
          label="Thời hạn tin"
          hint={validityDays == null && endLabel ? `Đang hiệu lực đến ${endLabel}. Chọn để gia hạn từ hôm nay.` : undefined}>
          <View style={styles.chips}>
            {VALIDITY_DAYS.map((days) => {
              const selected = validityDays === days;
              return (
                <Pressable
                  key={days}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => setValidityDays(days)}
                  style={[
                    styles.chip,
                    selected
                      ? { backgroundColor: theme.primaryContainer, borderColor: theme.primaryContainer }
                      : { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                  ]}>
                  <ThemedText type="labelMd" style={{ color: selected ? theme.onPrimary : theme.text }}>
                    {days} ngày
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </Field>
      </ScrollView>

      <ThemedView style={[styles.footer, { borderTopColor: theme.border, paddingBottom: Spacing.three + insets.bottom }]}>
        <Pressable accessibilityRole="button" onPress={save}>
          {({ pressed }) => (
            <View style={[styles.saveButton, { backgroundColor: pressed ? theme.primary : theme.primaryContainer }]}>
              <Icon name="check_circle" size={20} color={theme.onPrimary} />
              <ThemedText type="titleMd" style={{ color: theme.onPrimary }}>
                {existing ? 'Lưu thay đổi' : 'Đăng tin thu mua'}
              </ThemedText>
            </View>
          )}
        </Pressable>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.field}>
      <ThemedText type="labelMd" themeColor="textSecondary">
        {label}
      </ThemedText>
      {children}
      {error ? (
        <ThemedText type="labelSm" accessibilityLiveRegion="polite" style={{ color: theme.loss }}>
          {error}
        </ThemedText>
      ) : (
        hint && (
          <ThemedText type="labelSm" themeColor="textSecondary">
            {hint}
          </ThemedText>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loading: { flex: 1 },
  content: {
    padding: Layout.screenMargin,
    gap: Spacing.four,
  },
  field: {
    gap: Spacing.two,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: 6,
    borderWidth: 1,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: Radius.container,
    borderWidth: 1,
    fontSize: 16,
  },
  suffixInput: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.container,
    borderWidth: 1,
  },
  numberInput: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 12,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  numberEmpty: {
    fontSize: 16,
    fontWeight: '400',
  },
  suffix: {
    paddingRight: 12,
  },
  footer: {
    paddingHorizontal: Spacing.three,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  saveButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderRadius: Radius.container,
  },
});
