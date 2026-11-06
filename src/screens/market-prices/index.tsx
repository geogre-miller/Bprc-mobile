import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { ThemedText } from '@/components/themed-text';
import { BottomSheet, SheetOption, SheetOptions, SheetResetOption } from '@/components/ui/bottom-sheet';
import { Chip } from '@/components/ui/chip';
import { ThemedTextInput } from '@/components/themed-text-input';
import { BottomTabInset, LightPalette, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Icon } from '@/screens/home-dashboard/icons';

import { MarketPriceRow, type MarketPriceRowData } from './market-price-row';

type SortKey = 'featured' | 'name' | 'price';
type SheetKind = 'product' | 'region' | 'advanced';

const SCREEN_COLORS = LightPalette;

const MARKET_ROWS: MarketPriceRowData[] = [
  {
    id: 'coffee',
    href: 'coffee',
    label: 'Cà phê Robusta',
    detail: 'Nhân xô • Đắk Lắk',
    updatedLabel: '10 phút trước',
    price: 118500,
    changeAmount: 3200,
    changePercent: 2.8,
    badge: 'Đỉnh 30 ngày',
  },
  {
    id: 'coffee-arabica',
    label: 'Cà phê Arabica',
    detail: 'Lâm Đồng',
    updatedLabel: '25 phút trước',
    price: 135000,
    changeAmount: 2000,
    changePercent: 1.5,
  },
  {
    id: 'pepper',
    href: 'pepper',
    label: 'Tiêu đen',
    detail: 'Chư Sê • Gia Lai',
    updatedLabel: '1 giờ trước',
    price: 148000,
    changeAmount: 2000,
    changePercent: 1.4,
  },
  {
    id: 'durian-ri6',
    label: 'Sầu riêng Ri6',
    detail: 'Loại 1 • Xuất khẩu',
    updatedLabel: '35 phút trước',
    price: 88000,
    changeAmount: -2000,
    changePercent: -2.2,
  },
  {
    id: 'durian-monthong',
    label: 'Sầu Monthong',
    detail: 'Dona Tây Nguyên',
    updatedLabel: '45 phút trước',
    price: 105000,
    changeAmount: -2000,
    changePercent: -1.9,
  },
  {
    id: 'rice-st25',
    label: 'Lúa khô ST25',
    detail: 'Sóc Trăng',
    updatedLabel: '2 giờ trước',
    price: 11500,
    changePercent: 0,
  },
  {
    id: 'cashew-fresh',
    href: 'cashew',
    label: 'Hạt điều tươi',
    detail: 'Bình Phước',
    updatedLabel: '3 giờ trước',
    price: 32500,
    changeAmount: 1000,
    changePercent: 3.1,
  },
  {
    id: 'corn-dried',
    label: 'Bắp khô (Ngô)',
    detail: 'Nông trại',
    updatedLabel: '4 giờ trước',
    price: 7200,
    changeAmount: -100,
    changePercent: -1.4,
  },
];


const PRODUCT_OPTIONS = [
  ['all', 'Tất cả mặt hàng'],
  ['coffee', 'Cà phê Robusta'],
  ['pepper', 'Tiêu đen'],
  ['durian', 'Sầu riêng'],
] as const;

const REGION_OPTIONS = [
  ['all', 'Tất cả khu vực'],
  ['Đắk Lắk', 'Khu vực: Đắk Lắk'],
  ['Tây Nguyên', 'Khu vực: Tây Nguyên'],
] as const;

