import { Link } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { BottomSheet, SheetOption, SheetOptions, SheetResetOption } from '@/components/ui/bottom-sheet';
import { Chip } from '@/components/ui/chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { BottomTabInset, LightPalette, Radius } from '@/constants/theme';

import { BUYER_DIRECTORY, type BuyerDirectoryEntry, type BuyerPrice } from '@/data/buyer-directory';

import { Icon } from '../home-dashboard/icons';


const COLORS = LightPalette;

type FilterSheetKind = 'product' | 'radius' | 'advanced';

function FontText({ children, style, type = 'bodySm', ...props }: React.ComponentProps<typeof ThemedText>) {
  return (
    <ThemedText {...props} type={type} style={[{ fontWeight: '400' }, style]}>
      {children}
    </ThemedText>
  );
}


function SafetyTip() {
  return (
    <View style={styles.safetyTip}>
      <View style={styles.safetyIconWell}><Icon name="lightbulb" size={20} color={COLORS.onSecondaryContainer} /></View>
      <View style={styles.safetyCopy}>
        <View style={styles.safetyHeadingRow}>
          <FontText type="labelSm" style={styles.safetyHeading}>Mẹo an toàn thu mua</FontText>
          <FontText type="labelSm" style={styles.safetyDate}>Hôm nay</FontText>
        </View>
        <FontText type="bodySm" style={styles.safetyBody}>Luôn kiểm tra niêm phong cân tải trọng và lập biên bản kiểm tra độ ẩm (kẹp chì/in phiếu cân) ngay tại vườn trước khi xuất kho giao nông sản.</FontText>
      </View>
    </View>
  );
}

function PriceWell({ price }: { price: BuyerPrice }) {
  return (
    <View style={styles.priceWell}>
      <View style={styles.priceLabelRow}>
        <FontText type="labelSm" numberOfLines={2} style={styles.priceLabel}>{price.label}</FontText>
        {price.badge && <FontText type="labelSm" numberOfLines={1} style={styles.priceBadge}>{price.badge}</FontText>}
      </View>
      <View style={styles.priceValueRow}>
        <FontText type="numericLg" style={styles.priceValue}>{price.value}</FontText>
        <FontText type="labelSm" style={styles.priceUnit}>₫/kg</FontText>
      </View>
      <FontText type="labelSm" numberOfLines={1} style={[styles.priceNote, price.noteTone === 'positive' ? styles.positiveText : styles.mutedText]}>{price.note}</FontText>
    </View>
  );
}

function TrustCopy({ text, highlight }: { text: string; highlight?: string }) {
  if (!highlight || !text.includes(highlight)) return <>{text}</>;
  const [before, after] = text.split(highlight);
  return (
    <>
      {before}
      <FontText type="bodySm" style={styles.trustStrong}>{highlight}</FontText>
      {after}
    </>
  );
}

