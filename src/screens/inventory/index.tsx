import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LightPalette, Radius, Spacing } from '@/constants/theme';
import { COMMODITIES, latestObservation } from '@/data/mock-data';
import { usePersistedState } from '@/hooks/use-persisted-state';
import { useTheme } from '@/hooks/use-theme';
import type { FarmerInventoryItem } from '@/types/domain';
import { formatVnd } from '@/utils/format-price';

import { Icon, type IconName } from '../home-dashboard/icons';

const COLORS = LightPalette;

const FONT = {
  manropeSemiBold: 'InventoryManropeSemiBold',
  publicSansRegular: 'InventoryPublicSansRegular',
  publicSansMedium: 'InventoryPublicSansMedium',
  publicSansSemiBold: 'InventoryPublicSansSemiBold',
  publicSansBold: 'InventoryPublicSansBold',
} as const;

const fontMap = {
  [FONT.manropeSemiBold]: require('../../../assets/fonts/Manrope-SemiBold.ttf'),
  [FONT.publicSansRegular]: require('../../../assets/fonts/PublicSans-Regular.ttf'),
  [FONT.publicSansMedium]: require('../../../assets/fonts/PublicSans-Medium.ttf'),
  [FONT.publicSansSemiBold]: require('../../../assets/fonts/PublicSans-SemiBold.ttf'),
  [FONT.publicSansBold]: require('../../../assets/fonts/PublicSans-Bold.ttf'),
};

const THUMBNAILS = {
  coffee: 'data:image/jpeg;base64,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',
  pepper: 'data:image/jpeg;base64,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',
  durian: 'data:image/jpeg;base64,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',
  rice: 'data:image/jpeg;base64,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',
} as const;

type ExtraIconName = 'point_of_sale' | 'add_box' | 'nest_eco_leaf';
type ScreenIconName = IconName | ExtraIconName;

const EXTRA_ICONS = {
  point_of_sale: { ios: 'cart.fill', other: 'point_of_sale' },
  add_box: { ios: 'shippingbox.fill', other: 'add_box' },
  nest_eco_leaf: { ios: 'leaf.fill', other: 'nest_eco_leaf' },
} as const;

function ScreenIcon({ name, size = 18, color }: { name: ScreenIconName; size?: number; color: string }) {
  if (name in EXTRA_ICONS) {
    const icon = EXTRA_ICONS[name as ExtraIconName];
    return <IconFallback name={icon} size={size} color={color} />;
  }

  return <Icon name={name as IconName} size={size} color={color} />;
}

function IconFallback({
  name,
  size,
  color,
}: {
  name: (typeof EXTRA_ICONS)[ExtraIconName];
  size: number;
  color: string;
}) {
  return <SymbolView name={{ ios: name.ios, android: name.other, web: name.other }} size={size} tintColor={color} />;
}

const DEFAULT_ITEMS: FarmerInventoryItem[] = [
  { commodity: 'coffee', quantity: 2500, unit: 'kg' },
  { commodity: 'pepper', quantity: 800, unit: 'kg' },
  { commodity: 'fruit', quantity: 1200, unit: 'kg' },
  { commodity: 'rice', quantity: 5000, unit: 'kg' },
];

type ItemPresentation = {
  id: string;
  name: string;
  chip: string;
  chipSurface?: string;
  chipText?: string;
  detail: string;
  costLabel: string;
  costPerUnit: number;
  marketLabel: string;
  marketPrice: number;
  change: string;
  changeDirection: 'up' | 'down' | 'flat';
  currentLabel: string;
  pnlPercent: string;
  thumbnail: ImageSourcePropType;
};