function FilterSheet({
  kind,
  productFilter,
  regionFilter,
  verifiedOnly,
  gainersOnly,
  onClose,
  onProductChange,
  onRegionChange,
  onVerifiedChange,
  onGainersChange,
}: {
  kind: SheetKind;
  productFilter: string | null;
  regionFilter: string | null;
  verifiedOnly: boolean;
  gainersOnly: boolean;
  onClose: () => void;
  onProductChange: (value: string | null) => void;
  onRegionChange: (value: string | null) => void;
  onVerifiedChange: (value: boolean) => void;
  onGainersChange: (value: boolean) => void;
}) {
  const title = kind === 'product' ? 'Chọn mặt hàng' : kind === 'region' ? 'Chọn khu vực' : 'Bộ lọc chuyên sâu';

  return (
    <BottomSheet title={title} closeLabel="Đóng bộ lọc" onClose={onClose}>
      {kind === 'product' && (
        <SheetOptions>
          {PRODUCT_OPTIONS.map(([value, label]) => (
            <SheetOption
              key={value}
              label={label}
              selected={value === 'all' ? productFilter == null : productFilter === value}
              onPress={() => {
                onProductChange(value === 'all' ? null : value);
                onClose();
              }}
            />
          ))}
        </SheetOptions>
      )}

      {kind === 'region' && (
        <SheetOptions>
          {REGION_OPTIONS.map(([value, label]) => (
            <SheetOption
              key={value}
              label={label}
              selected={value === 'all' ? regionFilter == null : regionFilter === value}
              onPress={() => {
                onRegionChange(value === 'all' ? null : value);
                onClose();
              }}
            />
          ))}
        </SheetOptions>
      )}

      {kind === 'advanced' && (
        <SheetOptions>
          <SheetOption icon="check_circle" label="Đã xác thực" selected={verifiedOnly} onPress={() => onVerifiedChange(!verifiedOnly)} />
          <SheetOption icon="trending_up" label="Tăng nhiều nhất" selected={gainersOnly} onPress={() => onGainersChange(!gainersOnly)} />
          <SheetResetOption
            label="Xóa tất cả bộ lọc"
            onPress={() => {
              onProductChange(null);
              onRegionChange(null);
              onVerifiedChange(false);
              onGainersChange(false);
              onClose();
            }}
          />
        </SheetOptions>
      )}
    </BottomSheet>
  );
}