function BuyerCard({ buyer, onQuote }: { buyer: BuyerDirectoryEntry; onQuote: (buyerName: string) => void }) {
  const callBuyer = () => { void Linking.openURL(`tel:${buyer.phone}`).catch(() => undefined); };

  return (
    <View style={styles.buyerCard}>
      <View style={styles.cardTopRow}>
        <View style={styles.cardHeading}>
          <View style={styles.buyerNameRow}>
            <FontText type="titleMd" numberOfLines={1} style={styles.buyerName}>{buyer.name}</FontText>
            <Icon name={buyer.verificationIcon} size={18} color={COLORS.secondary} />
          </View>
          <View style={styles.metadataRow}>
            <View style={styles.ratingRow}><Icon name="star" size={16} color={COLORS.tertiaryCopy} /><FontText type="labelMd" style={styles.ratingText}>{buyer.rating}</FontText></View>
            <FontText type="bodySm" style={styles.metadataSeparator}>•</FontText>
            {buyer.metadata.map((meta, index) => (
              <View key={meta} style={styles.metadataItem}>
                {index > 0 && <FontText type="bodySm" style={styles.metadataSeparator}>•</FontText>}
                <FontText type="bodySm" numberOfLines={1} style={index > 0 ? styles.secondaryMetadata : styles.metadataText}>{meta}</FontText>
              </View>
            ))}
          </View>
        </View>
        <FontText type="labelSm" numberOfLines={2} style={[styles.cardBadge, buyer.badgeTone === 'green' && styles.greenBadge, buyer.badgeTone === 'orange' && styles.orangeBadge, buyer.badgeTone === 'neutral' && styles.neutralBadge]}>{buyer.badge}</FontText>
      </View>

      {buyer.trust && buyer.trustIcon && (
        <View style={styles.trustStrip}>
          <Icon name={buyer.trustIcon} size={18} color={buyer.trustTone === 'orange' ? COLORS.tertiaryCopy : COLORS.secondary} />
          <FontText type="bodySm" numberOfLines={1} style={styles.trustText}>
            <TrustCopy text={buyer.trust ?? ''} highlight={buyer.trustHighlight} />
          </FontText>
        </View>
      )}

      <View style={styles.priceGrid}>{buyer.prices.map((price) => <PriceWell key={price.label} price={price} />)}</View>

      <View style={styles.detailStack}>
        <View style={styles.detailLine}>
          <Icon name={buyer.addressIcon} size={18} color={COLORS.outline} />
          <FontText type="bodySm" numberOfLines={1} style={styles.detailText}>{buyer.address}</FontText>
          <FontText type="bodySm" numberOfLines={1} style={styles.distanceText}>{buyer.distance}</FontText>
        </View>
        <View style={styles.detailLine}>
          <Icon name={buyer.policyIcon} size={18} color={COLORS.secondary} />
          <FontText type="bodySm" numberOfLines={1} style={styles.detailText}>{buyer.policy}</FontText>
        </View>
      </View>

      <View style={styles.ctaGrid}>
        <View style={styles.ctaCell}>
          <Pressable accessibilityRole="button" accessibilityLabel={`Gọi ${buyer.name}`} onPress={callBuyer} style={({ pressed }) => [styles.callButton, pressed && styles.pressed]}>
            <Icon name="call" size={18} color={COLORS.onPrimary} /><FontText type="titleMd" numberOfLines={1} style={styles.callButtonText}>{buyer.callLabel}</FontText>
          </Pressable>
        </View>
        <View style={styles.ctaCell}>
          {buyer.quote ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Gửi báo giá" onPress={() => onQuote(buyer.name)} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
              <Icon name="send" size={18} color={COLORS.onSurface} /><FontText type="titleMd" numberOfLines={1} style={styles.secondaryButtonText}>Gửi báo giá</FontText>
            </Pressable>
          ) : (
            <Link href={{ pathname: '/buyer/[id]', params: { id: buyer.id } }} asChild>
              <Pressable accessibilityRole="button" accessibilityLabel={`Xem chi tiết ${buyer.name}`} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
                <FontText type="titleMd" numberOfLines={1} style={styles.secondaryButtonText}>Xem chi tiết</FontText><Icon name="chevron_right" size={18} color={COLORS.onSurface} />
              </Pressable>
            </Link>
          )}
        </View>
      </View>

    </View>
  );
}

const PRODUCT_OPTIONS = [
  ['all', 'Tất cả mặt hàng'],
  ['coffee', 'Cà phê Robusta'],
  ['pepper', 'Tiêu đen'],
  ['durian', 'Sầu riêng'],
] as const;

const RADIUS_OPTIONS = [
  [null, 'Tất cả khu vực'],
  [15, 'Bán kính: < 15km'],
  [10, 'Bán kính: < 10km'],
] as const;