const PRESENTATIONS: ItemPresentation[] = [
  {
    id: 'robusta',
    name: 'Cà phê Robusta',
    chip: 'Niên vụ 2023 - 2024',
    detail: 'Nhân xô',
    costLabel: 'Giá vốn nhập/sản xuất',
    costPerUnit: 78000,
    marketLabel: 'Giá thị trường hôm nay',
    marketPrice: 118500,
    change: '▲ 2.8%',
    changeDirection: 'up',
    currentLabel: 'Hiện tại',
    pnlPercent: '(+51.9%)',
    thumbnail: { uri: THUMBNAILS.coffee },
  },
  {
    id: 'black-pepper',
    name: 'Tiêu đen khô',
    chip: 'Chư Sê',
    detail: '16 bao 50kg',
    costLabel: 'Giá vốn đầu tư',
    costPerUnit: 110000,
    marketLabel: 'Giá thị trường hôm nay',
    marketPrice: 148000,
    change: '▲ 1.4%',
    changeDirection: 'up',
    currentLabel: 'Hiện tại',
    pnlPercent: '(+34.5%)',
    thumbnail: { uri: THUMBNAILS.pepper },
  },
  {
    id: 'durian-ri6',
    name: 'Sầu riêng Ri6',
    chip: 'Thu hoạch đợt 2',
    chipSurface: COLORS.tertiaryFixed,
    chipText: COLORS.onTertiaryFixed,
    detail: 'Cơm vàng hạt lép',
    costLabel: 'Giá vốn sản xuất',
    costPerUnit: 65000,
    marketLabel: 'Giá thị trường hôm nay',
    marketPrice: 88000,
    change: '▼ 2.2%',
    changeDirection: 'down',
    currentLabel: 'Hiện tại',
    pnlPercent: '(+35.4%)',
    thumbnail: { uri: THUMBNAILS.durian },
  },
  {
    id: 'rice-st25',
    name: 'Lúa khô ST25',
    chip: 'Đang giữ giá',
    detail: 'Lưu kho an toàn',
    costLabel: 'Giá vốn thu mua',
    costPerUnit: 10200,
    marketLabel: 'Giá thị trường hôm nay',
    marketPrice: 11500,
    change: '▬ 0.0%',
    changeDirection: 'flat',
    currentLabel: 'Hiện tại',
    pnlPercent: '(+12.7%)',
    thumbnail: { uri: THUMBNAILS.rice },
  },
];

function formatQuantity(value: number) {
  return value.toLocaleString('en-US');
}

function formatVndPerKg(value: number) {
  return formatVnd(value) + '/kg';
}

function formatPnl(value: number, cost: number) {
  const percent = cost ? ((value / cost) * 100).toFixed(1) : '0.0';
  return {
    amount: (value >= 0 ? '+' : '') + formatVnd(value),
    percent: '(' + (value >= 0 ? '+' : '') + percent + '%)',
  };
}

function formatSignedVnd(value: number) {
  return (value >= 0 ? '+' : '') + formatVnd(value);
}

function formatPercent(value: number, base: number) {
  return (value >= 0 ? '+' : '') + (base ? ((value / base) * 100).toFixed(1) : '0.0') + '%';
}

type InventoryCardProps = {
  item: FarmerInventoryItem;
  index: number;
  presentation: ItemPresentation;
  onEdit: (index: number) => void;
  onSell: (index: number) => void;
};

