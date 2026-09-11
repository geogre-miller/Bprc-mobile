import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LightPalette, Radius, Spacing } from '@/constants/theme';
import { BUYERS, COMMODITIES, PRICE_OBSERVATIONS, latestObservation } from '@/data/mock-data';
import { usePersistedState } from '@/hooks/use-persisted-state';
import { useTheme } from '@/hooks/use-theme';
import { Icon, type IconName } from '@/screens/home-dashboard/icons';
import type { Commodity, FarmerInventoryItem, SellingJournalEntry } from '@/types/domain';
import { formatVnd } from '@/utils/format-price';

const COLORS = LightPalette;

const FONT = {
  manropeSemiBold: 'RecordSaleManropeSemiBold',
  publicSansRegular: 'RecordSalePublicSansRegular',
  publicSansMedium: 'RecordSalePublicSansMedium',
  publicSansSemiBold: 'RecordSalePublicSansSemiBold',
  publicSansBold: 'RecordSalePublicSansBold',
} as const;

const fontMap = {
  [FONT.manropeSemiBold]: require('../../../assets/fonts/Manrope-SemiBold.ttf'),
  [FONT.publicSansRegular]: require('../../../assets/fonts/PublicSans-Regular.ttf'),
  [FONT.publicSansMedium]: require('../../../assets/fonts/PublicSans-Medium.ttf'),
  [FONT.publicSansSemiBold]: require('../../../assets/fonts/PublicSans-SemiBold.ttf'),
  [FONT.publicSansBold]: require('../../../assets/fonts/PublicSans-Bold.ttf'),
};

type SaleCommodityOption = {
  id: Commodity;
  label: string;
  stock: number;
  unitCost: number;
  marketPrice: number;
  unit: 'kg';
};

type SaleBuyerOption = {
  id: string;
  label: string;
  name: string;
};

const SALE_COMMODITIES: SaleCommodityOption[] = [
  {
    id: 'coffee',
    label: '☕ Cà phê Robusta nhân xô (Tồn: 2,500 kg)',
    stock: 2500,
    unitCost: 78000,
    marketPrice: 118500,
    unit: 'kg',
  },
  {
    id: 'pepper',
    label: '🌿 Hồ tiêu đen Chư Sê (Tồn: 850 kg)',
    stock: 850,
    unitCost: 110000,
    marketPrice: 158000,
    unit: 'kg',
  },
  {
    id: 'fruit',
    label: '🍈 Sầu riêng Ri6 xuất khẩu (Tồn: 4,200 kg)',
    stock: 4200,
    unitCost: 65000,
    marketPrice: 88000,
    unit: 'kg',
  },
  {
    id: 'cashew',
    label: '🌰 Hạt điều (Tồn: 310 kg)',
    stock: 310,
    unitCost: 30000,
    marketPrice: 41000,
    unit: 'kg',
  },
  {
    id: 'rice',
    label: '🌾 Lúa khô ST25 (Tồn: 5,000 kg)',
    stock: 5000,
    unitCost: 10200,
    marketPrice: 11500,
    unit: 'kg',
  },
];

const DEFAULT_BUYERS: SaleBuyerOption[] = [
  { id: 'b1', label: '🏢 Đại lý Toàn Thắng (Buôn Hồ - Đắk Lắk)', name: 'Đại lý Toàn Thắng' },
  { id: 'b2', label: '🏪 Thu mua nông sản Phát Đạt (Gia Lai)', name: 'Thu mua nông sản Phát Đạt' },
  { id: 'b3', label: '🚢 Cty XNK Simexco Đắk Lắk', name: 'Cty XNK Simexco Đắk Lắk' },
  { id: 'b4', label: '👤 Thương lái lẻ: Chị Bích (Cư M\'gar)', name: 'Thương lái lẻ: Chị Bích' },
];

const DEFAULT_DATE = '2024-10-24';
const JOURNAL_STORAGE_KEY = 'rayGia:selling-journal';
const INVENTORY_STORAGE_KEY = 'rayGia:inventory';

const DEFAULT_INVENTORY: FarmerInventoryItem[] = [
  { commodity: 'coffee', quantity: 2500, unit: 'kg' },
  { commodity: 'pepper', quantity: 800, unit: 'kg' },
  { commodity: 'fruit', quantity: 1200, unit: 'kg' },
  { commodity: 'rice', quantity: 5000, unit: 'kg' },
];

