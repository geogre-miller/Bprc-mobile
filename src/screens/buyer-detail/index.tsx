import { useMemo, useState, type ReactNode } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { LightPalette } from '@/constants/theme';
import { BUYERS } from '@/data/mock-data';

import { Icon, type IconName } from '../home-dashboard/icons';

import { BUYER_DETAIL_FONTS as FONT, useBuyerDetailFonts } from './fonts';

const COLORS = LightPalette;

const PHONE = '0914829374';

type CommodityChoice = { id: 'coffee' | 'pepper'; label: string; price: number };

const COMMODITY_CHOICES: CommodityChoice[] = [
  { id: 'coffee', label: 'Robusta Nhân xô', price: 119200 },
  { id: 'pepper', label: 'Tiêu Đen', price: 148500 },
];

const formatNumber = (value: number) => value.toLocaleString('en-US');

function Card({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function TrustStat({ icon, value, label, color }: { icon: IconName; value: string; label: string; color: string }) {
  return (
    <View style={styles.trustStat}>
      <View style={styles.inlineCompact}>
        <Icon name={icon} size={15} color={color} />
        <ThemedText type="labelMd" style={[styles.semibold, { color }]}>
          {value}
        </ThemedText>
      </View>
      <ThemedText type="labelSm" style={styles.mutedLabel}>
        {label}
      </ThemedText>
    </View>
  );
}

function QuotaRow({ urgent, value }: { urgent?: boolean; value: string }) {
  return (
    <View style={styles.quotaRow}>
      <View style={styles.quotaLabel}>
        <Icon name={urgent ? 'shopping_bag' : 'scale'} size={15} color={COLORS.onSurfaceVariant} />
        <ThemedText type="labelSm" style={styles.mutedLabel}>
          Hạn ngạch cần thu:
        </ThemedText>
      </View>
      <ThemedText type="labelMd" style={styles.quotaValue}>
        {value}
      </ThemedText>
    </View>
  );
}

function Price({ value, compact }: { value: string; compact?: boolean }) {
  return (
    <ThemedText type={compact ? 'numericLg' : 'numericHero'} style={styles.price} numberOfLines={1}>
      {value}
      <ThemedText type={compact ? 'labelSm' : 'labelMd'} style={styles.priceUnit}>
        {' '}₫/kg
      </ThemedText>
    </ThemedText>
  );
}

function QuoteCard({
  title,
  badge,
  description,
  price,
  priceNote,
  quota,
  urgent,
  compact,
}: {
  title: string;
  badge: string;
  description: string;
  price: string;
  priceNote?: string;
  quota?: string;
  urgent?: boolean;
  compact?: boolean;
}) {
  return (
    <Card style={compact ? styles.compactQuote : styles.quoteCard}>
      <View style={[styles.quoteTop, compact && styles.compactQuoteTop]}>
        <View style={styles.quoteCopy}>
          <View style={styles.quoteTitleRow}>
            <ThemedText type="titleMd" style={styles.quoteTitle}>
              {title}
            </ThemedText>
            <View style={styles.gradeBadge}>
              <ThemedText type="labelSm" style={styles.gradeText}>
                {badge}
              </ThemedText>
            </View>
          </View>
          <ThemedText type="bodySm" style={styles.quoteDescription}>
            {description}
          </ThemedText>
        </View>
        <View style={styles.quotePrice}>
          <Price value={price} compact={compact} />
          {priceNote === '+700 ₫ so với sàn' ? (
            <View style={styles.gainBadge}>
              <ThemedText type="labelSm" style={styles.gainText}>{priceNote}</ThemedText>
            </View>
          ) : priceNote ? (
            <ThemedText type="labelSm" style={styles.marketNote}>{priceNote}</ThemedText>
          ) : null}
        </View>
      </View>
      {quota && <QuotaRow urgent={urgent} value={quota} />}
    </Card>
  );
}

function TransactionRow({ title, detail, value }: { title: string; detail: string; value: string }) {
  return (
    <View style={styles.transactionRow}>
      <View style={styles.transactionCopy}>
        <ThemedText type="titleMd" style={styles.transactionTitle}>{title}</ThemedText>
        <ThemedText type="labelSm" style={styles.transactionDetail}>{detail}</ThemedText>
      </View>
      <View style={styles.transactionValueBlock}>
        <ThemedText type="labelMd" style={styles.transactionValue}>{value}</ThemedText>
        <View style={styles.paidRow}>
          <Icon name="check_circle" size={13} color={COLORS.secondary} />
          <ThemedText type="labelSm" style={styles.paidText}>Đã thanh toán đủ</ThemedText>
        </View>
      </View>
    </View>
  );
}

function PolicyRow({ icon, title, description }: { icon: IconName; title: string; description: string }) {
  return (
    <View style={styles.policyRow}>
      <View style={styles.policyIcon}>
        <Icon name={icon} size={18} color={COLORS.secondary} />
      </View>
      <View style={styles.policyCopy}>
        <ThemedText type="small" style={styles.policyTitle}>{title}</ThemedText>
        <ThemedText type="bodySm" style={styles.policyDescription}>{description}</ThemedText>
      </View>
    </View>
  );
}

export function BuyerDetail({ buyerId }: { buyerId?: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fontsReady = useBuyerDetailFonts();
  const buyer = BUYERS.find((item) => item.id === buyerId);
  const [saleOpen, setSaleOpen] = useState(false);
  const [commodityId, setCommodityId] = useState<CommodityChoice['id']>('coffee');
  const [weight, setWeight] = useState('2000');
  const commodity = COMMODITY_CHOICES.find((item) => item.id === commodityId) ?? COMMODITY_CHOICES[0];
  const estimate = useMemo(() => (Number(weight) || 0) * commodity.price, [commodity.price, weight]);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/buyers'));
  const callBuyer = () => Linking.openURL(`tel:${PHONE}`);
  const shareBuyer = () => Share.share({
    title: 'Đại lý Toàn Thắng',
    message: 'Đại lý Toàn Thắng đang thu mua nông sản tại Đắk Lắk trên NôngSản Pro.',
  });

  const submitSale = () => {
    setSaleOpen(false);
    Alert.alert(
      'Đã gửi yêu cầu chốt',
      `Phiếu đề xuất bán ${formatNumber(Number(weight) || 0)} kg ${commodity.label} đã được gửi đến Đại lý Toàn Thắng.`,
    );
  };

  if (!fontsReady) {
    return <View style={styles.loading} />;
  }

  if (!buyer) {
    return (
      <View style={[styles.empty, { paddingTop: insets.top }]}>
        <ThemedText type="bodySm" style={styles.mutedLabel}>Không tìm thấy đầu mối này.</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.shell, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image accessibilityLabel="Biểu trưng NôngSản Pro" source={require('@/assets/images/nongsan-pro-logo.png')} resizeMode="contain" style={styles.brandLogo} />
            <View style={styles.brandCopy}>
              <ThemedText type="titleMd" style={styles.brandTitle}>NôngSản Pro</ThemedText>
              <View style={styles.regionRow}>
                <Icon name="location_on" size={14} color={COLORS.secondary} />
                <ThemedText type="labelSm" style={styles.regionText}>Tây Nguyên • Đắk Lắk</ThemedText>
              </View>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable accessibilityRole="button" accessibilityLabel="Thông báo" onPress={() => router.push('/alerts')} style={({ pressed }) => [styles.notificationButton, pressed && styles.pressed]}>
              <Icon name="notifications" size={22} color={COLORS.onSurfaceVariant} />
              <View style={styles.notificationDot} />
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Mở trang cá nhân" onPress={() => router.push('/account')} style={({ pressed }) => pressed && styles.pressed}>
              <Image accessibilityLabel="Ảnh đại diện nông hộ" source={require('@/assets/images/nongsan-pro-profile.png')} style={styles.headerAvatar} />
            </Pressable>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={[styles.content, { paddingBottom: 148 + insets.bottom }]} showsVerticalScrollIndicator={false}>
          <View style={styles.topNavigation}>
            <Pressable accessibilityRole="button" accessibilityLabel="Quay lại danh bạ" onPress={goBack} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
              <Icon name="arrow_back" size={20} color={COLORS.secondary} />
              <ThemedText type="labelMd" style={styles.backText}>Danh bạ</ThemedText>
            </Pressable>
            <View style={styles.topActions}>
              <Pressable accessibilityRole="button" accessibilityLabel="Gọi Đại lý Toàn Thắng" onPress={callBuyer} style={({ pressed }) => [styles.topIconButton, pressed && styles.pressed]}>
                <Icon name="call" size={20} color={COLORS.secondary} />
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Chia sẻ hồ sơ Đại lý Toàn Thắng" onPress={shareBuyer} style={({ pressed }) => [styles.topIconButton, pressed && styles.pressed]}>
                <Icon name="share" size={20} color={COLORS.onSurfaceVariant} />
              </Pressable>
            </View>
          </View>

          <Card style={styles.buyerCard}>
            <View style={styles.brandGlow} />
            <View style={styles.identityRow}>
              <View style={styles.portraitWrap}>
                <Image accessibilityLabel="Anh Trần Toàn Thắng tại kho nông sản" source={require('@/assets/images/buyer-detail-portrait.jpg')} resizeMode="cover" style={styles.portrait} />
                <View style={styles.portraitVerified}><Icon name="verified" size={11} color={COLORS.onPrimary} /></View>
              </View>
              <View style={styles.identityCopy}>
                <ThemedText type="headlineSm" style={styles.buyerName} numberOfLines={1}>Đại lý Toàn Thắng</ThemedText>
                <ThemedText type="bodySm" style={styles.ownerText}>Chủ cơ sở: Anh Trần Toàn Thắng</ThemedText>
                <View style={styles.licenseBadge}>
                  <Icon name="check_circle" size={13} color={COLORS.secondary} />
                  <ThemedText type="labelSm" style={styles.licenseText} numberOfLines={2}>Cấp phép bởi Sở Công Thương Đắk Lắk</ThemedText>
                </View>
              </View>
            </View>
            <QuotaRow value="Đang cần 3 tấn" />
            <View style={styles.trustGrid}>
              <TrustStat icon="star" value="4.9" label="48 đánh giá" color={COLORS.amber} />
              <TrustStat icon="history" value="8 năm" label="Thâm niên" color={COLORS.primary} />
              <TrustStat icon="payments" value="100%" label="Đúng hạn" color={COLORS.secondary} />
            </View>
          </Card>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeading}>
                <Icon name="price_change" size={20} color={COLORS.primary} />
                <ThemedText type="titleMd" style={styles.sectionTitle}>Giá thu mua hôm nay</ThemedText>
              </View>
              <View style={styles.updatedBadge}>
                <View style={styles.liveDot} />
                <ThemedText type="labelSm" style={styles.updatedText}>Cập nhật 08:30</ThemedText>
              </View>
            </View>
            <View style={styles.quoteStack}>
              <QuoteCard title="Cà phê Robusta" badge="Nhân xô" description="Yêu cầu ẩm ≤ 15% • Tạp chất ≤ 1%" price="119,200" priceNote="+700 ₫ so với sàn" quota="Cần gấp 10 tấn" urgent />
              <QuoteCard title="Hồ tiêu đen" badge="Dung trọng 550g/l" description="Tiêu khô đều, không ẩm mốc" price="148,500" priceNote="Bằng giá thị trường" quota="Đang cần 3 tấn" />
              <QuoteCard title="Cà phê quả tươi" badge="Hái chín >85%" description="Cân xô tại vườn hoặc tại kho" price="24,500" compact />
            </View>
          </View>

          <View style={styles.warehouseCard}>
            <Image accessibilityLabel="Kho tổng Buôn Hồ" source={require('@/assets/images/buyer-detail-warehouse.jpg')} resizeMode="cover" style={styles.warehouseImage} />
            <View style={styles.warehouseCaption}>
              <Icon name="warehouse" size={18} color={COLORS.onPrimary} />
              <ThemedText type="labelMd" style={styles.warehouseText}>Kho tổng Buôn Hồ • Sức chứa 2,500 tấn</ThemedText>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeading}>
                <Icon name="receipt_long" size={20} color={COLORS.primary} />
                <ThemedText type="titleMd" style={styles.sectionTitle}>Lịch sử giao dịch của bạn</ThemedText>
              </View>
              <ThemedText type="labelSm" style={styles.loyalText}>Khách hàng thân thiết</ThemedText>
            </View>
            <View style={styles.historySummary}>
              <View style={styles.summaryTop}>
                <ThemedText type="labelSm" style={styles.summaryLabel}>TỔNG GIÁ TRỊ ĐÃ GIAO DỊCH</ThemedText>
                <View style={styles.dealBadge}><ThemedText type="labelSm" style={styles.dealText}>4 vụ đã chốt</ThemedText></View>
              </View>
              <ThemedText type="numericHero" style={styles.summaryValue}>1,480,000,000 <ThemedText type="titleMd" style={styles.summaryCurrency}>₫</ThemedText></ThemedText>
              <View style={styles.summaryFooter}>
                <ThemedText type="bodySm" style={styles.summaryFooterText}>Tổng sản lượng cung ứng:</ThemedText>
                <ThemedText type="labelMd" style={styles.summaryFooterValue}>14.2 tấn</ThemedText>
              </View>
            </View>
            <View style={styles.transactionList}>
              <TransactionRow title="3,500 kg Cà phê Robusta" detail="Ngày 18/09/2024 • Đơn giá 116,000 ₫/kg" value="406,000,000 ₫" />
              <View style={styles.divider} />
              <TransactionRow title="1,200 kg Tiêu đen" detail="Ngày 05/06/2024 • Đơn giá 142,000 ₫/kg" value="170,400,000 ₫" />
            </View>
          </View>

          <Card style={styles.policyCard}>
            <View style={styles.sectionHeading}>
              <Icon name="verified_user" size={20} color={COLORS.secondary} />
              <ThemedText type="titleMd" style={styles.sectionTitle}>Quy chuẩn thu mua & Hỗ trợ</ThemedText>
            </View>
            <View style={styles.policyStack}>
              <PolicyRow icon="water_drop" title="Độ ẩm & Tạp chất" description="Độ ẩm tiêu chuẩn: Cà phê ≤ 15%, Tạp chất ≤ 1%. Kiểm tra bằng máy Kett điện tử trước mặt chủ vườn." />
              <PolicyRow icon="scale" title="Cân điện tử kiểm định" description="Hệ thống cân điện tử 80 tấn và cân bàn có tem kiểm định định kỳ của Chi cục Tiêu chuẩn Đo lường Chất lượng." />
              <PolicyRow icon="local_shipping" title="Vận chuyển bốc hàng miễn phí" description="Có đội xe tải 2.5 - 5 tấn hỗ trợ bốc hàng tận kho vườn miễn phí trong bán kính 15 km (từ 1 tấn trở lên)." />
            </View>
          </Card>

          <View style={styles.ctaStack}>
            <Pressable accessibilityRole="button" accessibilityLabel="Gọi ngay 0914.829.xxx" onPress={callBuyer} style={({ pressed }) => [styles.primaryCta, pressed && styles.ctaPressed]}>
              <Icon name="call" size={20} color={COLORS.onPrimary} />
              <ThemedText type="titleMd" style={styles.primaryCtaText}>Gọi ngay 0914.829.xxx</ThemedText>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Tạo phiếu bán cho đại lý này" onPress={() => setSaleOpen(true)} style={({ pressed }) => [styles.secondaryCta, pressed && styles.pressed]}>
              <Icon name="post_add" size={20} color={COLORS.secondary} />
              <ThemedText type="titleMd" style={styles.secondaryCtaText}>Tạo phiếu bán cho đại lý này</ThemedText>
            </Pressable>
          </View>
        </ScrollView>

      </View>

      <Modal visible={saleOpen} transparent animationType="slide" onRequestClose={() => setSaleOpen(false)}>
        <KeyboardAvoidingView style={styles.modalRoot} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable accessibilityRole="button" accessibilityLabel="Đóng phiếu chốt giá" style={styles.scrim} onPress={() => setSaleOpen(false)} />
          <View style={[styles.sheet, { paddingBottom: 16 + insets.bottom }]}>
            <View style={styles.sheetHeader}>
              <View>
                <ThemedText type="headlineSm" style={styles.sheetTitle}>Tạo phiếu chốt giá</ThemedText>
                <ThemedText type="labelSm" style={styles.sheetSubtitle}>Gửi trực tiếp đến Đại lý Toàn Thắng</ThemedText>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Đóng" onPress={() => setSaleOpen(false)} style={styles.sheetClose}>
                <Icon name="close" size={18} color={COLORS.onSurfaceVariant} />
              </Pressable>
            </View>
            <View style={styles.fieldGroup}>
              <ThemedText type="labelMd" style={styles.fieldLabel}>Chọn nông sản xuất kho:</ThemedText>
              <View accessibilityRole="tablist" style={styles.commodityRow}>
                {COMMODITY_CHOICES.map((item) => {
                  const selected = item.id === commodityId;
                  return (
                    <Pressable key={item.id} accessibilityRole="tab" accessibilityState={{ selected }} aria-selected={selected} onPress={() => setCommodityId(item.id)} style={[styles.commodityChip, selected && styles.commodityChipSelected]}>
                      <ThemedText type="labelMd" style={[styles.commodityText, selected && styles.commodityTextSelected]}>{item.label}</ThemedText>
                      {selected && <Icon name="check_circle" size={16} color={COLORS.onSecondaryContainer} />}
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <View style={styles.fieldGroup}>
              <View style={styles.inputHeader}>
                <ThemedText type="labelMd" style={styles.fieldLabel}>Khối lượng bán (kg):</ThemedText>
                <ThemedText type="labelSm" style={styles.availableText}>Có sẵn: 5,400 kg trong kho</ThemedText>
              </View>
              <View style={styles.inputWrap}>
                <TextInput accessibilityLabel="Khối lượng bán" value={weight} onChangeText={setWeight} keyboardType="numeric" inputMode="numeric" style={styles.weightInput} />
                <ThemedText type="labelMd" style={styles.inputUnit}>kg</ThemedText>
              </View>
            </View>
            <View style={styles.estimateCard}>
              <View>
                <ThemedText type="labelSm" style={styles.mutedLabel}>Ước tính thành tiền:</ThemedText>
                <ThemedText type="numericLg" style={styles.estimateValue}>{formatNumber(estimate)} ₫</ThemedText>
              </View>
              <View style={styles.currentBadge}><ThemedText type="labelSm" style={styles.updatedText}>Theo giá hiện tại</ThemedText></View>
            </View>
            <View style={styles.sheetActions}>
              <Pressable accessibilityRole="button" accessibilityLabel="Hủy tạo phiếu" onPress={() => setSaleOpen(false)} style={styles.cancelButton}>
                <ThemedText type="titleMd" style={styles.cancelText}>Hủy</ThemedText>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Gửi yêu cầu chốt" onPress={submitSale} style={styles.submitButton}>
                <Icon name="send" size={18} color={COLORS.onPrimary} />
                <ThemedText type="titleMd" style={styles.submitText}>Gửi yêu cầu chốt</ThemedText>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const shadow = {
  shadowColor: COLORS.shadow,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 4,
  elevation: 1,
} as const;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  shell: { flex: 1, width: '100%', maxWidth: 430, alignSelf: 'center', backgroundColor: COLORS.background },
  loading: { flex: 1, backgroundColor: COLORS.background },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background, padding: 24 },
  header: { height: 64, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.background, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2, zIndex: 3 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  brandLogo: { width: 36, height: 32, borderRadius: 4 },
  brandCopy: { flexShrink: 1 },
  brandTitle: { color: COLORS.primary, fontFamily: FONT.publicSansSemiBold, lineHeight: 20 },
  regionRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  regionText: { color: COLORS.onSurfaceVariant, fontFamily: FONT.publicSansSemiBold },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  notificationButton: { width: 44, height: 44, borderRadius: 8, backgroundColor: COLORS.surfaceLow, alignItems: 'center', justifyContent: 'center' },
  notificationDot: { position: 'absolute', top: 10, right: 9, width: 8, height: 8, borderRadius: 999, backgroundColor: COLORS.error, borderColor: COLORS.background, borderWidth: 2 },
  headerAvatar: { width: 34, height: 34, borderRadius: 999 },
  scrollView: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  topNavigation: { minHeight: 56, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { minHeight: 40, paddingRight: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { color: COLORS.onSurfaceVariant, fontFamily: FONT.publicSansMedium },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topIconButton: { width: 40, height: 40, borderRadius: 8, backgroundColor: COLORS.surfaceLow, alignItems: 'center', justifyContent: 'center' },
  card: { borderRadius: 8, padding: 16, gap: 12, backgroundColor: COLORS.surfaceLowest, overflow: 'hidden', ...shadow },
  buyerCard: { position: 'relative' },
  brandGlow: { position: 'absolute', width: 112, height: 112, borderRadius: 999, right: -32, top: -32, backgroundColor: COLORS.secondaryContainer },
  identityRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  portraitWrap: { width: 56, height: 56, borderRadius: 8, overflow: 'hidden', backgroundColor: COLORS.surfaceHigh },
  portrait: { width: 56, height: 56 },
  portraitVerified: { position: 'absolute', right: 0, bottom: 0, width: 16, height: 16, borderTopLeftRadius: 4, backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center' },
  identityCopy: { flex: 1, minWidth: 0 },
  buyerName: { color: COLORS.primary, fontFamily: FONT.manropeSemiBold },
  ownerText: { color: COLORS.onSurfaceVariant, fontFamily: FONT.publicSansRegular, marginTop: 2 },
  licenseBadge: { alignSelf: 'flex-start', maxWidth: '100%', marginTop: 4, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.secondaryContainer },
  licenseText: { color: COLORS.onSecondaryContainer, fontFamily: FONT.publicSansSemiBold, flexShrink: 1, lineHeight: 14 },
  quotaRow: { minHeight: 32, borderRadius: 4, paddingHorizontal: 10, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, backgroundColor: COLORS.surfaceLow },
  quotaLabel: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },
  quotaValue: { color: COLORS.primary, fontFamily: FONT.publicSansSemiBold, fontWeight: '600' },
  trustGrid: { flexDirection: 'row', gap: 8, paddingTop: 4 },
  trustStat: { flex: 1, minHeight: 55, borderRadius: 4, padding: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surfaceContainer },
  inlineCompact: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  mutedLabel: { color: COLORS.onSurfaceVariant, fontFamily: FONT.publicSansSemiBold },
  semibold: { fontFamily: FONT.publicSansSemiBold, fontWeight: '600' },
  section: { gap: 10 },
  sectionHeader: { minHeight: 24, paddingHorizontal: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  sectionTitle: { color: COLORS.primary, fontFamily: FONT.publicSansSemiBold, flexShrink: 1 },
  updatedBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.secondaryContainer },
  liveDot: { width: 6, height: 6, borderRadius: 999, backgroundColor: COLORS.secondary },
  updatedText: { color: COLORS.onSecondaryContainer, fontFamily: FONT.publicSansSemiBold },
  quoteStack: { gap: 8 },
  quoteCard: { gap: 8 },
  compactQuote: { paddingVertical: 16, gap: 0 },
  quoteTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  compactQuoteTop: { alignItems: 'center' },
  quoteCopy: { flex: 1, minWidth: 0 },
  quoteTitleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  quoteTitle: { color: COLORS.onSurface, fontFamily: FONT.publicSansBold },
  gradeBadge: { borderRadius: 2, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: COLORS.surfaceHigh },
  gradeText: { color: COLORS.onSurfaceVariant, fontFamily: FONT.publicSansSemiBold },
  quoteDescription: { color: COLORS.onSurfaceVariant, fontFamily: FONT.publicSansRegular, marginTop: 2 },
  quotePrice: { alignItems: 'flex-end', flexShrink: 0 },
  price: { color: COLORS.primary, fontFamily: FONT.publicSansBold },
  priceUnit: { color: COLORS.outline, fontFamily: FONT.publicSansRegular, fontWeight: '400' },
  gainBadge: { borderRadius: 2, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: COLORS.gainContainer },
  gainText: { color: COLORS.secondary, fontFamily: FONT.publicSansSemiBold },
  marketNote: { color: COLORS.onSurfaceVariant, fontFamily: FONT.publicSansSemiBold, marginTop: 1 },
  warehouseCard: { height: 144, borderRadius: 8, overflow: 'hidden', backgroundColor: COLORS.surfaceContainer, ...shadow },
  warehouseImage: { width: '100%', height: '100%' },
  warehouseCaption: { position: 'absolute', left: 0, right: 0, bottom: 0, minHeight: 45, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primary },
  warehouseText: { color: COLORS.onPrimary, fontFamily: FONT.publicSansMedium, flexShrink: 1 },
  loyalText: { color: COLORS.secondary, fontFamily: FONT.publicSansMedium, textAlign: 'right', flexShrink: 1 },
  historySummary: { borderRadius: 8, overflow: 'hidden', padding: 16, paddingBottom: 0, gap: 8, backgroundColor: COLORS.primary, ...shadow },
  summaryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  summaryLabel: { color: COLORS.onPrimaryContainer, fontFamily: FONT.publicSansSemiBold, letterSpacing: 1 },
  dealBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: COLORS.primaryContainer },
  dealText: { color: COLORS.secondaryContainer, fontFamily: FONT.publicSansSemiBold },
  summaryValue: { color: COLORS.onPrimary, fontFamily: FONT.publicSansBold },
  summaryCurrency: { color: COLORS.onPrimaryContainer, fontFamily: FONT.publicSansSemiBold },
  summaryFooter: { minHeight: 40, marginHorizontal: -16, marginTop: 2, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.primaryPressed },
  summaryFooterText: { color: COLORS.onPrimary, fontFamily: FONT.publicSansRegular },
  summaryFooterValue: { color: COLORS.onPrimary, fontFamily: FONT.publicSansBold },
  transactionList: { borderRadius: 8, overflow: 'hidden', backgroundColor: COLORS.surfaceLowest, ...shadow },
  transactionRow: { padding: 16, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  transactionCopy: { flex: 1, minWidth: 0 },
  transactionTitle: { color: COLORS.onSurface, fontFamily: FONT.publicSansSemiBold },
  transactionDetail: { color: COLORS.onSurfaceVariant, fontFamily: FONT.publicSansSemiBold, marginTop: 2 },
  transactionValueBlock: { maxWidth: '40%', alignItems: 'flex-end' },
  transactionValue: { color: COLORS.primary, fontFamily: FONT.publicSansBold, textAlign: 'right' },
  paidRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  paidText: { color: COLORS.secondary, fontFamily: FONT.publicSansSemiBold, textAlign: 'right' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: COLORS.surfaceContainer },
  policyCard: { gap: 12 },
  policyStack: { gap: 10 },
  policyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  policyIcon: { width: 28, height: 28, borderRadius: 4, marginTop: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surfaceLow },
  policyCopy: { flex: 1 },
  policyTitle: { color: COLORS.onSurface, fontFamily: FONT.publicSansMedium, fontWeight: '500' },
  policyDescription: { color: COLORS.onSurfaceVariant, fontFamily: FONT.publicSansRegular },
  ctaStack: { gap: 8, paddingBottom: 4 },
  primaryCta: { height: 48, borderRadius: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primaryContainer, ...shadow },
  primaryCtaText: { color: COLORS.onPrimary, fontFamily: FONT.publicSansSemiBold },
  secondaryCta: { height: 48, borderRadius: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.surfaceLowest, ...shadow },
  secondaryCtaText: { color: COLORS.primary, fontFamily: FONT.publicSansSemiBold },
  pressed: { opacity: 0.68 },
  ctaPressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: COLORS.surfaceScrim },
  sheet: { width: '100%', maxWidth: 430, alignSelf: 'center', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, gap: 12, backgroundColor: COLORS.surfaceLowest },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  sheetTitle: { color: COLORS.primary, fontFamily: FONT.manropeSemiBold },
  sheetSubtitle: { color: COLORS.onSurfaceVariant, fontFamily: FONT.publicSansSemiBold },
  sheetClose: { width: 32, height: 32, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surfaceContainer },
  fieldGroup: { gap: 8 },
  fieldLabel: { color: COLORS.onSurface, fontFamily: FONT.publicSansMedium },
  commodityRow: { flexDirection: 'row', gap: 8 },
  commodityChip: { flex: 1, minHeight: 42, borderRadius: 4, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4, backgroundColor: COLORS.surfaceContainer },
  commodityChipSelected: { backgroundColor: COLORS.secondaryContainer },
  commodityText: { color: COLORS.onSurface, fontFamily: FONT.publicSansMedium, flexShrink: 1 },
  commodityTextSelected: { color: COLORS.onSecondaryContainer },
  inputHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  availableText: { color: COLORS.secondary, fontFamily: FONT.publicSansSemiBold, flexShrink: 1, textAlign: 'right' },
  inputWrap: { height: 48, borderRadius: 4, justifyContent: 'center', backgroundColor: COLORS.surfaceContainer },
  weightInput: { height: 48, paddingHorizontal: 12, paddingRight: 48, color: COLORS.onSurface, fontFamily: FONT.publicSansBold, fontSize: 18, lineHeight: 24 },
  inputUnit: { position: 'absolute', right: 14, color: COLORS.outline, fontFamily: FONT.publicSansSemiBold },
  estimateCard: { minHeight: 60, borderRadius: 4, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, backgroundColor: COLORS.surfaceLow },
  estimateValue: { color: COLORS.primary, fontFamily: FONT.publicSansBold },
  currentBadge: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: COLORS.gainContainer },
  sheetActions: { flexDirection: 'row', gap: 8, paddingTop: 8 },
  cancelButton: { flex: 1, height: 48, borderRadius: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surfaceContainer },
  cancelText: { color: COLORS.onSurfaceVariant, fontFamily: FONT.publicSansSemiBold },
  submitButton: { flex: 2, height: 48, borderRadius: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.primary },
  submitText: { color: COLORS.onPrimary, fontFamily: FONT.publicSansSemiBold },
});
