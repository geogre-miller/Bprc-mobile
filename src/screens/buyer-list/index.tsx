import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, Radius } from '@/constants/theme';

import { Icon, type IconName } from '../home-dashboard/icons';

import { BUYER_DIRECTORY_FONTS, useBuyerDirectoryFonts } from './fonts';

const COLORS = {
  background: '#F6FBF5',
  surface: '#FFFFFF',
  surfaceLow: '#F0F5F0',
  surfaceContainer: '#EBEFEA',
  surfaceHigh: '#E5E9E4',
  onSurface: '#181D1A',
  onSurfaceVariant: '#414844',
  outline: '#717973',
  primary: '#012D1D',
  primaryContainer: '#1B4332',
  secondary: '#2C694E',
  secondaryContainer: '#AEEECB',
  secondaryFixed: '#B1F0CE',
  onSecondaryContainer: '#316E52',
  onSecondaryFixedVariant: '#0E5138',
  tertiaryCopy: '#6E3900',
  tertiaryFixed: '#FFDCC3',
  error: '#BA1A1A',
  inverseSurface: '#2C322E',
  inverseOnSurface: '#EDF2ED',
} as const;

type Price = {
  label: string;
  value: string;
  note: string;
  noteTone?: 'positive' | 'muted';
  badge?: string;
};

type BuyerDirectoryCard = {
  id: 'b1' | 'b2' | 'b3';
  name: string;
  verified: boolean;
  verificationIcon: IconName;
  rating: string;
  metadata: string[];
  badge: string;
  badgeTone: 'green' | 'orange' | 'neutral';
  trust?: string;
  trustIcon?: IconName;
  trustTone?: 'green' | 'orange';
  prices: [Price, Price];
  addressIcon: IconName;
  address: string;
  distance: string;
  policyIcon: IconName;
  policy: string;
  phone: string;
  callLabel: string;
  quote?: boolean;
  productTags: string[];
  distanceKm: number;
};

const BUYER_CARDS: BuyerDirectoryCard[] = [
  {
    id: 'b1',
    name: 'Đại lý Nông Sản Toàn Thắng',
    verified: true,
    verificationIcon: 'verified',
    rating: '4.9',
    metadata: ['48 lượt đánh giá'],
    badge: 'Đã chốt 4 vụ',
    badgeTone: 'green',
    trust: 'Bạn đã bán thành công 14.2 tấn với đại lý này',
    trustIcon: 'handshake',
    trustTone: 'green',
    prices: [
      { label: 'Cà phê nhân xô (Xô đẹp)', value: '119,200', note: '+1,200₫ so với hôm qua', noteTone: 'positive' },
      { label: 'Tiêu đen khô (Dung trọng 550)', value: '148,500', note: 'Ổn định', noteTone: 'muted' },
    ],
    addressIcon: 'pin_drop',
    address: 'Km 14, Quốc lộ 14, TX. Buôn Hồ',
    distance: '(Cách bạn 3.8 km)',
    policyIcon: 'payments',
    policy: 'Tiền mặt / Chuyển khoản trong 5 phút. Xe bốc tận vườn.',
    phone: '0914829102',
    callLabel: '0914.829.xxx',
    productTags: ['coffee', 'pepper'],
    distanceKm: 3.8,
  },
  {
    id: 'b2',
    name: 'HTX Cà Phê Bền Vững Ea Tu',
    verified: true,
    verificationIcon: 'workspace_premium',
    rating: '4.8',
    metadata: ['82 nông hộ liên kết', 'Uy tín 6 năm'],
    badge: 'Xuất khẩu & OCOP',
    badgeTone: 'orange',
    trust: 'Ưu tiên thu mua quả chín cây tự nhiên, bảo trợ giá sàn 1 năm',
    trustIcon: 'local_florist',
    trustTone: 'orange',
    prices: [
      { label: 'Hái chín > 90%', value: '122,000', note: '+3,500₫ chênh lệch', noteTone: 'positive', badge: 'Cộng thưởng' },
      { label: 'Robusta Tiêu Chuẩn', value: '118,500', note: 'Nhân sàn 16/18', noteTone: 'muted' },
    ],
    addressIcon: 'location_on',
    address: 'Xã Ea Tu, TP. Buôn Ma Thuột',
    distance: '(Cách bạn 8.2 km)',
    policyIcon: 'fact_check',
    policy: 'Hợp đồng bao tiêu dài hạn, tạm ứng trước phân bón hữu cơ.',
    phone: '0943187291',
    callLabel: 'Gọi HTX Ea Tu',
    quote: true,
    productTags: ['coffee'],
    distanceKm: 8.2,
  },
  {
    id: 'b3',
    name: 'Kho Nông Sản XK An Phát',
    verified: true,
    verificationIcon: 'verified',
    rating: '4.7',
    metadata: ['Thương vụ lớn (> 2 tấn)'],
    badge: 'Thu mua số lượng',
    badgeTone: 'neutral',
    prices: [
      { label: 'Sầu riêng Dona (Loại 1)', value: '107,000', note: 'Hái theo lứa cắt', noteTone: 'muted' },
      { label: 'Sầu riêng Ri6 (Loại A)', value: '89,000', note: 'Cần 15 tấn gấp', noteTone: 'positive' },
    ],
    addressIcon: 'place',
    address: 'Huyện Krông Pắk, Đắk Lắk',
    distance: '(Cách bạn 14.5 km)',
    policyIcon: 'local_shipping',
    policy: 'Điều đội xe container & thợ cắt chuyên nghiệp đến tận lô.',
    phone: '0905112233',
    callLabel: 'Gọi An Phát',
    productTags: ['durian'],
    distanceKm: 14.5,
  },
];