function FilterSheet({ kind, productFilter, radiusFilter, verifiedOnly, highestPrice, onClose, onProductChange, onRadiusChange, onVerifiedChange, onHighestPriceChange, onReset }: {
  kind: FilterSheetKind;
  productFilter: string | null;
  radiusFilter: number | null;
  verifiedOnly: boolean;
  highestPrice: boolean;
  onClose: () => void;
  onProductChange: (value: string | null) => void;
  onRadiusChange: (value: number | null) => void;
  onVerifiedChange: (value: boolean) => void;
  onHighestPriceChange: (value: boolean) => void;
  onReset: () => void;
}) {
  const title = kind === 'product' ? 'Chọn mặt hàng' : kind === 'radius' ? 'Bán kính thu mua' : 'Bộ lọc chuyên sâu';
  return (
    <BottomSheet title={title} closeLabel="Đóng bộ lọc" onClose={onClose}>
      {kind === 'product' && (
        <SheetOptions>
          {PRODUCT_OPTIONS.map(([value, label]) => (
            <SheetOption
              key={value}
              label={label}
              selected={value === 'all' ? productFilter == null : productFilter === value}
              onPress={() => { onProductChange(value === 'all' ? null : value); onClose(); }}
            />
          ))}
        </SheetOptions>
      )}
      {kind === 'radius' && (
        <SheetOptions>
          {RADIUS_OPTIONS.map(([value, label]) => (
            <SheetOption
              key={String(value)}
              label={label}
              selected={value === radiusFilter}
              onPress={() => { onRadiusChange(value); onClose(); }}
            />
          ))}
        </SheetOptions>
      )}
      {kind === 'advanced' && (
        <SheetOptions>
          <SheetOption icon="check_circle" label="Đã xác thực" selected={verifiedOnly} onPress={() => onVerifiedChange(!verifiedOnly)} />
          <SheetOption icon="trending_up" label="Giá cao nhất" selected={highestPrice} onPress={() => onHighestPriceChange(!highestPrice)} />
          <SheetResetOption label="Xóa tất cả bộ lọc" onPress={onReset} />
        </SheetOptions>
      )}
    </BottomSheet>
  );
}