function InventoryCard({ item, index, presentation, onEdit, onSell }: InventoryCardProps) {
  const cost = presentation.costPerUnit * item.quantity;
  const current = presentation.marketPrice * item.quantity;
  const pnl = formatPnl(current - cost, cost);
  const changeColor =
    presentation.changeDirection === 'down'
      ? COLORS.error
      : presentation.changeDirection === 'flat'
        ? COLORS.outline
        : COLORS.secondary;

  return (
    <ThemedView style={styles.inventoryCard}>
      <View style={styles.cardTopRow}>
        <Image
          accessibilityLabel={'Ảnh ' + presentation.name}
          source={presentation.thumbnail}
          resizeMode="cover"
          style={styles.thumbnail}
        />
        <View style={styles.cardCopy}>
          <ThemedText type="titleMd" style={styles.itemName} numberOfLines={1}>
            {presentation.name}
          </ThemedText>
          <View style={styles.metadataRow}>
            <ThemedText
              type="labelSm"
              style={[
                styles.chipText,
                {
                  backgroundColor: presentation.chipSurface ?? COLORS.secondaryContainer,
                  color: presentation.chipText ?? COLORS.onSecondaryContainer,
                },
              ]}>
              {presentation.chip}
            </ThemedText>
            <ThemedText type="bodySm" style={styles.detailText} numberOfLines={1}>
              • {presentation.detail}
            </ThemedText>
          </View>
        </View>
        <View style={styles.quantityColumn}>
          <ThemedText type="labelSm" style={styles.quantityLabel}>
            Khối lượng cân
          </ThemedText>
          <ThemedText type="numericLg" style={styles.quantityValue} numberOfLines={1}>
            {formatQuantity(item.quantity)} {item.unit}
          </ThemedText>
        </View>
      </View>

      <View style={styles.financialStrip}>
        <View style={styles.financialColumn}>
          <ThemedText type="bodySm" style={styles.financialLabel} numberOfLines={1}>
            {presentation.costLabel}
          </ThemedText>
          <ThemedText type="labelMd" style={styles.financialValue} numberOfLines={1}>
            {formatVndPerKg(presentation.costPerUnit)}
          </ThemedText>
          <ThemedText type="bodySm" style={styles.financialNote} numberOfLines={1}>
            Vốn: {formatVnd(cost)}
          </ThemedText>
        </View>
        <View style={[styles.financialColumn, styles.marketColumn]}>
          <ThemedText type="bodySm" style={styles.financialLabel} numberOfLines={1}>
            {presentation.marketLabel}
          </ThemedText>
          <View style={styles.marketValueRow}>
            <ThemedText type="labelMd" style={styles.financialValue} numberOfLines={1}>
              {formatVndPerKg(presentation.marketPrice)}
            </ThemedText>
            <ThemedText type="labelSm" style={[styles.changeText, { color: changeColor }]}>
              {presentation.change}
            </ThemedText>
          </View>
          <ThemedText type="bodySm" style={styles.financialNote} numberOfLines={1}>
            {presentation.currentLabel}: {formatVnd(current)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.pnlBadge}>
          <ScreenIcon name="trending_up" size={16} color={COLORS.onSecondaryContainer} />
          <ThemedText type="labelSm" style={styles.pnlText} numberOfLines={1}>
            {pnl.amount} {pnl.percent}
          </ThemedText>
        </View>
        <View style={styles.cardActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={'Sửa số cân ' + presentation.name}
            onPress={() => onEdit(index)}
            style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}>
            <ThemedText type="labelMd" style={styles.editText}>
              Sửa số cân
            </ThemedText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={'Bán lô này ' + presentation.name}
            onPress={() => onSell(index)}
            style={({ pressed }) => [styles.sellButton, pressed && styles.actionPressed]}>
            <ThemedText type="labelMd" style={styles.sellText}>
              Bán lô này
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
}

function SectionCard({ children }: { children: ReactNode }) {
  return <View style={styles.sectionCard}>{children}</View>;
}

export function Inventory() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [fontsLoaded, fontError] = useFonts(fontMap);
  const [items, setItems, isLoaded] = usePersistedState<FarmerInventoryItem[]>('inventory', DEFAULT_ITEMS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const presentationItems = useMemo(
    () =>
      items.map((item, index) => {
        const base = PRESENTATIONS[index % PRESENTATIONS.length];
        const latestPrice = latestObservation(item.commodity)?.pricePerUnit;
        return {
          ...base,
          name: index < PRESENTATIONS.length ? base.name : COMMODITIES.find((option) => option.id === item.commodity)?.label ?? base.name,
          marketPrice: latestPrice ?? base.marketPrice,
          thumbnail: base.thumbnail,
        };
      }),
    [items],
  );

  const valuation = useMemo(() => {
    return presentationItems.reduce(
      (totals, presentation, index) => {
        const quantity = items[index]?.quantity ?? 0;
        const capital = presentation.costPerUnit * quantity;
        const current = presentation.marketPrice * quantity;
        totals.current += current;
        totals.capital += capital;
        return totals;
      },
      { current: 0, capital: 0 },
    );
  }, [items, presentationItems]);

  const showFeedback = (message: string) => setFeedback(message);

  const updateItem = (index: number, quantity: number) => {
    setItems((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, quantity } : item)));
  };

  const editItem = (index: number) => {
    const current = items[index];
    if (!current) return;
    const next = Math.max(0, current.quantity);
    updateItem(index, next);
    showFeedback('Đã sẵn sàng chỉnh sửa số cân.');
  };

  const sellItem = (index: number) => {
    const current = items[index];
    if (!current) return;
    showFeedback('Đã chọn lô ' + (presentationItems[index]?.name ?? 'hàng hóa') + ' để bán.');
  };

  const recordSale = () => {
    router.navigate('/journal');
  };

  const addStock = () => {
    showFeedback('Đã chọn nhập kho mới.');
  };

  if (!fontsLoaded && !fontError) {
    return <ThemedView style={[styles.screen, { backgroundColor: theme.background }]} />;
  }

  if (!isLoaded) {
    return <ThemedView style={[styles.screen, { backgroundColor: theme.background }]} />;
  }

  const totalItems = items.length;
  const statusLabel = totalItems + ' mặt hàng';

  return (
    <ThemedView style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false, title: 'Inventory' }} />

      <View style={[styles.shell, { backgroundColor: COLORS.background }]}>
        <View style={[styles.headerOuter, { paddingTop: insets.top, backgroundColor: COLORS.background }]}>
          <View style={styles.headerInner}>
            <View style={styles.brand}>
              <Image
                accessibilityLabel="Biểu trưng NôngSản Pro"
                source={require('@/assets/images/nongsan-pro-logo.png')}
                resizeMode="contain"
                style={styles.brandLogo}
              />
              <View style={styles.brandCopy}>
                <ThemedText type="titleMd" style={styles.brandTitle} numberOfLines={1}>
                  NôngSản Pro
                </ThemedText>
                <View style={styles.regionRow}>
                  <ScreenIcon name="location_on" size={14} color={COLORS.secondary} />
                  <ThemedText type="labelSm" style={styles.regionText} numberOfLines={1}>
                    Tây Nguyên • Đắk Lắk
                  </ThemedText>
                </View>
              </View>
            </View>
            <View style={styles.headerActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Thông báo"
                onPress={() => router.push('/alerts')}
                style={({ pressed }) => [styles.notificationButton, pressed && styles.pressed]}>
                <ScreenIcon name="notifications" size={22} color={COLORS.onSurfaceVariant} />
                <View style={styles.notificationDot} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Mở trang cá nhân"
                onPress={() => router.push('/account')}
                style={({ pressed }) => [styles.avatarButton, pressed && styles.pressed]}>
                <Image
                  accessibilityLabel="Ảnh đại diện của Chú Năm"
                  source={require('@/assets/images/nongsan-pro-profile.png')}
                  resizeMode="cover"
                  style={styles.headerAvatar}
                />
              </Pressable>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: 112 + insets.bottom }]}
          showsVerticalScrollIndicator={false}>
          <View style={styles.titleMeta}>
            <View style={styles.titleLine}>
              <ThemedText type="subtitle" style={styles.pageTitle} numberOfLines={1}>
                Kho Nông Sản Của Tôi
              </ThemedText>
              <View style={styles.statusCluster}>
                <View style={styles.countDot} />
                <View style={styles.countBadge}>
                  <ThemedText type="labelSm" style={styles.countText}>
                    {statusLabel}
                  </ThemedText>
                </View>
              </View>
            </View>
            <View style={styles.timestampRow}>
              <ScreenIcon name="schedule" size={15} color={COLORS.outline} />
              <ThemedText type="bodySm" style={styles.timestampText} numberOfLines={1}>
                Ước tính theo giá thị trường hôm nay lúc 08:30
              </ThemedText>
            </View>
          </View>

          <SectionCard>
            <View style={styles.decorativeCircle} />
            <View style={styles.valuationHeading}>
              <ScreenIcon name="account_balance_wallet" size={20} color={COLORS.secondary} />
              <ThemedText type="titleMd" style={styles.valuationHeadingText}>
                Tổng giá trị định giá kho
              </ThemedText>
            </View>
            <ThemedText type="numericHero" style={styles.valuationTotal}>
              {formatVnd(valuation.current)}
            </ThemedText>
            <View style={styles.metricPanel}>
              <View style={styles.metricCopy}>
                <ThemedText type="bodySm" style={styles.metricLabel}>
                  Lợi nhuận tạm tính
                </ThemedText>
                <ThemedText type="numericLg" style={styles.metricProfit}>
                  {formatSignedVnd(valuation.current - valuation.capital)}
                </ThemedText>
              </View>
              <View style={styles.changeBadge}>
                <ScreenIcon name="trending_up" size={15} color={COLORS.onSecondaryContainer} />
                <ThemedText type="labelSm" style={styles.changeBadgeText}>
                  {formatPercent(valuation.current - valuation.capital, valuation.capital)}
                </ThemedText>
              </View>
            </View>
            <View style={styles.quickActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ghi nhận bán"
                onPress={recordSale}
                style={({ pressed }) => [styles.quickAction, styles.primaryAction, pressed && styles.actionPressed]}>
                <ScreenIcon name="point_of_sale" size={18} color={COLORS.onPrimary} />
                <ThemedText type="labelMd" style={styles.primaryActionText}>
                  Ghi nhận bán
                </ThemedText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Nhập kho mới"
                onPress={addStock}
                style={({ pressed }) => [styles.quickAction, styles.secondaryAction, pressed && styles.actionPressed]}>
                <ScreenIcon name="add_box" size={18} color={COLORS.secondary} />
                <ThemedText type="labelMd" style={styles.secondaryActionText}>
                  Nhập kho mới
                </ThemedText>
              </Pressable>
            </View>
          </SectionCard>

          <View style={styles.advisory}>
            <View style={styles.advisoryIconWell}>
              <ScreenIcon name="nest_eco_leaf" size={18} color={COLORS.onSecondaryContainer} />
            </View>
            <View style={styles.advisoryCopy}>
              <ThemedText type="titleMd" style={styles.advisoryTitle}>
                Khuyến nghị kỹ thuật kho
              </ThemedText>
              <ThemedText type="bodySm" style={styles.advisoryBody}>
                Độ ẩm kho cà phê hiện tại <ThemedText type="bodySm" style={styles.emphasis}>13.2%</ThemedText> — Đạt chuẩn lưu trữ hạt xô an toàn, không sinh nấm mốc.
              </ThemedText>
            </View>
          </View>

          <View style={styles.inventorySection}>
            <View style={styles.inventorySectionHeader}>
              <ThemedText type="titleMd" style={styles.sectionTitle}>
                Danh mục hàng hóa đang giữ
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Bộ lọc"
                accessibilityState={{ expanded: filterOpen }}
                onPress={() => {
                  setFilterOpen((open) => !open);
                  showFeedback(filterOpen ? 'Đã bỏ bộ lọc.' : 'Đã mở bộ lọc.');
                }}
                style={({ pressed }) => [
                  styles.filterButton,
                  filterOpen && styles.filterButtonActive,
                  pressed && styles.pressed,
                ]}>
                <ScreenIcon name="tune" size={14} color={filterOpen ? COLORS.primaryContainer : COLORS.secondary} />
                <ThemedText type="labelMd" style={styles.filterText}>
                  Bộ lọc
                </ThemedText>
              </Pressable>
            </View>

            <View style={styles.inventoryList}>
              {presentationItems.map((presentation, index) => (
                <InventoryCard
                  key={presentation.id + '-' + index}
                  item={items[index]}
                  index={index}
                  presentation={presentation}
                  onEdit={editItem}
                  onSell={sellItem}
                />
              ))}
            </View>
          </View>

          {feedback ? (
            <ThemedText accessibilityLiveRegion="polite" type="bodySm" style={styles.feedback}>
              {feedback}
            </ThemedText>
          ) : null}

          <ThemedText type="bodySm" style={styles.footnote}>
            Định giá cập nhật tự động từ sàn giao dịch nông sản Tây Nguyên.
          </ThemedText>
        </ScrollView>

      </View>
    </ThemedView>
  );
}