type FilterSheetKind = 'product' | 'radius' | 'advanced';

function FontText({ children, style, type = 'bodySm', ...props }: React.ComponentProps<typeof ThemedText>) {
  return (
    <ThemedText {...props} type={type} style={[{ fontFamily: BUYER_DIRECTORY_FONTS.publicSansRegular }, style]}>
      {children}
    </ThemedText>
  );
}

function BuyerDirectoryHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.brand}>
        <Image
          source={require('@/assets/images/nongsan-pro-logo.png')}
          contentFit="contain"
          accessibilityLabel="Logo NôngSản Pro"
          style={styles.logo}
        />
        <View style={styles.brandCopy}>
          <FontText type="titleMd" style={styles.brandTitle} numberOfLines={1}>NôngSản Pro</FontText>
          <View style={styles.regionRow}>
            <Icon name="location_on" size={14} color={COLORS.secondary} />
            <FontText type="labelSm" style={styles.regionText} numberOfLines={1}>Tây Nguyên • Đắk Lắk</FontText>
          </View>
        </View>
      </View>
      <View style={styles.headerActions}>
        <Link href="/alerts" asChild>
          <Pressable accessibilityRole="button" accessibilityLabel="Thông báo" style={styles.touchTarget}>
            <View style={styles.notificationButton}>
              <Icon name="notifications" size={22} color={COLORS.onSurfaceVariant} />
              <View style={styles.notificationDot} />
            </View>
          </Pressable>
        </Link>
        <Link href="/account" asChild>
          <Pressable accessibilityRole="button" accessibilityLabel="Mở trang cá nhân" style={styles.avatarButton}>
            <Image source={require('@/assets/images/nongsan-pro-profile.png')} contentFit="cover" accessibilityLabel="Ảnh đại diện" style={styles.avatar} />
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

function Chip({ children, selected, icon, onPress, accessibilityLabel, tone = 'default' }: {
  children: string;
  selected?: boolean;
  icon?: IconName;
  onPress: () => void;
  accessibilityLabel?: string;
  tone?: 'default' | 'orange';
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? children}
      accessibilityState={{ selected: Boolean(selected) }}
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [styles.filterChip, selected ? styles.filterChipSelected : styles.filterChipIdle, tone === 'orange' && !selected && styles.filterChipOrange, pressed && styles.pressed]}>
      {icon && <Icon name={icon} size={16} color={selected ? '#FFFFFF' : tone === 'orange' ? COLORS.tertiaryCopy : COLORS.secondary} />}
      <FontText type="labelMd" style={[styles.filterChipText, { color: selected ? '#FFFFFF' : COLORS.onSurfaceVariant }]}>{children}</FontText>
      {!icon && <Icon name="expand_more" size={16} color={selected ? '#FFFFFF' : COLORS.onSurfaceVariant} />}
    </Pressable>
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