/** Native simulator implementation of the Stitch Market Prices screen. */
export function MarketPrices() {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('featured');
  const [descending, setDescending] = useState(true);
  const [sheet, setSheet] = useState<SheetKind | null>(null);
  const [productFilter, setProductFilter] = useState<string | null>(null);
  const [regionFilter, setRegionFilter] = useState<string | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [gainersOnly, setGainersOnly] = useState(false);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = MARKET_ROWS.filter((row) => {
      const matchesSearch = !needle || `${row.label} ${row.detail}`.toLowerCase().includes(needle);
      const matchesProduct =
        productFilter == null ||
        (productFilter === 'coffee' && row.id.startsWith('coffee')) ||
        (productFilter === 'pepper' && row.id === 'pepper') ||
        (productFilter === 'durian' && row.id.startsWith('durian'));
      const matchesRegion =
        regionFilter == null ||
        (regionFilter === 'Đắk Lắk' && row.detail.includes('Đắk Lắk')) ||
        (regionFilter === 'Tây Nguyên' && (row.detail.includes('Tây Nguyên') || row.detail.includes('Đắk Lắk')));
      const matchesVerified = !verifiedOnly || row.id !== 'corn-dried';
      const matchesGainers = !gainersOnly || row.changePercent > 0;
      return matchesSearch && matchesProduct && matchesRegion && matchesVerified && matchesGainers;
    });

    if (sortKey === 'featured') return filtered;
    const direction = descending ? -1 : 1;
    return [...filtered].sort((a, b) =>
      sortKey === 'name' ? direction * a.label.localeCompare(b.label, 'vi') : direction * (a.price - b.price),
    );
  }, [descending, gainersOnly, productFilter, query, regionFilter, sortKey, verifiedOnly]);

  function toggleSort(key: Exclude<SortKey, 'featured'>) {
    if (key === sortKey) setDescending((value) => !value);
    else {
      setSortKey(key);
      setDescending(true);
    }
  }

  const filtersActive =
    query.length > 0 || productFilter != null || regionFilter != null || verifiedOnly || gainersOnly;
  const productFilterLabel =
    productFilter === 'pepper' ? 'Tiêu đen' : productFilter === 'durian' ? 'Sầu riêng' : 'Cà phê Robusta';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: SCREEN_COLORS.background }]} edges={['top']}>
      <AppHeader />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.searchRow}>
          <View style={[styles.searchField, { borderColor: theme.border, backgroundColor: SCREEN_COLORS.surface }]}>
            <Icon name="search" size={20} color={SCREEN_COLORS.outline} />
            <ThemedTextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Tìm cà phê, tiêu, lúa, sầu riêng..."
              placeholderTextColor={SCREEN_COLORS.outline}
              accessibilityLabel="Tìm kiếm mặt hàng"
              returnKeyType="search"
              style={[styles.searchInput, { color: SCREEN_COLORS.text }]}
            />
            {query.length > 0 && (
              <Pressable accessibilityLabel="Xóa tìm kiếm" onPress={() => setQuery('')} style={styles.clearButton}>
                <Icon name="close" size={16} color={SCREEN_COLORS.textMuted} />
              </Pressable>
            )}
          </View>
          <Pressable accessibilityLabel="Bộ lọc chuyên sâu" onPress={() => setSheet('advanced')}>
            <View style={[styles.filterButton, { backgroundColor: SCREEN_COLORS.surface }]}>
              <Icon name="tune" size={20} color={filtersActive ? SCREEN_COLORS.secondary : SCREEN_COLORS.textMuted} />
              <View style={[styles.filterDot, { opacity: filtersActive ? 1 : 0.8 }]} />
            </View>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          style={styles.filterScroll}>
          <Chip dropdown selected label={productFilterLabel} onPress={() => setSheet('product')} />
          <Chip
            dropdown
            selected={regionFilter != null}
            label={regionFilter ? `Khu vực: ${regionFilter}` : 'Khu vực: Đắk Lắk'}
            onPress={() => setSheet('region')}
          />
          <Chip
            icon="check_circle"
            selected={verifiedOnly}
            label="Đã xác thực"
            onPress={() => setVerifiedOnly((value) => !value)}
          />
          <Chip
            icon="trending_up"
            selected={gainersOnly}
            label="Tăng nhiều nhất"
            onPress={() => setGainersOnly((value) => !value)}
          />
        </ScrollView>

        <View style={[styles.bulletin, { backgroundColor: SCREEN_COLORS.primaryContainer }]}>
          <Icon name="trending_up" size={20} color={SCREEN_COLORS.secondaryContainer} />
          <ThemedText type="bodySm" numberOfLines={1} style={styles.bulletinText}>
            <ThemedText type="bodySm" style={{ color: SCREEN_COLORS.secondaryContainer, fontWeight: '700' }}>
              18 tăng
            </ThemedText>
            <ThemedText type="bodySm" style={{ color: SCREEN_COLORS.lossContainer }}>
              {' • 4 giảm'}
            </ThemedText>
            <ThemedText type="bodySm" style={{ color: SCREEN_COLORS.onPrimary }}>
              {' • Cập nhật lúc 08:30'}
            </ThemedText>
          </ThemedText>
          <View style={styles.liveDot} />
        </View>

        <View style={[styles.table, { borderColor: theme.border }]}>
          <View style={[styles.tableHead, { backgroundColor: SCREEN_COLORS.surfaceLow }]}>
            <Pressable style={styles.headName} onPress={() => toggleSort('name')}>
              <ThemedText type="labelSm" style={{ color: SCREEN_COLORS.textMuted }}>
                MẶT HÀNG
              </ThemedText>
              <Icon name="swap_vert" size={14} color={SCREEN_COLORS.textMuted} />
            </Pressable>
            <Pressable style={styles.headPrice} onPress={() => toggleSort('price')}>
              <ThemedText type="labelSm" style={{ color: SCREEN_COLORS.textMuted }}>
                GIÁ (₫/KG)
              </ThemedText>
              <Icon name="swap_vert" size={14} color={SCREEN_COLORS.textMuted} />
            </Pressable>
            <ThemedText type="labelSm" style={[styles.headTrend, { color: SCREEN_COLORS.textMuted }]}>
              24H / XU HƯỚNG
            </ThemedText>
          </View>

          {rows.length === 0 ? (
            <ThemedText type="bodySm" style={[styles.empty, { color: SCREEN_COLORS.textMuted }]}>
              Không có mặt hàng nào khớp bộ lọc.
            </ThemedText>
          ) : (
            rows.map((row, index) => (
              <View
                key={row.id}
                style={index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.borderSubtle }}>
                <MarketPriceRow row={row} />
              </View>
            ))
          )}
        </View>

        <View style={[styles.insight, { backgroundColor: SCREEN_COLORS.surfaceLow }]}>
          <View style={styles.insightIcon}>
            <Icon name="psychology" size={24} color={SCREEN_COLORS.secondary} />
          </View>
          <View style={styles.insightBody}>
            <ThemedText type="titleMd" style={{ color: SCREEN_COLORS.primary }}>
              Nhận định vụ thu hoạch
            </ThemedText>
            <ThemedText type="bodySm" style={{ color: SCREEN_COLORS.textMuted }}>
              Cà phê Tây Nguyên duy trì đà tăng do nguồn cung hạn chế tại các đại lý. Nông dân nên cân nhắc chốt lời từng phần.
            </ThemedText>
          </View>
        </View>

        <Link href="/alerts" asChild>
          <Pressable style={styles.ctaWrapper} accessibilityLabel="Đặt cảnh báo giá">
            <View style={[styles.cta, { backgroundColor: SCREEN_COLORS.primary }]}>
              <View style={[styles.ctaIcon, { backgroundColor: SCREEN_COLORS.primaryContainer }]}>
                <Icon name="notification_important" size={20} color={SCREEN_COLORS.secondaryContainer} />
              </View>
              <View style={styles.ctaBody}>
                <ThemedText type="labelSm" style={{ color: SCREEN_COLORS.secondaryContainer }}>
                  CẢNH BÁO TỰ ĐỘNG
                </ThemedText>
                <ThemedText type="bodySm" numberOfLines={1} style={{ color: SCREEN_COLORS.onPrimary }}>
                  Báo khi Cà phê chạm 120,000 ₫/kg
                </ThemedText>
              </View>
              <View style={[styles.ctaButton, { backgroundColor: SCREEN_COLORS.secondary }]}>
                <ThemedText type="labelMd" style={{ color: SCREEN_COLORS.onPrimary }}>
                  Đặt báo
                </ThemedText>
                <Icon name="chevron_right" size={16} color={SCREEN_COLORS.onPrimary} />
              </View>
            </View>
          </Pressable>
        </Link>
      </ScrollView>

      {sheet && (
        <FilterSheet
          kind={sheet}
          productFilter={productFilter}
          regionFilter={regionFilter}
          verifiedOnly={verifiedOnly}
          gainersOnly={gainersOnly}
          onClose={() => setSheet(null)}
          onProductChange={setProductFilter}
          onRegionChange={setRegionFilter}
          onVerifiedChange={setVerifiedOnly}
          onGainersChange={setGainersOnly}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    gap: 12,
    paddingHorizontal: Spacing.three,
    paddingTop: 16,
    // Keep the in-flow alert card clear of the translucent native tab bar at scroll end.
    paddingBottom: BottomTabInset + Spacing.six + Spacing.three,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    height: 44,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: Radius.container,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  clearButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.container,
    shadowColor: SCREEN_COLORS.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  filterDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: Radius.full,
    backgroundColor: SCREEN_COLORS.secondary,
  },
  filterScroll: {
    marginHorizontal: -Spacing.three,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.three,
    paddingBottom: 2,
  },
  bulletin: {
    height: 48,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.container,
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  bulletinText: {
    flex: 1,
    color: SCREEN_COLORS.onPrimary,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: SCREEN_COLORS.secondaryContainer,
  },
  table: {
    backgroundColor: SCREEN_COLORS.surface,
    borderWidth: 1,
    borderRadius: Radius.container,
    overflow: 'hidden',
  },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
  },
  headName: {
    flex: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  headPrice: {
    flex: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.one,
  },
  headTrend: {
    flex: 3,
    textAlign: 'right',
  },
  empty: {
    padding: Spacing.three,
    textAlign: 'center',
  },
  insight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: Radius.container,
    padding: Spacing.three,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SCREEN_COLORS.secondaryContainer,
  },
  insightBody: {
    flex: 1,
    gap: Spacing.half,
  },
  ctaWrapper: {
    width: '100%',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: Radius.container,
    padding: 12,
  },
  ctaIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.container,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBody: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderRadius: Radius.container,
    paddingHorizontal: 16,
    paddingVertical: Spacing.two,
  },
});