function parseNumeric(value: string): number {
  const parsed = Number(value.replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function formatQuantity(value: number): string {
  return Math.round(value).toLocaleString('en-US');
}

function reconcileInventory(
  items: FarmerInventoryItem[],
  commodity: Commodity,
  quantity: number,
  fallbackStock: number,
): FarmerInventoryItem[] {
  const hasMatchingItem = items.some((item) => item.commodity === commodity && item.unit === 'kg');
  if (!hasMatchingItem) {
    return [...items, { commodity, quantity: Math.max(0, fallbackStock - quantity), unit: 'kg' }];
  }

  let remaining = quantity;
  return items.map((item) => {
    if (item.commodity !== commodity || item.unit !== 'kg' || remaining <= 0) return item;
    const deduction = Math.min(Math.max(0, item.quantity), remaining);
    remaining -= deduction;
    return { ...item, quantity: Math.max(0, item.quantity - deduction) };
  });
}

function commodityLabel(commodity: Commodity): string {
  return (
    SALE_COMMODITIES.find((option) => option.id === commodity)?.label ??
    COMMODITIES.find((option) => option.id === commodity)?.label ??
    commodity
  );
}

function buyerName(buyerId: string | undefined, options: SaleBuyerOption[]): string | undefined {
  if (!buyerId) return undefined;
  return options.find((option) => option.id === buyerId)?.name ?? BUYERS.find((buyer) => buyer.id === buyerId)?.name;
}

function FieldLabel({ icon, label, accessory }: { icon: IconName; label: string; accessory?: React.ReactNode }) {
  return (
    <View style={styles.fieldLabelRow}>
      <View style={styles.fieldLabelCopy}>
        <Icon name={icon} size={18} color={COLORS.secondary} />
        <ThemedText type="labelMd" style={styles.fieldLabel}>
          {label}
        </ThemedText>
      </View>
      {accessory}
    </View>
  );
}

type DropdownProps = {
  testID: string;
  accessibilityLabel: string;
  value: string;
  options: { id: string; label: string }[];
  open: boolean;
  onToggle: () => void;
  onSelect: (id: string) => void;
};

function DropdownField({
  testID,
  accessibilityLabel,
  value,
  options,
  open,
  onToggle,
  onSelect,
}: DropdownProps) {
  return (
    <View style={styles.dropdownWrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ expanded: open }}
        testID={testID}
        onPress={onToggle}
        style={({ pressed }) => [styles.selectControl, pressed && styles.pressed]}>
        <ThemedText type="small" style={styles.selectValue} numberOfLines={1}>
          {value}
        </ThemedText>
        <Icon name="expand_more" size={20} color={COLORS.onSurfaceVariant} />
      </Pressable>
      {open && (
        <ThemedView type="backgroundElement" style={styles.dropdownMenu}>
          {options.map((option) => (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityLabel={`Chọn ${option.label}`}
              onPress={() => onSelect(option.id)}
              style={({ pressed }) => [styles.dropdownOption, pressed && styles.dropdownOptionPressed]}>
              <ThemedText type="small" style={styles.dropdownOptionText}>
                {option.label}
              </ThemedText>
            </Pressable>
          ))}
        </ThemedView>
      )}
    </View>
  );
}

export function SellingJournal() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    commodity?: string;
    stock?: string;
    price?: string;
    unitCost?: string;
    buyerId?: string;
    buyerName?: string;
  }>();
  const [inventory, setInventory, inventoryLoaded] = usePersistedState<FarmerInventoryItem[] | null>('inventory', null);
  const saleOptions = useMemo(() => {
    const readNumber = (value: string | undefined, fallback: number) => {
      const number = Number(value);
      return typeof value === 'string' && value.trim() !== '' && Number.isFinite(number) && number >= 0
        ? number
        : fallback;
    };
    const options: SaleCommodityOption[] = [
      ...SALE_COMMODITIES,
      ...COMMODITIES.filter((commodity) => !SALE_COMMODITIES.some((option) => option.id === commodity.id)).map((commodity) => ({
        id: commodity.id,
        label: `${commodity.label} (Tồn: 0 kg)`,
        stock: 0,
        unitCost: 0,
        marketPrice: latestObservation(commodity.id)?.pricePerUnit ?? 0,
        unit: 'kg' as const,
      })),
    ];
    return options.map((option) => {
      const savedStock = inventory == null
        ? DEFAULT_INVENTORY.find((item) => item.commodity === option.id && item.unit === option.unit)?.quantity ?? option.stock
        : inventory
            .filter((item) => item.commodity === option.id && item.unit === option.unit)
            .reduce((sum, item) => sum + Math.max(0, item.quantity), 0);
      const selected = option.id === params.commodity;
      const stock = selected && inventory == null ? readNumber(params.stock, savedStock) : savedStock;
      return {
        ...option,
        stock,
        label: option.label.replace(/\(Tồn:.*\)/, `(Tồn: ${formatQuantity(stock)} kg)`),
        marketPrice: selected ? readNumber(params.price, option.marketPrice) : option.marketPrice,
        unitCost: selected ? readNumber(params.unitCost, option.unitCost) : option.unitCost,
      };
    });
  }, [inventory, params.commodity, params.stock, params.price, params.unitCost]);
  const initialOption = saleOptions.find((option) => option.id === params.commodity) ?? saleOptions[0];
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/inventory'));
  const [fontsLoaded, fontError] = useFonts(fontMap);
  const [entries, setEntries, isLoaded] = usePersistedState<SellingJournalEntry[]>('selling-journal', []);
  const [commodity, setCommodity] = useState<Commodity>(initialOption.id);
  const [buyerOptions, setBuyerOptions] = useState(() => {
    if (typeof params.buyerId !== 'string' || !params.buyerId || typeof params.buyerName !== 'string' || !params.buyerName.trim()) {
      return DEFAULT_BUYERS;
    }
    const selected = { id: params.buyerId, name: params.buyerName.trim(), label: params.buyerName.trim() };
    return [selected, ...DEFAULT_BUYERS.filter((buyer) => buyer.id !== selected.id)];
  });
  const [buyerId, setBuyerId] = useState<string | undefined>(() =>
    buyerOptions.find((buyer) => buyer.id === params.buyerId)?.id ?? (params.commodity ? undefined : DEFAULT_BUYERS[0].id),
  );
  const [weightInput, setWeightInput] = useState(() => {
    if (params.commodity && params.stock != null) return String(initialOption.stock);
    return '1200';
  });
  const [priceInput, setPriceInput] = useState(() => String(initialOption.marketPrice));
  const [deliveryDate, setDeliveryDate] = useState(DEFAULT_DATE);
  const [shippingInput, setShippingInput] = useState('0');
  const [orderNote, setOrderNote] = useState('Cân tại kho vườn, trừ độ ẩm 0.5%, tiền mặt 100%');
  const [openSelect, setOpenSelect] = useState<'commodity' | 'buyer' | null>(null);
  const [addingBuyer, setAddingBuyer] = useState(false);
  const [newBuyerName, setNewBuyerName] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedCommodity = useMemo(
    () => saleOptions.find((option) => option.id === commodity) ?? saleOptions[0],
    [commodity, saleOptions],
  );
  const selectedBuyer = buyerOptions.find((option) => option.id === buyerId);
  const metrics = useMemo(() => {
    const weight = clamp(parseNumeric(weightInput), 0, selectedCommodity.stock);
    const unitPrice = Math.max(0, parseNumeric(priceInput));
    const shipping = Math.max(0, parseNumeric(shippingInput));
    const grossRevenue = weight * unitPrice;
    const totalCost = weight * selectedCommodity.unitCost;
    const netProfit = grossRevenue - totalCost - shipping;
    const margin = selectedCommodity.unitCost > 0
      ? ((unitPrice - selectedCommodity.unitCost) / selectedCommodity.unitCost) * 100
      : 0;
    const unitProfit = weight > 0 ? netProfit / weight : 0;
    const remainingStock = Math.max(0, selectedCommodity.stock - weight);

    return { weight, unitPrice, shipping, grossRevenue, totalCost, netProfit, margin, unitProfit, remainingStock };
  }, [priceInput, selectedCommodity, shippingInput, weightInput]);

  const averagesByCommodity = useMemo(
    () =>
      COMMODITIES.map((option) => {
        const matching = entries.filter((entry) => entry.commodity === option.id);
        if (matching.length === 0) return null;
        const average = matching.reduce((sum, entry) => sum + entry.actualPricePerUnit, 0) / matching.length;
        return { label: option.label, average };
      }).filter((row): row is { label: string; average: number } => row !== null),
    [entries],
  );

  useEffect(() => {
    if (!toastVisible) return undefined;
    const timeout = setTimeout(() => setToastVisible(false), 2800);
    return () => clearTimeout(timeout);
  }, [toastVisible]);

  const setWeight = (value: number) => {
    setWeightInput(String(clamp(value, 0, selectedCommodity.stock)));
    setValidationError(null);
  };

  const handleWeightChange = (value: string) => {
    setWeightInput(value.replace(/[^\d]/g, ''));
    setValidationError(null);
  };

  const handleWeightBlur = () => {
    if (!weightInput) return;
    setWeightInput(String(clamp(parseNumeric(weightInput), 0, selectedCommodity.stock)));
  };

  const handleShippingBlur = () => {
    if (!shippingInput) {
      setShippingInput('0');
      return;
    }
    setShippingInput(String(Math.max(0, parseNumeric(shippingInput))));
  };

  const handleAddBuyer = () => {
    const trimmed = newBuyerName.trim();
    if (!trimmed) {
      setValidationError('Vui lòng nhập tên thương lái hoặc đại lý mới.');
      return;
    }
    const id = `custom_${Date.now()}`;
    const option = { id, name: trimmed, label: `🤝 ${trimmed}` };
    setBuyerOptions((current) => [...current, option]);
    setBuyerId(id);
    setNewBuyerName('');
    setAddingBuyer(false);
    setOpenSelect(null);
    setValidationError(null);
  };

  const handleSave = async () => {
    if (saving) return;

    const rawWeight = parseNumeric(weightInput);
    const parsedPrice = parseNumeric(priceInput);

    if (!rawWeight || rawWeight <= 0) {
      setValidationError('Vui lòng nhập khối lượng xuất bán lớn hơn 0 kg.');
      return;
    }
    if (rawWeight > selectedCommodity.stock) {
      setValidationError(`Khối lượng không thể vượt quá ${formatQuantity(selectedCommodity.stock)} kg tồn kho.`);
      return;
    }
    if (!parsedPrice || parsedPrice <= 0) {
      setValidationError('Vui lòng nhập đơn giá chốt bán lớn hơn 0 ₫/kg.');
      return;
    }

    const quotedPricePerUnit = buyerId
      ? PRICE_OBSERVATIONS.find((observation) => observation.buyerId === buyerId && observation.commodity === commodity)
          ?.pricePerUnit
      : undefined;

    const savedEntry: SellingJournalEntry = {
      id: String(Date.now()),
      farmerId: 'me',
      commodity,
      quantity: rawWeight,
      unit: selectedCommodity.unit,
      buyerId,
      quotedPricePerUnit,
      actualPricePerUnit: parsedPrice,
      soldAt: new Date().toISOString(),
    };

    const nextEntries = [savedEntry, ...entries];
    const nextInventory = reconcileInventory(inventory ?? DEFAULT_INVENTORY, commodity, rawWeight, selectedCommodity.stock);

    setSaving(true);
    setToastVisible(false);
    try {
      await AsyncStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(nextEntries));
      try {
        await AsyncStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(nextInventory));
      } catch {
        try {
          await AsyncStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(entries));
        } catch {
          // Keep the failure visible even if the best-effort journal rollback is unavailable.
        }
        throw new Error('inventory-persistence-failed');
      }
      setEntries(nextEntries);
      setInventory(nextInventory);
      setValidationError(null);
      setToastVisible(true);
    } catch {
      setValidationError('Không thể lưu phiếu bán. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const removeEntry = (id: string) => {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  };

  if ((!fontsLoaded && !fontError) || !isLoaded || !inventoryLoaded) {
    return <ThemedView style={[styles.screen, { backgroundColor: theme.surface }]}><Stack.Screen options={{ headerShown: false }} /></ThemedView>;
  }

  const marginText = `${Math.abs(metrics.margin).toFixed(1)}%`;
  const isProfitable = metrics.netProfit >= 0;

  return (
    <ThemedView style={[styles.screen, { backgroundColor: theme.surface }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.screenHeader, { paddingTop: insets.top, backgroundColor: theme.surface }]}>
        <View style={styles.screenHeaderRow}>
          <Pressable
            testID="saleBackButton"
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            onPress={goBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <Icon name="arrow_back" size={24} color={COLORS.onSurface} />
          </Pressable>
          <View style={styles.headerBrand}>
            <Image
              accessibilityLabel="Biểu trưng NôngSản Pro"
              source={require('@/assets/images/nongsan-pro-logo.png')}
              resizeMode="contain"
              style={styles.headerLogo}
            />
            <ThemedText type="titleMd" style={styles.screenTitle} numberOfLines={1}>
              Tạo Giao Dịch Bán
            </ThemedText>
          </View>
          <Image
            accessibilityLabel="Ảnh đại diện của Chú Năm"
            source={require('@/assets/images/nongsan-pro-profile.png')}
            resizeMode="cover"
            style={styles.headerProfile}
          />
        </View>
      </View>
      <ScrollView
        testID="saleScreenScroll"
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 64 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.shell}>
          <View style={styles.flowHeader}>
            <View style={styles.flowHeaderLeft}>
              <ThemedText type="labelSm" style={styles.stepBadge}>
                Bước 1/1
              </ThemedText>
              <ThemedText type="bodySm" themeColor="textSecondary">
                1 chạm lưu ngay vào sổ cái
              </ThemedText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Hủy bỏ"
              onPress={goBack}
              style={({ pressed }) => [styles.cancelAction, pressed && styles.pressed]}>
              <Icon name="close" size={18} color={COLORS.onSurfaceVariant} />
              <ThemedText type="labelMd" themeColor="textSecondary">
                Hủy bỏ
              </ThemedText>
            </Pressable>
          </View>

          <ThemedView type="surfaceContainerLow" style={styles.quickBanner}>
            <View style={styles.quickBannerCopy}>
              <ThemedText type="labelSm" style={styles.eyebrow}>
                Giao dịch vụ mùa 2024
              </ThemedText>
              <ThemedText type="headlineSm" style={styles.quickBannerTitle}>
                Xuất Bán Nhanh Tại Vườn
              </ThemedText>
              <ThemedText type="bodySm" themeColor="textSecondary">
                Tự động đối soát giá sàn &amp; cập nhật tồn kho tức thì
              </ThemedText>
            </View>
            <View style={styles.quickBannerIcon}>
              <Icon name="shopping_bag" size={32} color={COLORS.primary} />
            </View>
          </ThemedView>

          <View testID="saleForm" style={styles.form}>
            <View style={styles.fieldGroup}>
              <FieldLabel
                icon="eco"
                label="Nông sản xuất bán"
                accessory={
                  <ThemedText type="bodySm" style={styles.stockHint}>
                    Kho còn: {formatQuantity(selectedCommodity.stock)} kg
                  </ThemedText>
                }
              />
              <DropdownField
                testID="commoditySelect"
                accessibilityLabel="Chọn nông sản xuất bán"
                value={selectedCommodity.label}
                options={saleOptions}
                open={openSelect === 'commodity'}
                onToggle={() => {
                  setOpenSelect(openSelect === 'commodity' ? null : 'commodity');
                  setAddingBuyer(false);
                }}
                onSelect={(id) => {
                  setCommodity(id as Commodity);
                  const option = saleOptions.find((candidate) => candidate.id === id);
                  if (option) {
                    setPriceInput(String(option.marketPrice));
                    setWeightInput((current) => String(clamp(parseNumeric(current), 0, option.stock)));
                  }
                  setOpenSelect(null);
                  setValidationError(null);
                }}
              />
            </View>

            <View style={styles.fieldGroup}>
              <FieldLabel
                icon="storefront"
                label="Thương lái / Đại lý thu mua"
                accessory={
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Thêm mới"
                    onPress={() => {
                      setAddingBuyer((current) => !current);
                      setOpenSelect(null);
                      setValidationError(null);
                    }}
                    style={({ pressed }) => [styles.addAction, pressed && styles.pressed]}>
                    <Icon name="add_circle" size={16} color={COLORS.secondary} />
                    <ThemedText type="labelMd" style={styles.addActionText}>
                      Thêm mới
                    </ThemedText>
                  </Pressable>
                }
              />
              <DropdownField
                testID="buyerSelect"
                accessibilityLabel="Chọn thương lái hoặc đại lý thu mua"
                value={selectedBuyer?.label ?? 'Chọn thương lái / đại lý'}
                options={buyerOptions}
                open={openSelect === 'buyer'}
                onToggle={() => {
                  setOpenSelect(openSelect === 'buyer' ? null : 'buyer');
                  setAddingBuyer(false);
                }}
                onSelect={(id) => {
                  setBuyerId(id);
                  setOpenSelect(null);
                  setValidationError(null);
                }}
              />
              {addingBuyer && (
                <View style={styles.addBuyerPanel}>
                  <TextInput
                    accessibilityLabel="Tên thương lái hoặc đại lý mới"
                    testID="newBuyerName"
                    value={newBuyerName}
                    onChangeText={(value) => {
                      setNewBuyerName(value);
                      setValidationError(null);
                    }}
                    placeholder="Nhập tên thương lái hoặc đại lý mới"
                    placeholderTextColor={theme.outline}
                    style={[styles.inlineInput, { color: theme.text }]}
                    returnKeyType="done"
                    onSubmitEditing={handleAddBuyer}
                  />
                  <View style={styles.addBuyerActions}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Lưu thương lái mới"
                      onPress={handleAddBuyer}
                      style={({ pressed }) => [styles.smallAction, pressed && styles.pressed]}>
                      <ThemedText type="labelMd" style={styles.addActionText}>
                        Thêm
                      </ThemedText>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Hủy thêm mới"
                      onPress={() => setAddingBuyer(false)}
                      style={({ pressed }) => [styles.smallAction, styles.smallActionMuted, pressed && styles.pressed]}>
                      <ThemedText type="labelMd" themeColor="textSecondary">
                        Hủy
                      </ThemedText>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <FieldLabel
                icon="scale"
                label="Khối lượng xuất bán"
                accessory={
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Bán hết lô"
                    onPress={() => setWeight(selectedCommodity.stock)}
                    style={({ pressed }) => [styles.sellAllAction, pressed && styles.pressed]}>
                    <ThemedText type="labelSm" style={styles.sellAllText}>
                      Bán hết lô ({formatQuantity(selectedCommodity.stock)} kg)
                    </ThemedText>
                  </Pressable>
                }
              />
              <View style={styles.inputWithSuffix}>
                <TextInput
                  accessibilityLabel="Khối lượng xuất bán"
                  accessibilityValue={{ min: 0, max: selectedCommodity.stock, now: metrics.weight }}
                  testID="saleWeight"
                  value={weightInput}
                  onChangeText={handleWeightChange}
                  onBlur={handleWeightBlur}
                  keyboardType="number-pad"
                  style={[styles.largeInput, { color: theme.text }]}
                />
                <ThemedText type="small" themeColor="textSecondary" style={styles.inputSuffix}>
                  kg
                </ThemedText>
              </View>
              <View style={styles.presetGrid}>
                {[500, 1000, 1200, 2000].map((value) => (
                  <Pressable
                    key={value}
                    accessibilityRole="button"
                    accessibilityLabel={`${formatQuantity(value)} kg`}
                    onPress={() => setWeight(value)}
                    style={({ pressed }) => [
                      styles.presetButton,
                      metrics.weight === value && styles.presetButtonSelected,
                      pressed && styles.pressed,
                    ]}>
                    <ThemedText
                      type="labelMd"
                      style={metrics.weight === value ? styles.presetTextSelected : styles.presetText}>
                      {formatQuantity(value)} kg
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <FieldLabel
                icon="payments"
                label="Đơn giá chốt bán"
                accessory={
                  <View style={styles.marketHintRow}>
                    <Icon name="trending_up" size={14} color={COLORS.secondary} />
                    <ThemedText type="labelSm" style={styles.marketHint}>
                      Sàn hôm nay: {formatVnd(selectedCommodity.marketPrice)}
                    </ThemedText>
                  </View>
                }
              />
              <View style={styles.inputWithSuffix}>
                <TextInput
                  accessibilityLabel="Đơn giá chốt bán"
                  testID="unitPrice"
                  value={priceInput}
                  onChangeText={(value) => {
                    setPriceInput(value.replace(/[^\d]/g, ''));
                    setValidationError(null);
                  }}
                  keyboardType="number-pad"
                  style={[styles.largeInput, { color: theme.text }]}
                />
                <ThemedText type="small" themeColor="textSecondary" style={styles.inputSuffix}>
                  ₫/kg
                </ThemedText>
              </View>
              <View style={styles.validationHint}>
                <Icon name="verified" size={16} color={COLORS.secondary} />
                <ThemedText type="bodySm" themeColor="textSecondary" style={styles.validationHintText}>
                  Mức giá cao hơn vốn sản xuất <ThemedText type="bodySm" style={styles.inlineEmphasis}>+{selectedCommodity.unitCost > 0 ? ((metrics.unitPrice - selectedCommodity.unitCost) / selectedCommodity.unitCost * 100).toFixed(1) : '0.0'}%</ThemedText>{' '}
                  ({metrics.unitPrice >= selectedCommodity.unitCost ? '+' : ''}{formatVnd(metrics.unitPrice - selectedCommodity.unitCost)}/kg)
                </ThemedText>
              </View>
            </View>

            <View style={styles.compactRow}>
              <View style={styles.compactField}>
                <ThemedText type="labelSm" themeColor="textSecondary" style={styles.compactLabel}>
                  Ngày chốt cân
                </ThemedText>
                <TextInput
                  accessibilityLabel="Ngày chốt cân"
                  testID="deliveryDate"
                  value={deliveryDate}
                  onChangeText={setDeliveryDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.outline}
                  style={[styles.compactInput, { color: theme.text }]}
                />
              </View>
              <View style={styles.compactField}>
                <ThemedText type="labelSm" themeColor="textSecondary" style={styles.compactLabel}>
                  Cước vận chuyển
                </ThemedText>
                <View style={styles.compactInputWrap}>
                  <TextInput
                    accessibilityLabel="Cước vận chuyển"
                    testID="shippingCost"
                    value={shippingInput}
                    onChangeText={(value) => {
                      setShippingInput(value.replace(/[^\d]/g, ''));
                      setValidationError(null);
                    }}
                    onBlur={handleShippingBlur}
                    keyboardType="number-pad"
                    style={[styles.compactInput, styles.compactInputWithSuffix, { color: theme.text }]}
                  />
                  <ThemedText type="bodySm" themeColor="textSecondary" style={styles.compactSuffix}>
                    ₫
                  </ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.fieldGroupCompact}>
              <ThemedText type="labelSm" themeColor="textSecondary" style={styles.compactLabel}>
                Ghi chú biên bản cân hàng
              </ThemedText>
              <TextInput
                accessibilityLabel="Ghi chú biên bản cân hàng"
                testID="orderNote"
                value={orderNote}
                onChangeText={setOrderNote}
                style={[styles.noteInput, { color: theme.text }]}
              />
            </View>

            <ThemedView testID="profit-calculation" type="surfaceContainer" style={styles.profitCard}>
              <View style={styles.profitHeader}>
                <View style={styles.liveLabel}>
                  <View style={styles.liveDot} />
                  <ThemedText type="labelSm" themeColor="textSecondary" style={styles.uppercaseLabel}>
                    Bảng tính lời lỗ tức thì
                  </ThemedText>
                </View>
                <ThemedText
                  type="labelSm"
                  style={[styles.marginBadge, isProfitable ? styles.marginBadgePositive : styles.marginBadgeNegative]}>
                  {isProfitable ? 'Biên lãi' : 'Lỗ'} {marginText}
                </ThemedText>
              </View>

              <View style={styles.breakdown}>
                <MetricRow icon="receipt_long" label="Tổng doanh thu nhận:" value={formatVnd(metrics.grossRevenue)} />
                <MetricRow
                  icon="inventory_2"
                  label={`Giá vốn lô hàng (${formatVnd(selectedCommodity.unitCost)}/kg):`}
                  value={`-${formatVnd(metrics.totalCost)}`}
                  valueColor={COLORS.error}
                />
                {metrics.shipping > 0 && (
                  <MetricRow
                    icon="local_shipping"
                    label="Cước vận chuyển phát sinh:"
                    value={`-${formatVnd(metrics.shipping)}`}
                    valueColor={COLORS.error}
                  />
                )}
              </View>

              <View style={styles.netProfitInset}>
                <View style={styles.netProfitCopy}>
                  <ThemedText type="labelSm" style={styles.netProfitLabel}>
                    Lợi nhuận ròng thực tế
                  </ThemedText>
                  <ThemedText type="bodySm" themeColor="textSecondary">
                    Đã khấu trừ toàn bộ chi phí gốc
                  </ThemedText>
                </View>
                <View style={styles.netProfitValue}>
                  <ThemedText testID="netProfitText" type="numericHero" style={isProfitable ? styles.profitPositive : styles.profitNegative}>
                    {isProfitable ? '+' : ''}{formatVnd(metrics.netProfit)}
                  </ThemedText>
                  <ThemedText
                    testID="unitProfitText"
                    type="labelSm"
                    style={isProfitable ? styles.unitProfitPositive : styles.unitProfitNegative}>
                    {isProfitable ? '+' : ''}{formatVnd(metrics.unitProfit)} / kg
                  </ThemedText>
                </View>
              </View>

              <View style={styles.stockProjection}>
                <Icon name="warehouse" size={16} color={COLORS.secondary} />
                <ThemedText testID="stockProjectionText" type="bodySm" themeColor="textSecondary" style={styles.stockProjectionText}>
                  Tồn kho còn lại sau khi xuất: <ThemedText type="bodySm" style={styles.inlineEmphasis}>{formatQuantity(metrics.remainingStock)} kg</ThemedText>
                </ThemedText>
              </View>
            </ThemedView>

            {validationError && (
              <ThemedText testID="saleValidationError" type="bodySm" style={styles.errorText}>
                {validationError}
              </ThemedText>
            )}

            <View style={styles.primaryActionGroup}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Xác Nhận và Lưu Phiếu Bán"
                accessibilityState={{ disabled: saving, busy: saving }}
                testID="submitBtn"
                onPress={handleSave}
                disabled={saving}
                style={({ pressed }) => [styles.submitButton, saving && styles.submitDisabled, pressed && styles.submitPressed]}>
                <Icon name="check_circle" size={24} color={COLORS.onPrimary} />
                <ThemedText type="titleMd" style={styles.submitText}>
                  {saving ? 'Đang lưu phiếu bán…' : 'Xác Nhận & Lưu Phiếu Bán'}
                </ThemedText>
              </Pressable>
              <ThemedText type="bodySm" themeColor="textSecondary" style={styles.submitHelper}>
                Hệ thống sẽ tự động trừ <ThemedText testID="helpWeight" type="bodySm" style={styles.helperWeight}>{formatQuantity(metrics.weight)} kg</ThemedText> trong kho và ghi nhận ngay vào sổ thu chi tổng hợp.
              </ThemedText>
            </View>
          </View>

          {entries.length > 0 && (
            <View style={styles.savedJournalSection}>
              <ThemedText type="titleMd" style={styles.savedJournalTitle}>
                Phiếu bán đã lưu
              </ThemedText>
              {averagesByCommodity.length > 0 && (
                <ThemedView type="backgroundElement" style={styles.summaryCard}>
                  <ThemedText type="bodySm" themeColor="textSecondary">
                    Giá bán trung bình
                  </ThemedText>
                  {averagesByCommodity.map((row) => (
                    <ThemedText key={row.label} type="bodySm">
                      {row.label}: {formatVnd(Math.round(row.average))}/kg
                    </ThemedText>
                  ))}
                </ThemedView>
              )}
              {entries.map((entry) => {
                const buyer = buyerName(entry.buyerId, buyerOptions);
                return (
                  <ThemedView key={entry.id} type="backgroundElement" style={styles.entryCard}>
                    <View style={styles.entryCopy}>
                      <ThemedText type="smallBold">
                        {commodityLabel(entry.commodity)} · {formatQuantity(entry.quantity)} {entry.unit}
                      </ThemedText>
                      <ThemedText type="bodySm" themeColor="textSecondary">
                        {formatVnd(entry.actualPricePerUnit)}/{entry.unit}{buyer ? ` · ${buyer}` : ''}
                      </ThemedText>
                      {entry.quotedPricePerUnit != null && (
                        <ThemedText type="bodySm" themeColor="textSecondary">
                          Báo giá {formatVnd(entry.quotedPricePerUnit)} · {entry.actualPricePerUnit >= entry.quotedPricePerUnit ? '+' : ''}{formatVnd(entry.actualPricePerUnit - entry.quotedPricePerUnit)}
                        </ThemedText>
                      )}
                      <ThemedText type="bodySm" themeColor="textSecondary">
                        {new Date(entry.soldAt).toLocaleDateString('vi-VN')}
                      </ThemedText>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Xóa phiếu bán ${entry.id}`}
                      onPress={() => removeEntry(entry.id)}
                      style={({ pressed }) => [styles.removeAction, pressed && styles.pressed]}>
                      <ThemedText type="bodySm" themeColor="textSecondary">
                        Xóa
                      </ThemedText>
                    </Pressable>
                  </ThemedView>
                );
              })}
            </View>
          )}

          <ThemedView type="surfaceContainerLow" style={styles.transparencyCard}>
            <View style={styles.transparencyIconWell}>
              <Icon name="verified_user" size={28} color={COLORS.primary} />
            </View>
            <View style={styles.transparencyCopy}>
              <ThemedText type="titleMd" style={styles.transparencyTitle}>
                Minh bạch &amp; An toàn
              </ThemedText>
              <ThemedText type="bodySm" themeColor="textSecondary">
                Dữ liệu sao lưu đám mây thời gian thực, có thể xuất hóa đơn điện tử hoặc biên lai PDF gửi Zalo cho đối tác.
              </ThemedText>
            </View>
          </ThemedView>
        </View>
      </ScrollView>

      {toastVisible && (
        <View pointerEvents="none" testID="toastSuccess" style={styles.toastPosition}>
          <View style={styles.toast}>
            <Icon name="task_alt" size={24} color={COLORS.secondaryFixedDim} />
            <View style={styles.toastCopy}>
              <ThemedText type="titleMd" style={styles.toastTitle}>
                Đã lưu phiếu bán thành công!
              </ThemedText>
              <ThemedText type="bodySm" style={styles.toastBody}>
                Đã xuất kho và cập nhật doanh thu.
              </ThemedText>
            </View>
          </View>
        </View>
      )}
    </ThemedView>
  );
}

function MetricRow({ icon, label, value, valueColor }: { icon: IconName; label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.metricRow}>
      <View style={styles.metricLabelWrap}>
        <Icon name={icon} size={18} color={COLORS.onSurfaceVariant} />
        <ThemedText type="small" themeColor="textSecondary" style={styles.metricLabel}>
          {label}
        </ThemedText>
      </View>
      <ThemedText type="smallBold" style={valueColor ? { color: valueColor } : styles.metricValue}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  screenHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  screenHeaderRow: {
    width: '100%',
    maxWidth: 430,
    height: 64,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.base,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  headerBrand: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  screenTitle: {
    flex: 1,
    fontFamily: FONT.manropeSemiBold,
    color: COLORS.onSurface,
  },
  headerLogo: {
    width: 32,
    height: 32,
  },
  headerProfile: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingBottom: 48,
  },
  shell: {
    width: '100%',
    maxWidth: 430,
  },
  flowHeader: {
    minHeight: 48,
    paddingVertical: Spacing.two,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  flowHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexShrink: 1,
  },
  stepBadge: {
    color: COLORS.onSecondaryContainer,
    backgroundColor: COLORS.secondaryContainer,
    borderRadius: Radius.sheet,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: 'hidden',
    textTransform: 'uppercase',
  },
  cancelAction: {
    minHeight: 36,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.container,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickBanner: {
    minHeight: 94,
    borderRadius: Radius.container,
    padding: Spacing.three,
    marginBottom: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  quickBannerCopy: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    color: COLORS.secondary,
    textTransform: 'uppercase',
    fontFamily: FONT.publicSansSemiBold,
  },
  quickBannerTitle: {
    color: COLORS.primary,
    fontFamily: FONT.manropeSemiBold,
  },
  quickBannerIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.sheet,
    backgroundColor: COLORS.primaryFixed,
    opacity: 0.72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    gap: Spacing.three,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldGroupCompact: {
    gap: 4,
  },
  fieldLabelRow: {
    minHeight: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  fieldLabelCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  fieldLabel: {
    color: COLORS.onSurface,
    fontFamily: FONT.publicSansSemiBold,
  },
  stockHint: {
    color: COLORS.secondary,
    fontFamily: FONT.publicSansMedium,
    flexShrink: 0,
  },
  addAction: {
    minHeight: 30,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  addActionText: {
    color: COLORS.secondary,
    fontFamily: FONT.publicSansSemiBold,
  },
  dropdownWrap: {
    position: 'relative',
    zIndex: 5,
  },
  selectControl: {
    minHeight: 48,
    borderRadius: Radius.base,
    paddingHorizontal: 12,
    backgroundColor: COLORS.surfaceContainerLowest,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  selectValue: {
    flex: 1,
    color: COLORS.onSurface,
    fontFamily: FONT.publicSansRegular,
  },
  dropdownMenu: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 50,
    borderRadius: Radius.base,
    paddingVertical: 4,
    zIndex: 10,
    shadowColor: '#000000',
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  dropdownOption: {
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  dropdownOptionPressed: {
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  dropdownOptionText: {
    color: COLORS.onSurface,
    fontFamily: FONT.publicSansRegular,
  },
  addBuyerPanel: {
    padding: 10,
    gap: 8,
    borderRadius: Radius.container,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  inlineInput: {
    minHeight: 40,
    paddingHorizontal: 10,
    borderRadius: Radius.base,
    backgroundColor: COLORS.surfaceContainerLowest,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FONT.publicSansRegular,
  },
  addBuyerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  smallAction: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: Radius.base,
    justifyContent: 'center',
    backgroundColor: COLORS.secondaryContainer,
  },
  smallActionMuted: {
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  inputWithSuffix: {
    minHeight: 48,
    borderRadius: Radius.base,
    backgroundColor: COLORS.surfaceContainerLowest,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  largeInput: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    fontFamily: FONT.publicSansSemiBold,
  },
  inputSuffix: {
    paddingHorizontal: 12,
    fontFamily: FONT.publicSansMedium,
  },
  sellAllAction: {
    minHeight: 26,
    paddingHorizontal: 8,
    borderRadius: Radius.base,
    backgroundColor: COLORS.surfaceContainerHigh,
    justifyContent: 'center',
  },
  sellAllText: {
    color: COLORS.onSurface,
    fontFamily: FONT.publicSansSemiBold,
  },
  presetGrid: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  presetButton: {
    flex: 1,
    minHeight: 32,
    borderRadius: Radius.base,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  presetButtonSelected: {
    backgroundColor: COLORS.primaryFixed,
  },
  presetText: {
    color: COLORS.onSurfaceVariant,
    fontFamily: FONT.publicSansMedium,
  },
  presetTextSelected: {
    color: COLORS.onPrimaryFixed,
    fontFamily: FONT.publicSansSemiBold,
  },
  marketHint: {
    color: COLORS.secondary,
    fontFamily: FONT.publicSansSemiBold,
    flexShrink: 0,
  },
  marketHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
  },
  validationHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  validationHintText: {
    flex: 1,
  },
  inlineEmphasis: {
    color: COLORS.secondary,
    fontFamily: FONT.publicSansSemiBold,
  },
  compactRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  compactField: {
    flex: 1,
    gap: 4,
  },
  compactLabel: {
    fontFamily: FONT.publicSansMedium,
  },
  compactInputWrap: {
    position: 'relative',
  },
  compactInput: {
    minHeight: 44,
    paddingHorizontal: 8,
    borderRadius: Radius.base,
    backgroundColor: COLORS.surfaceContainerLowest,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FONT.publicSansRegular,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  compactInputWithSuffix: {
    paddingRight: 28,
  },
  compactSuffix: {
    position: 'absolute',
    right: 8,
    top: 13,
  },
  noteInput: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: Radius.base,
    backgroundColor: COLORS.surfaceContainerLowest,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FONT.publicSansRegular,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  profitCard: {
    borderRadius: Radius.container,
    padding: Spacing.three,
    gap: 12,
    marginTop: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  profitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  liveLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: COLORS.secondary,
  },
  uppercaseLabel: {
    textTransform: 'uppercase',
    fontFamily: FONT.publicSansSemiBold,
  },
  marginBadge: {
    borderRadius: Radius.sheet,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: 'hidden',
    fontFamily: FONT.publicSansBold,
  },
  marginBadgePositive: {
    color: COLORS.onSecondary,
    backgroundColor: COLORS.secondary,
  },
  marginBadgeNegative: {
    color: COLORS.onError,
    backgroundColor: COLORS.error,
  },
  breakdown: {
    gap: 8,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  metricLabelWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  metricLabel: {
    flex: 1,
  },
  metricValue: {
    color: COLORS.onSurface,
    fontFamily: FONT.publicSansSemiBold,
    textAlign: 'right',
  },
  netProfitInset: {
    minHeight: 76,
    borderRadius: Radius.base,
    padding: 12,
    backgroundColor: COLORS.surfaceContainerLowest,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  netProfitCopy: {
    flex: 1,
    gap: 2,
  },
  netProfitLabel: {
    color: COLORS.secondary,
    textTransform: 'uppercase',
    fontFamily: FONT.publicSansBold,
  },
  netProfitValue: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  profitPositive: {
    color: COLORS.secondary,
    fontFamily: FONT.publicSansBold,
  },
  profitNegative: {
    color: COLORS.error,
    fontFamily: FONT.publicSansBold,
  },
  unitProfitPositive: {
    color: COLORS.onSecondaryContainer,
    backgroundColor: COLORS.secondaryContainer,
    borderRadius: Radius.base,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontFamily: FONT.publicSansSemiBold,
  },
  unitProfitNegative: {
    color: COLORS.onErrorContainer,
    backgroundColor: COLORS.errorContainer,
    borderRadius: Radius.base,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontFamily: FONT.publicSansSemiBold,
  },
  stockProjection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  stockProjectionText: {
    flex: 1,
  },
  errorText: {
    color: COLORS.error,
    fontFamily: FONT.publicSansSemiBold,
  },
  primaryActionGroup: {
    gap: 8,
    marginTop: 4,
  },
  submitButton: {
    minHeight: 56,
    borderRadius: Radius.container,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.22,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  submitPressed: {
    transform: [{ scale: 0.99 }],
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: COLORS.onPrimary,
    fontFamily: FONT.publicSansBold,
  },
  submitHelper: {
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  helperWeight: {
    color: COLORS.onSurface,
    fontFamily: FONT.publicSansSemiBold,
  },
  transparencyCard: {
    borderRadius: Radius.container,
    padding: Spacing.three,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transparencyIconWell: {
    width: 48,
    height: 48,
    borderRadius: Radius.base,
    backgroundColor: COLORS.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  transparencyCopy: {
    flex: 1,
    gap: 2,
  },
  transparencyTitle: {
    color: COLORS.onSurface,
    fontFamily: FONT.publicSansSemiBold,
  },
  savedJournalSection: {
    gap: 8,
    marginTop: 24,
  },
  savedJournalTitle: {
    color: COLORS.onSurface,
    fontFamily: FONT.publicSansSemiBold,
  },
  summaryCard: {
    borderRadius: Radius.container,
    padding: Spacing.three,
    gap: 2,
  },
  entryCard: {
    borderRadius: Radius.container,
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  entryCopy: {
    flex: 1,
    gap: 2,
  },
  removeAction: {
    minHeight: 32,
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  toastPosition: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 32,
    zIndex: 50,
  },
  toast: {
    minHeight: 64,
    borderRadius: Radius.container,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  toastCopy: {
    flex: 1,
    gap: 2,
  },
  toastTitle: {
    color: COLORS.onPrimary,
    fontFamily: FONT.publicSansBold,
  },
  toastBody: {
    color: COLORS.onPrimaryContainer,
  },
  pressed: {
    opacity: 0.75,
  },
});