function PriceWell({ price }: { price: Price }) {
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

function BuyerCard({ buyer, onQuote }: { buyer: BuyerDirectoryCard; onQuote: (buyerName: string) => void }) {
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
            <View style={styles.ratingRow}><Icon name="star" size={16} color="#F48C24" /><FontText type="labelMd" style={styles.ratingText}>{buyer.rating}</FontText></View>
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
          <Icon name={buyer.trustIcon} size={18} color={buyer.trustTone === 'orange' ? '#F48C24' : COLORS.secondary} />
          <FontText type="bodySm" numberOfLines={1} style={styles.trustText}>
            {buyer.id === 'b1' ? <>Bạn đã bán thành công <FontText type="bodySm" style={styles.trustStrong}>14.2 tấn</FontText> với đại lý này</> : buyer.trust}
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
            <Icon name="call" size={18} color="#FFFFFF" /><FontText type="titleMd" numberOfLines={1} style={styles.callButtonText}>{buyer.callLabel}</FontText>
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
  const insets = useSafeAreaInsets();
  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalRoot}>
        <Pressable accessibilityLabel="Đóng bộ lọc" style={styles.modalBackdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: 20 + insets.bottom }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}><FontText type="headlineSm" style={styles.sheetTitle}>{title}</FontText><Pressable accessibilityRole="button" accessibilityLabel="Đóng bộ lọc" hitSlop={2} onPress={onClose} style={styles.sheetClose}><Icon name="close" size={20} color={COLORS.onSurfaceVariant} /></Pressable></View>
          {kind === 'product' && <View style={styles.optionList}>{[['all', 'Tất cả mặt hàng'], ['coffee', 'Cà phê Robusta'], ['pepper', 'Tiêu đen'], ['durian', 'Sầu riêng']].map(([value, label]) => {
            const selected = value === 'all' ? productFilter == null : productFilter === value;
            return <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => { onProductChange(value === 'all' ? null : value); onClose(); }} style={[styles.option, selected && styles.optionSelected]}><FontText type="bodySm" style={styles.optionText}>{label}</FontText>{selected && <Icon name="check_circle" size={20} color={COLORS.secondary} />}</Pressable>;
          })}</View>}
          {kind === 'radius' && <View style={styles.optionList}>{[[null, 'Tất cả khu vực'], [15, 'Bán kính: < 15km'], [10, 'Bán kính: < 10km']].map(([value, label]) => {
            const selected = value === radiusFilter;
            return <Pressable key={String(value)} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => { onRadiusChange(value as number | null); onClose(); }} style={[styles.option, selected && styles.optionSelected]}><FontText type="bodySm" style={styles.optionText}>{label}</FontText>{selected && <Icon name="check_circle" size={20} color={COLORS.secondary} />}</Pressable>;
          })}</View>}
          {kind === 'advanced' && <View style={styles.optionList}>
            <Pressable accessibilityRole="button" accessibilityState={{ selected: verifiedOnly }} onPress={() => onVerifiedChange(!verifiedOnly)} style={[styles.option, verifiedOnly && styles.optionSelected]}><View style={styles.optionLabel}><Icon name="check_circle" size={20} color={COLORS.secondary} /><FontText type="bodySm" style={styles.optionText}>Đã xác thực</FontText></View>{verifiedOnly && <Icon name="check_circle" size={20} color={COLORS.secondary} />}</Pressable>
            <Pressable accessibilityRole="button" accessibilityState={{ selected: highestPrice }} onPress={() => onHighestPriceChange(!highestPrice)} style={[styles.option, highestPrice && styles.optionSelected]}><View style={styles.optionLabel}><Icon name="trending_up" size={20} color={COLORS.tertiaryCopy} /><FontText type="bodySm" style={styles.optionText}>Giá cao nhất</FontText></View>{highestPrice && <Icon name="check_circle" size={20} color={COLORS.secondary} />}</Pressable>
            <Pressable accessibilityRole="button" onPress={onReset} style={styles.resetOption}><FontText type="labelMd" style={styles.resetText}>Xóa tất cả bộ lọc</FontText></Pressable>
          </View>}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function QuotationSheet({ buyerName, onClose, onSubmit }: { buyerName: string; onClose: () => void; onSubmit: () => void }) {
  const [commodity, setCommodity] = useState('Cà phê Robusta xô chín (Đã phơi giàn)');
  const [quantity, setQuantity] = useState('');
  const [desiredPrice, setDesiredPrice] = useState('');
  const [note, setNote] = useState('');
  const [commodityOptionsOpen, setCommodityOptionsOpen] = useState(false);
  const options = ['Cà phê Robusta xô chín (Đã phơi giàn)', 'Cà phê Robusta tươi (Hái xô)', 'Tiêu đen chuẩn xuất khẩu', 'Sầu riêng Dona cắt vườn'];
  const insets = useSafeAreaInsets();

  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalRoot}>
        <Pressable accessibilityLabel="Đóng cửa sổ báo giá" style={styles.modalBackdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: 20 + insets.bottom }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <View style={styles.sheetTitleCopy}><FontText type="labelSm" style={styles.quotationEyebrow}>CHÀO HÀNG TRỰC TIẾP</FontText><FontText type="headlineSm" numberOfLines={2} style={styles.sheetTitle}>{buyerName}</FontText></View>
            <Pressable accessibilityRole="button" accessibilityLabel="Đóng báo giá" hitSlop={2} onPress={onClose} style={styles.sheetClose}><Icon name="close" size={20} color={COLORS.onSurfaceVariant} /></Pressable>
          </View>
          <ScrollView style={styles.quotationScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <FontText type="labelMd" style={styles.fieldLabel}>Nông sản xuất bán</FontText>
            <Pressable accessibilityRole="button" accessibilityLabel="Chọn nông sản xuất bán" onPress={() => setCommodityOptionsOpen((value) => !value)} style={styles.selectField}><FontText type="bodySm" numberOfLines={1} style={styles.selectText}>{commodity}</FontText><Icon name="expand_more" size={20} color={COLORS.outline} /></Pressable>
            {commodityOptionsOpen && <View style={styles.selectOptions}>{options.map((option) => <Pressable key={option} accessibilityRole="button" onPress={() => { setCommodity(option); setCommodityOptionsOpen(false); }} style={styles.selectOption}><FontText type="bodySm" style={styles.optionText}>{option}</FontText></Pressable>)}</View>}
            <View style={styles.formGrid}>
              <View style={styles.formFieldHalf}><FontText type="labelMd" style={styles.fieldLabel}>Ước tính sản lượng</FontText><View style={styles.inputWithSuffix}><TextInput accessibilityLabel="Ước tính sản lượng" keyboardType="decimal-pad" onChangeText={setQuantity} placeholder="3.5" placeholderTextColor={COLORS.outline} style={styles.formInput} value={quantity} /><FontText type="labelMd" style={styles.inputSuffix}>Tấn</FontText></View></View>
              <View style={styles.formFieldHalf}><FontText type="labelMd" style={styles.fieldLabel}>Giá bạn mong muốn</FontText><View style={styles.inputWithSuffix}><TextInput accessibilityLabel="Giá bạn mong muốn" keyboardType="number-pad" onChangeText={setDesiredPrice} placeholder="121,000" placeholderTextColor={COLORS.outline} style={styles.formInput} value={desiredPrice} /><FontText type="labelSm" style={styles.inputSuffix}>₫/kg</FontText></View></View>
            </View>
            <FontText type="labelMd" style={styles.fieldLabel}>Ghi chú thêm</FontText>
            <TextInput accessibilityLabel="Ghi chú thêm" onChangeText={setNote} placeholder="Vườn cách đường lớn 200m, xe tải 8T vào được..." placeholderTextColor={COLORS.outline} style={styles.noteInput} value={note} />
          </ScrollView>
          <View style={styles.modalActions}><Pressable accessibilityRole="button" onPress={onClose} style={styles.cancelButton}><FontText type="titleMd" style={styles.cancelButtonText}>Hủy</FontText></Pressable><Pressable accessibilityRole="button" onPress={onSubmit} style={styles.submitButton}><Icon name="send" size={18} color="#FFFFFF" /><FontText type="titleMd" style={styles.submitButtonText}>Gửi ngay</FontText></Pressable></View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function TrustPanel({ onReport, onPolicy }: { onReport: () => void; onPolicy: () => void }) {
  return (
    <View style={styles.trustPanel}>
      <View style={styles.trustPanelHeading}><Icon name="verified" size={22} color={COLORS.secondary} /><FontText type="titleMd" style={styles.trustPanelTitle}>Cam kết từ sàn NôngSản Pro</FontText></View>
      <FontText type="bodySm" style={styles.trustPanelBody}>100% thương lái và đại lý trong danh bạ đều được đối soát căn cước công dân, giấy đăng ký kinh doanh và ký quỹ bảo chứng giao dịch với hiệp hội địa phương.</FontText>
      <View style={styles.trustPanelLinks}><Pressable accessibilityRole="button" hitSlop={6} onPress={onReport} style={styles.inlineLink}><FontText type="labelMd" style={styles.inlineLinkText}>Báo cáo sai phạm giá</FontText><Icon name="open_in_new" size={14} color={COLORS.secondary} /></Pressable><FontText type="bodySm" style={styles.linkSeparator}>•</FontText><Pressable accessibilityRole="button" hitSlop={8} onPress={onPolicy}><FontText type="labelMd" style={styles.policyLinkText}>Điều khoản thu mua</FontText></Pressable></View>
    </View>
  );
}

export function BuyerList() {
  const fontsReady = useBuyerDirectoryFonts();
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
    const filtered = BUYER_CARDS.filter((buyer) => {
      const buyerText = [buyer.name, buyer.badge, buyer.trust, buyer.address, buyer.distance, buyer.policy, ...buyer.metadata, ...buyer.prices.flatMap((price) => [price.label, price.value, price.note])].filter(Boolean).join(' ').toLocaleLowerCase('vi');
      return (!needle || buyerText.includes(needle)) && (!productFilter || buyer.productTags.includes(productFilter)) && (radiusFilter == null || buyer.distanceKm < radiusFilter) && (!verifiedOnly || buyer.verified);
    });
    if (!highestPrice) return filtered;
    const maxPrice = (buyer: BuyerDirectoryCard) => Math.max(...buyer.prices.map((price) => Number(price.value.replace(/,/g, ''))));
    return [...filtered].sort((a, b) => maxPrice(b) - maxPrice(a));
  }, [highestPrice, productFilter, query, radiusFilter, verifiedOnly]);

  const filtersActive = Boolean(query.trim() || productFilter || radiusFilter || verifiedOnly || highestPrice);
  const showToast = (message: string) => { setToast(message); setTimeout(() => setToast(null), 2800); };
  const reportIssue = () => Alert.alert('Báo cáo sai phạm', 'Cảm ơn bạn. Đội ngũ NôngSản Pro sẽ kiểm tra thông tin này.');
  const showPolicy = () => Alert.alert('Điều khoản thu mua', 'Điều khoản thu mua và bảo vệ giao dịch sẽ được cập nhật trong phiên bản tiếp theo.');

  if (!fontsReady) return <SafeAreaView style={styles.loadingScreen} edges={['top']} />;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.shell}>
        <BuyerDirectoryHeader />
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.titleRow}><View style={styles.titleCopy}><Icon name="verified_user" size={22} color={COLORS.secondary} /><FontText type="headlineSm" style={styles.screenTitle}>Thương lái & Đại lý thu mua</FontText></View><View style={styles.openBadge}><View style={styles.openDot} /><FontText type="labelSm" style={styles.openBadgeText}>38 đại lý mở kho</FontText></View></View>
          <View style={styles.searchRow}>
            <View style={styles.searchField}><Icon name="search" size={20} color={COLORS.outline} /><TextInput accessibilityLabel="Tìm kiếm đại lý" onChangeText={setQuery} placeholder="Tìm tên đại lý, thương lái, HTX..." placeholderTextColor={COLORS.outline} returnKeyType="search" style={styles.searchInput} value={query} />{query.length > 0 && <Pressable accessibilityRole="button" accessibilityLabel="Xóa tìm kiếm" hitSlop={10} onPress={() => setQuery('')} style={styles.clearButton}><Icon name="close" size={16} color={COLORS.onSurfaceVariant} /></Pressable>}</View>
            <Pressable accessibilityRole="button" accessibilityLabel="Bộ lọc chuyên sâu" onPress={() => setSheet('advanced')} style={styles.filterButton}><Icon name="tune" size={20} color={filtersActive ? COLORS.secondary : COLORS.onSurface} /><View style={[styles.filterDot, !filtersActive && styles.hiddenDot]} /></Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow} style={styles.filterScroll}>
            <Chip onPress={() => setSheet('product')} selected>{productFilter === 'pepper' ? 'Tiêu đen' : productFilter === 'durian' ? 'Sầu riêng' : 'Cà phê Robusta'}</Chip>
            <Chip onPress={() => setSheet('radius')} selected={Boolean(radiusFilter)}>{radiusFilter ? `Bán kính: < ${radiusFilter}km` : 'Bán kính: < 15km'}</Chip>
            <Chip onPress={() => setVerifiedOnly((value) => !value)} selected={verifiedOnly} icon="check_circle">Đã xác thực</Chip>
            <Chip onPress={() => setHighestPrice((value) => !value)} selected={highestPrice} icon="trending_up" tone="orange">Giá cao nhất</Chip>
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
  header: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(27,67,50,0.12)', shadowColor: '#1B4332', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  logo: { width: 32, height: 32 },
  brandCopy: { flexShrink: 1 },
  brandTitle: { color: COLORS.primary, fontFamily: BUYER_DIRECTORY_FONTS.publicSansSemiBold, lineHeight: 22 },
  regionRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  regionText: { color: COLORS.onSurfaceVariant, fontFamily: BUYER_DIRECTORY_FONTS.publicSansSemiBold },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  touchTarget: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  notificationButton: { width: 44, height: 44, borderRadius: Radius.container, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surfaceLow },
  notificationDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, borderWidth: 2, borderColor: COLORS.background, backgroundColor: COLORS.error },
  avatarButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 32, height: 32, borderRadius: Radius.full, shadowColor: '#1B4332', shadowOpacity: 0.1, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: BottomTabInset + 88, gap: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  titleCopy: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  screenTitle: { flex: 1, color: COLORS.onSurface, fontFamily: BUYER_DIRECTORY_FONTS.manropeSemiBold, fontSize: 18, lineHeight: 24, letterSpacing: -0.09 },
  openBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, backgroundColor: COLORS.secondaryFixed, maxWidth: 130 },
  openDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.secondary },
  openBadgeText: { color: COLORS.onSecondaryFixedVariant, fontFamily: BUYER_DIRECTORY_FONTS.publicSansSemiBold },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchField: { flex: 1, height: 44, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, borderRadius: Radius.container, backgroundColor: COLORS.surface, shadowColor: '#1B4332', shadowOpacity: 0.04, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  searchInput: { flex: 1, minWidth: 0, padding: 0, color: COLORS.onSurface, fontFamily: BUYER_DIRECTORY_FONTS.publicSansRegular, fontSize: 14, lineHeight: 20 },
  clearButton: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surfaceContainer },
  filterButton: { width: 44, height: 44, borderRadius: Radius.container, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface, shadowColor: '#1B4332', shadowOpacity: 0.04, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  filterDot: { position: 'absolute', width: 6, height: 6, top: 10, right: 10, borderRadius: 3, backgroundColor: COLORS.secondary },
  hiddenDot: { opacity: 0 },
  filterScroll: { marginHorizontal: -16 },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 2 },
  filterChip: { height: 36, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, borderRadius: Radius.full, shadowColor: '#1B4332', shadowOpacity: 0.04, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  filterChipText: { fontFamily: BUYER_DIRECTORY_FONTS.publicSansMedium },
  filterChipSelected: { backgroundColor: COLORS.secondary },
  filterChipIdle: { backgroundColor: COLORS.surface },
  filterChipOrange: { backgroundColor: COLORS.surface },
  safetyTip: { position: 'relative', flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14, borderRadius: Radius.container, backgroundColor: COLORS.surfaceLow, overflow: 'hidden', shadowColor: '#1B4332', shadowOpacity: 0.03, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  safetyIconWell: { width: 32, height: 32, marginTop: 2, borderRadius: Radius.container, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.secondaryContainer },
  safetyCopy: { flex: 1, minWidth: 0, gap: 2 },
  safetyHeadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  safetyHeading: { color: COLORS.secondary, fontFamily: BUYER_DIRECTORY_FONTS.publicSansBold, textTransform: 'uppercase', letterSpacing: 0.44 },
  safetyDate: { color: 'rgba(65,72,68,0.8)', fontFamily: BUYER_DIRECTORY_FONTS.publicSansRegular },
  safetyBody: { color: COLORS.onSurface, fontFamily: BUYER_DIRECTORY_FONTS.publicSansRegular },
  buyerList: { gap: 12 },
  buyerCard: { position: 'relative', overflow: 'hidden', padding: 16, borderRadius: Radius.container, backgroundColor: COLORS.surface, shadowColor: '#1B4332', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  cardTopRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 10 },
  cardHeading: { flex: 1, minWidth: 0 },
  buyerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 0 },
  buyerName: { flex: 1, minWidth: 0, color: COLORS.primary, fontFamily: BUYER_DIRECTORY_FONTS.publicSansBold, fontSize: 15, lineHeight: 22 },
  metadataRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2, minWidth: 0 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { color: COLORS.tertiaryCopy, fontFamily: BUYER_DIRECTORY_FONTS.publicSansSemiBold },
  metadataSeparator: { color: COLORS.outline },
  metadataItem: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  metadataText: { color: COLORS.onSurfaceVariant, fontFamily: BUYER_DIRECTORY_FONTS.publicSansRegular },
  secondaryMetadata: { color: COLORS.secondary, fontFamily: BUYER_DIRECTORY_FONTS.publicSansMedium },
  cardBadge: { flexShrink: 1, maxWidth: 108, paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.base, fontFamily: BUYER_DIRECTORY_FONTS.publicSansSemiBold, textAlign: 'center' },
  greenBadge: { color: COLORS.onSecondaryFixedVariant, backgroundColor: COLORS.secondaryFixed },
  orangeBadge: { color: COLORS.tertiaryCopy, backgroundColor: COLORS.tertiaryFixed },
  neutralBadge: { color: COLORS.onSurfaceVariant, backgroundColor: COLORS.surfaceContainer },
  trustStrip: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 32, marginBottom: 12, paddingHorizontal: 8, paddingVertical: 6, borderRadius: Radius.container, backgroundColor: COLORS.surfaceLow },
  trustText: { flex: 1, minWidth: 0, color: COLORS.onSurfaceVariant, fontFamily: BUYER_DIRECTORY_FONTS.publicSansRegular },
  trustStrong: { fontFamily: BUYER_DIRECTORY_FONTS.publicSansBold, color: COLORS.onSurfaceVariant },
  priceGrid: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  priceWell: { flex: 1, minWidth: 0, minHeight: 92, padding: 10, borderRadius: Radius.container, backgroundColor: COLORS.surfaceLow },
  priceLabelRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 4, minHeight: 28 },
  priceLabel: { flex: 1, color: COLORS.onSurfaceVariant, fontFamily: BUYER_DIRECTORY_FONTS.publicSansSemiBold },
  priceBadge: { color: COLORS.onSecondaryContainer, backgroundColor: COLORS.secondaryContainer, paddingHorizontal: 4, borderRadius: 2, fontFamily: BUYER_DIRECTORY_FONTS.publicSansSemiBold, fontSize: 10, lineHeight: 14 },
  priceValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 4 },
  priceValue: { color: COLORS.primary, fontFamily: BUYER_DIRECTORY_FONTS.publicSansBold, fontVariant: ['tabular-nums'], letterSpacing: -0.18 },
  priceUnit: { color: COLORS.onSurfaceVariant, fontFamily: BUYER_DIRECTORY_FONTS.publicSansRegular },
  priceNote: { marginTop: 2, fontFamily: BUYER_DIRECTORY_FONTS.publicSansSemiBold },
  positiveText: { color: COLORS.secondary },
  mutedText: { color: COLORS.onSurfaceVariant, fontFamily: BUYER_DIRECTORY_FONTS.publicSansRegular },
  detailStack: { gap: 6, marginBottom: 14 },
  detailLine: { flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 0 },
  detailText: { flex: 1, minWidth: 0, color: COLORS.onSurfaceVariant, fontFamily: BUYER_DIRECTORY_FONTS.publicSansRegular },
  distanceText: { flexShrink: 0, maxWidth: '45%', color: COLORS.primary, fontFamily: BUYER_DIRECTORY_FONTS.publicSansSemiBold },
  ctaGrid: { flexDirection: 'row', alignItems: 'stretch', gap: 8, paddingTop: 4 },
  ctaCell: { flex: 1, minWidth: 0, height: 44 },
  callButton: { width: '100%', height: 44, minWidth: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 8, borderRadius: Radius.container, backgroundColor: COLORS.primaryContainer, shadowColor: '#1B4332', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  callButtonText: { flexShrink: 1, color: '#FFFFFF', fontFamily: BUYER_DIRECTORY_FONTS.publicSansSemiBold },
  secondaryButton: { width: '100%', height: 44, minWidth: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 8, borderRadius: Radius.container, backgroundColor: COLORS.surfaceContainer, shadowColor: '#1B4332', shadowOpacity: 0.04, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  secondaryButtonText: { color: COLORS.onSurface, fontFamily: BUYER_DIRECTORY_FONTS.publicSansSemiBold },
  emptyState: { minHeight: 72, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.container, backgroundColor: COLORS.surface },
  emptyStateText: { color: COLORS.onSurfaceVariant },
  trustPanel: { gap: 8, marginBottom: 8, padding: 16, borderRadius: Radius.container, backgroundColor: COLORS.surfaceHigh },
  trustPanelHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trustPanelTitle: { color: COLORS.primary, fontFamily: BUYER_DIRECTORY_FONTS.publicSansBold },
  trustPanelBody: { color: COLORS.onSurfaceVariant, fontFamily: BUYER_DIRECTORY_FONTS.publicSansRegular },
  trustPanelLinks: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 1 },
  inlineLink: { minHeight: 32, flexDirection: 'row', alignItems: 'center', gap: 4 },
  inlineLinkText: { color: COLORS.secondary, fontFamily: BUYER_DIRECTORY_FONTS.publicSansSemiBold },
  linkSeparator: { color: COLORS.outline },
  policyLinkText: { color: COLORS.onSurfaceVariant, fontFamily: BUYER_DIRECTORY_FONTS.publicSansMedium },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(1,45,29,0.28)' },
  sheet: { width: '100%', maxWidth: 430, maxHeight: '92%', alignSelf: 'center', padding: 20, borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: COLORS.surface, shadowColor: '#1B4332', shadowOpacity: 0.16, shadowRadius: 16, shadowOffset: { width: 0, height: -4 }, elevation: 8 },
  sheetHandle: { width: 40, height: 4, alignSelf: 'center', marginBottom: 12, borderRadius: 2, backgroundColor: COLORS.outline, opacity: 0.45 },
  sheetHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 },
  sheetTitleCopy: { flex: 1, gap: 4 },
  sheetTitle: { color: COLORS.primary, fontFamily: BUYER_DIRECTORY_FONTS.manropeBold },
  quotationEyebrow: { color: COLORS.secondary, fontFamily: BUYER_DIRECTORY_FONTS.publicSansBold, letterSpacing: 0.6 },
  sheetClose: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.full, backgroundColor: COLORS.surfaceContainer },
  optionList: { gap: 8 },
  option: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingHorizontal: 12, borderRadius: Radius.container, backgroundColor: COLORS.surfaceLow },
  optionSelected: { backgroundColor: '#E8F1EC' },
  optionLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  optionText: { color: COLORS.onSurface },
  resetOption: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 },
  resetText: { color: COLORS.error, fontFamily: BUYER_DIRECTORY_FONTS.publicSansSemiBold },
  quotationScroll: { flexGrow: 0, maxHeight: 420, marginBottom: 12 },
  fieldLabel: { marginBottom: 4, color: COLORS.onSurface, fontFamily: BUYER_DIRECTORY_FONTS.publicSansSemiBold },
  selectField: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingHorizontal: 12, borderRadius: Radius.container, backgroundColor: COLORS.surfaceLow },
  selectText: { flex: 1, color: COLORS.onSurface },
  selectOptions: { gap: 4, marginTop: 4, padding: 4, borderRadius: Radius.container, backgroundColor: COLORS.surfaceLow },
  selectOption: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 8, borderRadius: Radius.base },
  formGrid: { flexDirection: 'row', gap: 8, marginTop: 12 },
  formFieldHalf: { flex: 1, minWidth: 0 },
  inputWithSuffix: { minHeight: 44, flexDirection: 'row', alignItems: 'center', borderRadius: Radius.container, backgroundColor: COLORS.surfaceLow },
  formInput: { flex: 1, minWidth: 0, height: 44, paddingHorizontal: 12, paddingVertical: 0, color: COLORS.onSurface, fontFamily: BUYER_DIRECTORY_FONTS.publicSansSemiBold, fontSize: 14 },
  inputSuffix: { paddingRight: 10, color: COLORS.onSurfaceVariant, fontFamily: BUYER_DIRECTORY_FONTS.publicSansMedium },
  noteInput: { height: 44, marginBottom: 4, paddingHorizontal: 12, paddingVertical: 0, borderRadius: Radius.container, backgroundColor: COLORS.surfaceLow, color: COLORS.onSurface, fontFamily: BUYER_DIRECTORY_FONTS.publicSansRegular, fontSize: 14 },
  modalActions: { flexDirection: 'row', gap: 8, paddingTop: 4 },
  cancelButton: { flex: 1, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.container, backgroundColor: COLORS.surfaceContainer },
  cancelButtonText: { color: COLORS.onSurface, fontFamily: BUYER_DIRECTORY_FONTS.publicSansSemiBold },
  submitButton: { flex: 1, height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: Radius.container, backgroundColor: COLORS.primary },
  submitButtonText: { color: '#FFFFFF', fontFamily: BUYER_DIRECTORY_FONTS.publicSansSemiBold },
  toast: { position: 'absolute', alignSelf: 'center', bottom: BottomTabInset + 16, maxWidth: '92%', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.full, backgroundColor: COLORS.inverseSurface, shadowColor: '#000000', shadowOpacity: 0.16, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 5 },
  toastText: { color: COLORS.inverseOnSurface, fontFamily: BUYER_DIRECTORY_FONTS.publicSansRegular },
  pressed: { opacity: 0.78 },
});