function QuotationSheet({ buyerName, onClose, onSubmit }: { buyerName: string; onClose: () => void; onSubmit: () => void }) {
  const [commodity, setCommodity] = useState('Cà phê Robusta xô chín (Đã phơi giàn)');
  const [quantity, setQuantity] = useState('');
  const [desiredPrice, setDesiredPrice] = useState('');
  const [note, setNote] = useState('');
  const [commodityOptionsOpen, setCommodityOptionsOpen] = useState(false);
  const options = ['Cà phê Robusta xô chín (Đã phơi giàn)', 'Cà phê Robusta tươi (Hái xô)', 'Tiêu đen chuẩn xuất khẩu', 'Sầu riêng Dona cắt vườn'];

  return (
    <BottomSheet eyebrow="CHÀO HÀNG TRỰC TIẾP" title={buyerName} closeLabel="Đóng báo giá" onClose={onClose}>
      <ScrollView style={styles.quotationScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <FontText type="labelMd" style={styles.fieldLabel}>Nông sản xuất bán</FontText>
        <Pressable accessibilityRole="button" accessibilityLabel="Chọn nông sản xuất bán" onPress={() => setCommodityOptionsOpen((value) => !value)} style={styles.selectField}><FontText type="bodySm" numberOfLines={1} style={styles.selectText}>{commodity}</FontText><Icon name="expand_more" size={20} color={COLORS.outline} /></Pressable>
        {commodityOptionsOpen && <View style={styles.selectOptions}>{options.map((option) => <Pressable key={option} accessibilityRole="button" onPress={() => { setCommodity(option); setCommodityOptionsOpen(false); }} style={styles.selectOption}><FontText type="bodySm" style={styles.optionText}>{option}</FontText></Pressable>)}</View>}
        <View style={styles.formGrid}>
          <View style={styles.formFieldHalf}><FontText type="labelMd" style={styles.fieldLabel}>Ước tính sản lượng</FontText><View style={styles.inputWithSuffix}><ThemedTextInput accessibilityLabel="Ước tính sản lượng" keyboardType="decimal-pad" onChangeText={setQuantity} placeholder="3.5" placeholderTextColor={COLORS.outline} style={styles.formInput} value={quantity} /><FontText type="labelMd" style={styles.inputSuffix}>Tấn</FontText></View></View>
          <View style={styles.formFieldHalf}><FontText type="labelMd" style={styles.fieldLabel}>Giá bạn mong muốn</FontText><View style={styles.inputWithSuffix}><ThemedTextInput accessibilityLabel="Giá bạn mong muốn" keyboardType="number-pad" onChangeText={setDesiredPrice} placeholder="121,000" placeholderTextColor={COLORS.outline} style={styles.formInput} value={desiredPrice} /><FontText type="labelSm" style={styles.inputSuffix}>₫/kg</FontText></View></View>
        </View>
        <FontText type="labelMd" style={styles.fieldLabel}>Ghi chú thêm</FontText>
        <ThemedTextInput accessibilityLabel="Ghi chú thêm" onChangeText={setNote} placeholder="Vườn cách đường lớn 200m, xe tải 8T vào được..." placeholderTextColor={COLORS.outline} style={styles.noteInput} value={note} />
      </ScrollView>
      <View style={styles.modalActions}><Pressable accessibilityRole="button" onPress={onClose} style={styles.cancelButton}><FontText type="titleMd" style={styles.cancelButtonText}>Hủy</FontText></Pressable><Pressable accessibilityRole="button" onPress={onSubmit} style={styles.submitButton}><Icon name="send" size={18} color={COLORS.onPrimary} /><FontText type="titleMd" style={styles.submitButtonText}>Gửi ngay</FontText></Pressable></View>
    </BottomSheet>
  );
}

function TrustPanel({ onReport, onPolicy }: { onReport: () => void; onPolicy: () => void }) {
  return (
    <View style={styles.trustPanel}>
      <View style={styles.trustPanelHeading}><Icon name="verified" size={22} color={COLORS.secondary} /><FontText type="titleMd" style={styles.trustPanelTitle}>Cam kết từ sàn Mùa Vàng</FontText></View>
      <FontText type="bodySm" style={styles.trustPanelBody}>100% thương lái và đại lý trong danh bạ đều được đối soát căn cước công dân, giấy đăng ký kinh doanh và ký quỹ bảo chứng giao dịch với hiệp hội địa phương.</FontText>
      <View style={styles.trustPanelLinks}><Pressable accessibilityRole="button" hitSlop={6} onPress={onReport} style={styles.inlineLink}><FontText type="labelMd" style={styles.inlineLinkText}>Báo cáo sai phạm giá</FontText><Icon name="open_in_new" size={14} color={COLORS.secondary} /></Pressable><FontText type="bodySm" style={styles.linkSeparator}>•</FontText><Pressable accessibilityRole="button" hitSlop={8} onPress={onPolicy}><FontText type="labelMd" style={styles.policyLinkText}>Điều khoản thu mua</FontText></Pressable></View>
    </View>
  );
}

export function BuyerList() {
  const [query, setQuery] = useState('');
  const [sheet, setSheet] = useState<FilterSheetKind | null>(null);
  const [productFilter, setProductFilter] = useState<string | null>(null);
  const [radiusFilter, setRadiusFilter] = useState<number | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [highestPrice, setHighestPrice] = useState(false);
  const [quotationBuyer, setQuotationBuyer] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const visibleBuyers = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('vi');
    const filtered = BUYER_DIRECTORY.filter((buyer) => {
      const buyerText = [buyer.name, buyer.badge, buyer.trust, buyer.address, buyer.distance, buyer.policy, ...buyer.metadata, ...buyer.prices.flatMap((price) => [price.label, price.value, price.note])].filter(Boolean).join(' ').toLocaleLowerCase('vi');
      return (!needle || buyerText.includes(needle)) && (!productFilter || buyer.productTags.includes(productFilter)) && (radiusFilter == null || buyer.distanceKm < radiusFilter) && (!verifiedOnly || buyer.verified);
    });
    if (!highestPrice) return filtered;
    const maxPrice = (buyer: BuyerDirectoryEntry) => Math.max(...buyer.prices.map((price) => Number(price.value.replace(/,/g, ''))));
    return [...filtered].sort((a, b) => maxPrice(b) - maxPrice(a));
  }, [highestPrice, productFilter, query, radiusFilter, verifiedOnly]);

  const filtersActive = Boolean(query.trim() || productFilter || radiusFilter || verifiedOnly || highestPrice);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  const showToast = (message: string) => {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  };
  const reportIssue = () => Alert.alert('Báo cáo sai phạm', 'Cảm ơn bạn. Đội ngũ Mùa Vàng sẽ kiểm tra thông tin này.');
  const showPolicy = () => Alert.alert('Điều khoản thu mua', 'Điều khoản thu mua và bảo vệ giao dịch sẽ được cập nhật trong phiên bản tiếp theo.');


  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.shell}>
        <AppHeader />
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.titleRow}><View style={styles.titleCopy}><Icon name="verified_user" size={22} color={COLORS.secondary} /><FontText type="subtitle" accessibilityRole="header" style={styles.screenTitle}>Thương lái & Đại lý thu mua</FontText></View><View style={styles.openBadge}><View style={styles.openDot} /><FontText type="labelSm" style={styles.openBadgeText}>38 đại lý mở kho</FontText></View></View>
          <View style={styles.searchRow}>
            <View style={styles.searchField}><Icon name="search" size={20} color={COLORS.outline} /><ThemedTextInput accessibilityLabel="Tìm kiếm đại lý" onChangeText={setQuery} placeholder="Tìm tên đại lý, thương lái, HTX..." placeholderTextColor={COLORS.outline} returnKeyType="search" style={styles.searchInput} value={query} />{query.length > 0 && <Pressable accessibilityRole="button" accessibilityLabel="Xóa tìm kiếm" hitSlop={10} onPress={() => setQuery('')} style={styles.clearButton}><Icon name="close" size={16} color={COLORS.onSurfaceVariant} /></Pressable>}</View>
            <Pressable accessibilityRole="button" accessibilityLabel="Bộ lọc chuyên sâu" onPress={() => setSheet('advanced')} style={styles.filterButton}><Icon name="tune" size={20} color={filtersActive ? COLORS.secondary : COLORS.onSurface} /><View style={[styles.filterDot, !filtersActive && styles.hiddenDot]} /></Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow} style={styles.filterScroll}>
            <Chip dropdown selected onPress={() => setSheet('product')} label={productFilter === 'pepper' ? 'Tiêu đen' : productFilter === 'durian' ? 'Sầu riêng' : 'Cà phê Robusta'} />
            <Chip dropdown selected={Boolean(radiusFilter)} onPress={() => setSheet('radius')} label={radiusFilter ? `Bán kính: < ${radiusFilter}km` : 'Bán kính: < 15km'} />
            <Chip icon="check_circle" selected={verifiedOnly} onPress={() => setVerifiedOnly((value) => !value)} label="Đã xác thực" />
            <Chip icon="trending_up" selected={highestPrice} onPress={() => setHighestPrice((value) => !value)} label="Giá cao nhất" />
          </ScrollView>
          <SafetyTip />
          <View style={styles.buyerList}>{visibleBuyers.length === 0 ? <View style={styles.emptyState}><FontText type="bodySm" style={styles.emptyStateText}>Không có đại lý nào khớp bộ lọc.</FontText></View> : visibleBuyers.map((buyer) => <BuyerCard key={buyer.id} buyer={buyer} onQuote={setQuotationBuyer} />)}</View>
          <TrustPanel onReport={reportIssue} onPolicy={showPolicy} />
        </ScrollView>
      </View>
      {sheet && <FilterSheet kind={sheet} productFilter={productFilter} radiusFilter={radiusFilter} verifiedOnly={verifiedOnly} highestPrice={highestPrice} onClose={() => setSheet(null)} onProductChange={setProductFilter} onRadiusChange={setRadiusFilter} onVerifiedChange={setVerifiedOnly} onHighestPriceChange={setHighestPrice} onReset={() => { setProductFilter(null); setRadiusFilter(null); setVerifiedOnly(false); setHighestPrice(false); setSheet(null); }} />}
      {quotationBuyer && <QuotationSheet buyerName={quotationBuyer} onClose={() => setQuotationBuyer(null)} onSubmit={() => { setQuotationBuyer(null); showToast('Đại lý sẽ gọi lại trong 15 phút!'); }} />}
      {toast && <View accessibilityRole="alert" style={styles.toast}><Icon name="check_circle" size={20} color={COLORS.secondaryContainer} /><FontText type="bodySm" style={styles.toastText}>{toast}</FontText></View>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  loadingScreen: { flex: 1, backgroundColor: COLORS.background },
  shell: { flex: 1, width: '100%', maxWidth: 430, alignSelf: 'center', backgroundColor: COLORS.background },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: BottomTabInset + 88, gap: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  titleCopy: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  screenTitle: { flex: 1, color: COLORS.onSurface },
  openBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.full, backgroundColor: COLORS.secondaryFixed, maxWidth: 130 },
  openDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.secondary },
  openBadgeText: { color: COLORS.onSecondaryFixedVariant, fontWeight: '600' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchField: { flex: 1, height: 44, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, borderRadius: Radius.container, backgroundColor: COLORS.surface, shadowColor: COLORS.shadow, shadowOpacity: 0.04, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  searchInput: { flex: 1, minWidth: 0, padding: 0, color: COLORS.onSurface, fontWeight: '400', fontSize: 14, lineHeight: 20 },
  clearButton: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surfaceContainer },
  filterButton: { width: 44, height: 44, borderRadius: Radius.container, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface, shadowColor: COLORS.shadow, shadowOpacity: 0.04, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  filterDot: { position: 'absolute', width: 6, height: 6, top: 10, right: 10, borderRadius: 3, backgroundColor: COLORS.secondary },
  hiddenDot: { opacity: 0 },
  filterScroll: { marginHorizontal: -16 },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 2 },
  safetyTip: { position: 'relative', flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 16, borderRadius: Radius.container, backgroundColor: COLORS.surfaceLow, overflow: 'hidden', shadowColor: COLORS.shadow, shadowOpacity: 0.03, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  safetyIconWell: { width: 32, height: 32, marginTop: 2, borderRadius: Radius.container, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.secondaryContainer },
  safetyCopy: { flex: 1, minWidth: 0, gap: 2 },
  safetyHeadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  safetyHeading: { color: COLORS.secondary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.44 },
  safetyDate: { color: COLORS.onSurfaceVariant, fontWeight: '400' },
  safetyBody: { color: COLORS.onSurface, fontWeight: '400' },
  buyerList: { gap: 12 },
  buyerCard: { position: 'relative', overflow: 'hidden', padding: 16, borderRadius: Radius.container, backgroundColor: COLORS.surface, shadowColor: COLORS.shadow, shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  cardTopRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 12 },
  cardHeading: { flex: 1, minWidth: 0 },
  buyerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 0 },
  buyerName: { flex: 1, minWidth: 0, color: COLORS.primary, fontWeight: '700', fontSize: 15, lineHeight: 22 },
  metadataRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2, minWidth: 0 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { color: COLORS.tertiaryCopy, fontWeight: '600' },
  metadataSeparator: { color: COLORS.outline },
  metadataItem: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  metadataText: { color: COLORS.onSurfaceVariant, fontWeight: '400' },
  secondaryMetadata: { color: COLORS.secondary, fontWeight: '500' },
  cardBadge: { flexShrink: 1, maxWidth: 108, paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.base, fontWeight: '600', textAlign: 'center' },
  greenBadge: { color: COLORS.onSecondaryFixedVariant, backgroundColor: COLORS.secondaryFixed },
  orangeBadge: { color: COLORS.tertiaryCopy, backgroundColor: COLORS.tertiaryFixed },
  neutralBadge: { color: COLORS.onSurfaceVariant, backgroundColor: COLORS.surfaceContainer },
  trustStrip: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 32, marginBottom: 12, paddingHorizontal: 8, paddingVertical: 6, borderRadius: Radius.container, backgroundColor: COLORS.surfaceLow },
  trustText: { flex: 1, minWidth: 0, color: COLORS.onSurfaceVariant, fontWeight: '400' },
  trustStrong: { fontWeight: '700', color: COLORS.onSurfaceVariant },
  priceGrid: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  priceWell: { flex: 1, minWidth: 0, minHeight: 92, padding: 12, borderRadius: Radius.container, backgroundColor: COLORS.surfaceLow },
  priceLabelRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 4, minHeight: 28 },
  priceLabel: { flex: 1, color: COLORS.onSurfaceVariant, fontWeight: '600' },
  priceBadge: { color: COLORS.onSecondaryContainer, backgroundColor: COLORS.secondaryContainer, paddingHorizontal: 4, borderRadius: 2, fontWeight: '600', fontSize: 10, lineHeight: 14 },
  priceValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 4 },
  priceValue: { color: COLORS.primary, fontWeight: '700', fontVariant: ['tabular-nums'], letterSpacing: -0.18 },
  priceUnit: { color: COLORS.onSurfaceVariant, fontWeight: '400' },
  priceNote: { marginTop: 2, fontWeight: '600' },
  positiveText: { color: COLORS.secondary },
  mutedText: { color: COLORS.onSurfaceVariant, fontWeight: '400' },
  detailStack: { gap: 6, marginBottom: 16 },
  detailLine: { flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 0 },
  detailText: { flex: 1, minWidth: 0, color: COLORS.onSurfaceVariant, fontWeight: '400' },
  distanceText: { flexShrink: 0, maxWidth: '45%', color: COLORS.primary, fontWeight: '600' },
  ctaGrid: { flexDirection: 'row', alignItems: 'stretch', gap: 8, paddingTop: 4 },
  ctaCell: { flex: 1, minWidth: 0, height: 44 },
  callButton: { width: '100%', height: 44, minWidth: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 8, borderRadius: Radius.container, backgroundColor: COLORS.primaryContainer, shadowColor: COLORS.shadow, shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  callButtonText: { flexShrink: 1, color: COLORS.onPrimary, fontWeight: '600' },
  secondaryButton: { width: '100%', height: 44, minWidth: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 8, borderRadius: Radius.container, backgroundColor: COLORS.surfaceContainer, shadowColor: COLORS.shadow, shadowOpacity: 0.04, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  secondaryButtonText: { color: COLORS.onSurface, fontWeight: '600' },
  emptyState: { minHeight: 72, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.container, backgroundColor: COLORS.surface },
  emptyStateText: { color: COLORS.onSurfaceVariant },
  trustPanel: { gap: 8, marginBottom: 8, padding: 16, borderRadius: Radius.container, backgroundColor: COLORS.surfaceHigh },
  trustPanelHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trustPanelTitle: { color: COLORS.primary, fontWeight: '700' },
  trustPanelBody: { color: COLORS.onSurfaceVariant, fontWeight: '400' },
  trustPanelLinks: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 1 },
  inlineLink: { minHeight: 32, flexDirection: 'row', alignItems: 'center', gap: 4 },
  inlineLinkText: { color: COLORS.secondary, fontWeight: '600' },
  linkSeparator: { color: COLORS.outline },
  policyLinkText: { color: COLORS.onSurfaceVariant, fontWeight: '500' },
  optionText: { color: COLORS.onSurface },
  quotationScroll: { flexGrow: 0, maxHeight: 420, marginBottom: 12 },
  fieldLabel: { marginBottom: 4, color: COLORS.onSurface, fontWeight: '600' },
  selectField: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingHorizontal: 12, borderRadius: Radius.container, backgroundColor: COLORS.surfaceLow },
  selectText: { flex: 1, color: COLORS.onSurface },
  selectOptions: { gap: 4, marginTop: 4, padding: 4, borderRadius: Radius.container, backgroundColor: COLORS.surfaceLow },
  selectOption: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 8, borderRadius: Radius.base },
  formGrid: { flexDirection: 'row', gap: 8, marginTop: 12 },
  formFieldHalf: { flex: 1, minWidth: 0 },
  inputWithSuffix: { minHeight: 44, flexDirection: 'row', alignItems: 'center', borderRadius: Radius.container, backgroundColor: COLORS.surfaceLow },
  formInput: { flex: 1, minWidth: 0, height: 44, paddingHorizontal: 12, paddingVertical: 0, color: COLORS.onSurface, fontWeight: '600', fontSize: 14 },
  inputSuffix: { paddingRight: 12, color: COLORS.onSurfaceVariant, fontWeight: '500' },
  noteInput: { height: 44, marginBottom: 4, paddingHorizontal: 12, paddingVertical: 0, borderRadius: Radius.container, backgroundColor: COLORS.surfaceLow, color: COLORS.onSurface, fontWeight: '400', fontSize: 14 },
  modalActions: { flexDirection: 'row', gap: 8, paddingTop: 4 },
  cancelButton: { flex: 1, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.container, backgroundColor: COLORS.surfaceContainer },
  cancelButtonText: { color: COLORS.onSurface, fontWeight: '600' },
  submitButton: { flex: 1, height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: Radius.container, backgroundColor: COLORS.primary },
  submitButtonText: { color: COLORS.onPrimary, fontWeight: '600' },
  toast: { position: 'absolute', alignSelf: 'center', bottom: BottomTabInset + 16, maxWidth: '92%', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderRadius: Radius.full, backgroundColor: COLORS.inverseSurface, shadowColor: COLORS.shadow, shadowOpacity: 0.16, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 5 },
  toastText: { color: COLORS.inverseOnSurface, fontWeight: '400' },
  pressed: { opacity: 0.78 },
});