const cardShadow = {
  shadowColor: COLORS.primary,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 4,
  elevation: 1,
} as const;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  shell: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
  },
  headerOuter: {
    zIndex: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  headerInner: {
    height: 64,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexShrink: 1,
  },
  brandLogo: {
    width: 32,
    height: 32,
    borderRadius: 4,
  },
  brandCopy: {
    minWidth: 0,
    flexShrink: 1,
    gap: 0,
  },
  brandTitle: {
    color: COLORS.primary,
    fontFamily: FONT.publicSansSemiBold,
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flexShrink: 1,
  },
  regionText: {
    color: COLORS.onSurfaceVariant,
    fontFamily: FONT.publicSansSemiBold,
    flexShrink: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.container,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceLow,
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
  },
  avatarButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    gap: Spacing.three,
    backgroundColor: COLORS.background,
  },
  titleMeta: {
    paddingHorizontal: 4,
    gap: Spacing.one,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  pageTitle: {
    flexShrink: 1,
    color: COLORS.onSurface,
    fontFamily: FONT.manropeSemiBold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.22,
  },
  statusCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  countDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.secondary,
  },
  countBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: COLORS.secondaryContainer,
  },
  countText: {
    color: COLORS.onSecondaryContainer,
    fontFamily: FONT.publicSansSemiBold,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timestampText: {
    flex: 1,
    color: COLORS.outline,
    fontFamily: FONT.publicSansRegular,
  },
  sectionCard: {
    borderRadius: Radius.container,
    padding: 16,
    gap: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.surfaceLowest,
    ...cardShadow,
  },
  decorativeCircle: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    top: -48,
    right: -36,
    backgroundColor: 'rgba(1,45,29,0.05)',
  },
  valuationHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 1,
  },
  valuationHeadingText: {
    color: COLORS.onSurface,
    fontFamily: FONT.publicSansSemiBold,
  },
  valuationTotal: {
    color: COLORS.primary,
    fontFamily: FONT.publicSansBold,
  },
  metricPanel: {
    minHeight: 64,
    borderRadius: Radius.base,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: COLORS.surfaceLow,
  },
  metricCopy: {
    flex: 1,
    gap: 2,
  },
  metricLabel: {
    color: COLORS.onSurfaceVariant,
    fontFamily: FONT.publicSansRegular,
  },
  metricProfit: {
    color: COLORS.primary,
    fontFamily: FONT.publicSansSemiBold,
  },
  changeBadge: {
    minHeight: 28,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.secondaryContainer,
  },
  changeBadgeText: {
    color: COLORS.onSecondaryContainer,
    fontFamily: FONT.publicSansSemiBold,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  quickAction: {
    flex: 1,
    height: 48,
    borderRadius: Radius.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryAction: {
    backgroundColor: COLORS.primaryContainer,
  },
  secondaryAction: {
    backgroundColor: COLORS.surfaceHigh,
  },
  primaryActionText: {
    color: COLORS.onPrimary,
    fontFamily: FONT.publicSansSemiBold,
  },
  secondaryActionText: {
    color: COLORS.primary,
    fontFamily: FONT.publicSansSemiBold,
  },
  advisory: {
    borderRadius: Radius.base,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: COLORS.surfaceLow,
  },
  advisoryIconWell: {
    width: 32,
    height: 32,
    borderRadius: Radius.base,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondaryContainer,
  },
  advisoryCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  advisoryTitle: {
    color: COLORS.secondary,
    fontFamily: FONT.publicSansSemiBold,
  },
  advisoryBody: {
    color: COLORS.onSurfaceVariant,
    fontFamily: FONT.publicSansRegular,
  },
  emphasis: {
    color: COLORS.secondary,
    fontFamily: FONT.publicSansSemiBold,
  },
  inventorySection: {
    gap: 12,
    paddingTop: 8,
  },
  inventorySectionHeader: {
    minHeight: 24,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sectionTitle: {
    flex: 1,
    color: COLORS.onSurface,
    fontFamily: FONT.publicSansSemiBold,
  },
  filterButton: {
    minHeight: 32,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: Radius.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterButtonActive: {
    backgroundColor: COLORS.secondaryContainer,
  },
  filterText: {
    color: COLORS.secondary,
    fontFamily: FONT.publicSansSemiBold,
  },
  inventoryList: {
    gap: 12,
  },
  inventoryCard: {
    borderRadius: Radius.container,
    padding: 16,
    gap: 12,
    backgroundColor: COLORS.surfaceLowest,
    ...cardShadow,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: Radius.base,
    flexShrink: 0,
  },
  cardCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  itemName: {
    color: COLORS.onSurface,
    fontFamily: FONT.publicSansSemiBold,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  chipText: {
    borderRadius: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexShrink: 1,
    overflow: 'hidden',
    fontFamily: FONT.publicSansSemiBold,
  },
  detailText: {
    flexShrink: 1,
    color: COLORS.onSurfaceVariant,
    fontFamily: FONT.publicSansRegular,
  },
  quantityColumn: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  quantityLabel: {
    color: COLORS.onSurfaceVariant,
    fontFamily: FONT.publicSansSemiBold,
  },
  quantityValue: {
    color: COLORS.primary,
    fontFamily: FONT.publicSansSemiBold,
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  financialStrip: {
    borderRadius: Radius.base,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: COLORS.surfaceLow,
  },
  financialColumn: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  marketColumn: {
    alignItems: 'flex-end',
  },
  financialLabel: {
    color: COLORS.onSurfaceVariant,
    fontFamily: FONT.publicSansRegular,
  },
  financialValue: {
    color: COLORS.primary,
    fontFamily: FONT.publicSansSemiBold,
    fontVariant: ['tabular-nums'],
  },
  financialNote: {
    color: COLORS.onSurfaceVariant,
    fontFamily: FONT.publicSansRegular,
  },
  marketValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    maxWidth: '100%',
  },
  changeText: {
    fontFamily: FONT.publicSansSemiBold,
    fontVariant: ['tabular-nums'],
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 4,
  },
  pnlBadge: {
    maxWidth: '46%',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.secondaryContainer,
  },
  pnlText: {
    color: COLORS.onSecondaryContainer,
    fontFamily: FONT.publicSansSemiBold,
    fontVariant: ['tabular-nums'],
    flexShrink: 1,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  editButton: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  editText: {
    color: COLORS.secondary,
    fontFamily: FONT.publicSansSemiBold,
  },
  sellButton: {
    borderRadius: Radius.base,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: COLORS.primary,
  },
  sellText: {
    color: COLORS.onPrimary,
    fontFamily: FONT.publicSansSemiBold,
  },
  feedback: {
    color: COLORS.secondary,
    fontFamily: FONT.publicSansRegular,
    textAlign: 'center',
  },
  footnote: {
    paddingBottom: 4,
    color: COLORS.outline,
    fontFamily: FONT.publicSansRegular,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.68,
  },
  actionPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
