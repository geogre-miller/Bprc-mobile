import { useMemo, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient, Line, Path, Stop } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { COMMODITIES, PRICE_OBSERVATIONS } from '@/data/mock-data';
import type { Commodity } from '@/types/domain';

import { Icon, type IconName } from '../home-dashboard/icons';

type Timeframe = '1N' | '7N' | '1T' | '3T' | '1Năm';
type BuyerSort = 'price' | 'nearby' | 'verified';

type BuyerCardData = {
  id: string;
  initials: string;
  name: string;
  price: number;
  priceNote: string;
  distance: number;
  verified: boolean;
  badge?: string;
  rating?: number;
  details: { icon: IconName; text: string }[];
  primaryAction: string;
  primaryIcon: IconName;
  secondaryAction: string;
  secondaryIcon: IconName;
};

const SCREEN_COLORS = {
  surface: '#F6FBF5',
  surfaceLowest: '#FFFFFF',
  onSurface: '#181D1A',
  borderSubtle: '#ECEAE4',
  primary: '#012D1D',
  primaryContainer: '#1B4332',
  onPrimary: '#FFFFFF',
  surfaceLow: '#F0F5F0',
  surfaceHigh: '#E5E9E4',
  surfaceHighest: '#DFE4DF',
  secondary: '#2C694E',
  secondaryContainer: '#AEEECB',
  onSecondaryContainer: '#316E52',
  outline: '#717973',
  onSurfaceVariant: '#414844',
  amber: '#F48C24',
} as const;

const TIMEFRAMES: Timeframe[] = ['1N', '7N', '1T', '3T', '1Năm'];

const CHART_DATA: Record<
  Timeframe,
  { path: string; tooltip: string; growth: string; labels: string[]; selectedX: number; selectedY: number }
> = {
  '1N': {
    path: 'M 0 126 C 55 122, 92 116, 130 102 S 215 84, 260 58 S 320 44, 360 28',
    tooltip: '08:45: 118,500 ₫/kg',
    growth: 'Tăng trưởng +2.8%',
    labels: ['06:00', '09:00', '12:00', '15:00', 'Hôm nay'],
    selectedX: 260,
    selectedY: 58,
  },
  '7N': {
    path: 'M 0 134 C 52 126, 95 118, 136 110 S 218 78, 258 67 S 316 54, 360 30',
    tooltip: '03/09: 114,500 ₫/kg',
    growth: 'Tăng trưởng +5.8%',
    labels: ['29/08', '31/08', '02/09', '04/09', 'Hôm nay'],
    selectedX: 258,
    selectedY: 67,
  },
  '1T': {
    path: 'M 0 140 Q 40 135 80 125 T 160 105 T 240 65 T 300 45 T 360 18',
    tooltip: '15/10: 114,000 ₫/kg',
    growth: 'Tăng trưởng +20.9%',
    labels: ['01/10', '08/10', '15/10', '22/10', 'Hôm nay'],
    selectedX: 240,
    selectedY: 65,
  },
  '3T': {
    path: 'M 0 138 C 48 132, 88 142, 128 112 S 206 98, 246 69 S 314 42, 360 20',
    tooltip: '15/08: 107,800 ₫/kg',
    growth: 'Tăng trưởng +23.4%',
    labels: ['01/07', '22/07', '15/08', '08/09', 'Hôm nay'],
    selectedX: 246,
    selectedY: 69,
  },
  '1Năm': {
    path: 'M 0 144 C 45 136, 86 120, 124 127 S 196 93, 238 86 S 305 48, 360 18',
    tooltip: 'Tháng 5: 96,200 ₫/kg',
    growth: 'Tăng trưởng +31.2%',
    labels: ['T9/25', 'T12/25', 'T3/26', 'T6/26', 'Hôm nay'],
    selectedX: 238,
    selectedY: 86,
  },
};

const BUYER_CARDS: BuyerCardData[] = [
  {
    id: 'b1',
    initials: 'TC',
    name: 'Đại lý Nông sản Thành Công',
    price: 119000,
    priceNote: '+500 ₫ thị trường',
    distance: 4.5,
    verified: true,
    rating: 4.9,
    details: [
      { icon: 'location_on', text: "Huyện Cư M'gar (cách 4.5 km)" },
      { icon: 'scale', text: 'Thu mua tối thiểu: 500 kg • Cân điện tử chuẩn' },
    ],
    primaryAction: 'Chốt bán ngay',
    primaryIcon: 'handshake',
    secondaryAction: 'Gọi trực tiếp',
    secondaryIcon: 'call',
  },
  {
    id: 'b2',
    initials: 'TL',
    name: 'HTX Nông nghiệp Tân Lập',
    price: 118500,
    priceNote: 'Bằng giá sàn',
    distance: 7.2,
    verified: false,
    badge: 'Đã bán 3 lần (Đối tác quen)',
    details: [
      { icon: 'local_shipping', text: 'Hỗ trợ xe tải vào bốc tận vườn • Cách 7.2 km' },
      { icon: 'payments', text: 'Chuyển khoản ngay 100% khi cân xong' },
    ],
    primaryAction: 'Xem hồ sơ HTX',
    primaryIcon: 'store',
    secondaryAction: 'Liên hệ Zalo',
    secondaryIcon: 'chat',
  },
];

const STATS = [
  { label: 'Giá cao nhất ngày', value: '119,000', suffix: '₫' },
  { label: 'Giá thấp nhất ngày', value: '115,200', suffix: '₫' },
  { label: 'Giá trung bình', value: '117,800', suffix: '₫' },
  { label: 'Biến động 7 ngày', value: '+6,500', suffix: '(+5.8%)', positive: true },
  { label: 'Biến động 30 ngày', value: '+20,500', suffix: '(+20.9%)', positive: true },
  { label: 'Khối lượng giao dịch', value: '~4,200', suffix: 'tấn' },
];

const formatCommodityPrice = (amount: number) => amount.toLocaleString('en-US');

/** Stitch commodity market detail with live local controls and native navigation. */
export function CommodityDetail({
  commodity,
  commodityLabel,
  currentPrice,
}: {
  commodity?: Commodity;
  commodityLabel?: string;
  currentPrice?: number;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [timeframe, setTimeframe] = useState<Timeframe>('1T');
  const [buyerSort, setBuyerSort] = useState<BuyerSort>('price');
  const label = commodityLabel ?? COMMODITIES.find((item) => item.id === commodity)?.label ?? 'Cà phê';
  const observations = PRICE_OBSERVATIONS.filter((observation) => observation.commodity === commodity).sort(
    (a, b) => b.observedAt.localeCompare(a.observedAt),
  );
  const displayPrice =
    currentPrice ?? (commodity === 'coffee' || !commodity ? 118500 : (observations[0]?.pricePerUnit ?? 118500));
  const chart = CHART_DATA[timeframe];
  const buyers = useMemo(() => {
    const visible = buyerSort === 'verified' ? BUYER_CARDS.filter((buyer) => buyer.verified) : [...BUYER_CARDS];
    return visible.sort((a, b) => (buyerSort === 'nearby' ? a.distance - b.distance : b.price - a.price));
  }, [buyerSort]);

  const goBackToMarket = () => (router.canGoBack() ? router.back() : router.replace('/market'));
  const goToSell = () => router.push('/selling-intents');
  const shareMarket = () =>
    Share.share({
      title: `Giá ${label}`,
      message: `${label} Đắk Lắk đang ở mức ${formatCommodityPrice(displayPrice)} ₫/kg trên NôngSản Pro.`,
    });

  return (
    <View style={styles.screen}>
      <View style={[styles.shell, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image
              accessibilityLabel="Biểu trưng NôngSản Pro"
              source={require('@/assets/images/nongsan-pro-logo.png')}
              resizeMode="contain"
              style={styles.brandLogo}
            />
            <View>
              <ThemedText type="titleMd" style={[styles.brandTitle, { color: SCREEN_COLORS.primary }]}>
                NôngSản Pro
              </ThemedText>
              <View style={styles.inlineRow}>
                <Icon name="location_on" size={14} color={SCREEN_COLORS.secondary} />
                <ThemedText type="labelSm" style={{ color: SCREEN_COLORS.onSurfaceVariant }}>
                  Tây Nguyên • Đắk Lắk
                </ThemedText>
              </View>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Thông báo"
              hitSlop={4}
              onPress={() => router.push('/alerts')}
              style={({ pressed }) => [styles.iconButton, { backgroundColor: SCREEN_COLORS.surfaceLow }, pressed && styles.pressed]}>
              <Icon name="notifications" size={22} color={SCREEN_COLORS.onSurfaceVariant} />
              <View style={styles.notificationDot} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mở trang cá nhân"
              hitSlop={6}
              onPress={() => router.push('/account')}>
              <Image source={require('@/assets/images/nongsan-pro-profile.png')} style={styles.profileImage} />
            </Pressable>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <View style={styles.topNavigation}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Quay lại bảng giá thị trường"
              onPress={goBackToMarket}
              style={({ pressed }) => [styles.backButton, { backgroundColor: SCREEN_COLORS.surfaceLow }, pressed && styles.pressed]}>
              <Icon name="arrow_back" size={20} color={SCREEN_COLORS.primary} />
              <ThemedText type="labelMd" style={[styles.buttonLabel, { color: SCREEN_COLORS.primary }]}>
                Thị Trường
              </ThemedText>
            </Pressable>
            <View style={styles.topActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Chia sẻ thông tin giá"
                onPress={shareMarket}
                style={({ pressed }) => [styles.iconButton, { backgroundColor: SCREEN_COLORS.surfaceLow }, pressed && styles.pressed]}>
                <Icon name="share" size={20} color={SCREEN_COLORS.onSurfaceVariant} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Tạo cảnh báo biến động giá"
                onPress={() => router.push('/alerts')}
                style={({ pressed }) => [styles.iconButton, { backgroundColor: SCREEN_COLORS.surfaceLow }, pressed && styles.pressed]}>
                <Icon name="add_alert" size={20} color={SCREEN_COLORS.onSurfaceVariant} />
                <View style={[styles.alertDot, { borderColor: SCREEN_COLORS.surfaceLow }]} />
              </Pressable>
            </View>
            </View>

          <View style={styles.card}>
            <View style={styles.heroLabelRow}>
              <View style={styles.heroCommodity}>
                <View style={styles.liveDot} />
                <ThemedText type="labelSm" numberOfLines={1} style={styles.uppercaseLabel}>
                  {commodityLabel
                    ? `${commodityLabel.toUpperCase()} ĐẮK LẮK`
                    : commodity === 'coffee' || !commodity
                      ? 'CÀ PHÊ ROBUSTA ĐẮK LẮK'
                      : `${label.toUpperCase()} ĐẮK LẮK`}
                </ThemedText>
              </View>
              <View style={styles.gradeBadge}>
                <ThemedText type="labelSm" style={{ color: SCREEN_COLORS.onSecondaryContainer }}>
                  Nhân xô loại 1
                </ThemedText>
              </View>
            </View>
            <View>
              <View style={styles.priceRow}>
                <ThemedText type="numericHero" style={{ color: SCREEN_COLORS.primary }}>
                  {formatCommodityPrice(displayPrice)}
                </ThemedText>
                <ThemedText type="titleMd" style={{ color: SCREEN_COLORS.onSurfaceVariant }}>
                  ₫/kg
                </ThemedText>
              </View>
              <View style={[styles.inlineRow, styles.changeRow]}>
                <View style={styles.changeBadge}>
                  <Icon name="trending_up" size={16} color={SCREEN_COLORS.onSecondaryContainer} />
                  <ThemedText type="labelMd" style={[styles.buttonLabel, { color: SCREEN_COLORS.onSecondaryContainer }]}>
                    +3,200 ₫ (+2.78%)
                  </ThemedText>
                </View>
                <ThemedText type="bodySm" style={{ color: SCREEN_COLORS.onSurfaceVariant }}>
                  Hôm nay
                </ThemedText>
              </View>
            </View>
            <View style={styles.metadata}>
              <View style={styles.metadataRow}>
                <Icon name="pin_drop" size={16} color={SCREEN_COLORS.secondary} />
                <ThemedText type="bodySm" style={styles.metadataText}>
                  Vùng thu mua: Buôn Ma Thuột, Cư M&apos;gar, Ea H&apos;leo
                </ThemedText>
              </View>
              <View style={styles.metadataRow}>
                <Icon name="schedule" size={15} color={SCREEN_COLORS.onSurfaceVariant} />
                <ThemedText type="labelSm" style={styles.metadataText}>
                  Cập nhật 08:45 • Nguồn: Hiệp hội Cà phê VICOFA
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={[styles.card, styles.chartCard]}>
            <View style={styles.timeframeControl} accessibilityRole="tablist">
              {TIMEFRAMES.map((item) => {
                const selected = item === timeframe;
                return (
                  <Pressable
                    key={item}
                    accessibilityRole="tab"
                    accessibilityLabel={`Khung thời gian ${item}`}
                    accessibilityState={{ selected }}
                    hitSlop={4}
                    onPress={() => setTimeframe(item)}
                    style={({ pressed }) => [
                      styles.timeframeButton,
                      selected && { backgroundColor: SCREEN_COLORS.primaryContainer },
                      pressed && styles.pressed,
                    ]}>
                    <ThemedText
                      type="labelMd"
                      style={[styles.buttonLabel, { color: selected ? SCREEN_COLORS.onPrimary : SCREEN_COLORS.onSurfaceVariant }]}>
                      {item}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.chartHeader}>
              <View style={styles.chartTooltip}>
                <View style={[styles.smallDot, { backgroundColor: SCREEN_COLORS.primaryContainer }]} />
                <ThemedText type="labelSm" accessibilityLiveRegion="polite" style={{ color: SCREEN_COLORS.onSurface }}>
                  {chart.tooltip}
                </ThemedText>
              </View>
              <ThemedText type="labelSm" style={{ color: SCREEN_COLORS.secondary }}>
                {chart.growth}
              </ThemedText>
            </View>
            <View
              accessible
              accessibilityRole="image"
              accessibilityLabel={`${label}, ${chart.tooltip}, ${chart.growth}`}
              style={styles.chartCanvas}>
              <Svg width="100%" height="100%" viewBox="0 0 360 160" preserveAspectRatio="none">
                <Defs>
                  <LinearGradient id="commodityChartGradient" x1="0" x2="0" y1="0" y2="1">
                    <Stop offset="0%" stopColor={SCREEN_COLORS.secondary} stopOpacity={0.28} />
                    <Stop offset="100%" stopColor={SCREEN_COLORS.secondary} stopOpacity={0} />
                  </LinearGradient>
                </Defs>
                {[20, 70, 120].map((y) => (
                  <Line
                    key={y}
                    x1="0"
                    x2="360"
                    y1={y}
                    y2={y}
                    stroke={SCREEN_COLORS.surfaceHighest}
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                ))}
                <Path d={`${chart.path} L 360 160 L 0 160 Z`} fill="url(#commodityChartGradient)" />
                <Path
                  d={chart.path}
                  fill="none"
                  stroke={SCREEN_COLORS.secondary}
                  strokeLinecap="round"
                  strokeWidth="2.75"
                />
                <Line
                  x1={chart.selectedX}
                  x2={chart.selectedX}
                  y1="15"
                  y2="155"
                  stroke={SCREEN_COLORS.outline}
                  strokeDasharray="2 2"
                  strokeWidth="1"
                />
                <Circle
                  cx={chart.selectedX}
                  cy={chart.selectedY}
                  r="5"
                  fill={SCREEN_COLORS.primaryContainer}
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                />
                <Circle cx="358" cy="19" r="4.5" fill={SCREEN_COLORS.primary} stroke={SCREEN_COLORS.secondaryContainer} strokeWidth="2" />
              </Svg>
            </View>
            <View style={styles.axisLabels}>
              {chart.labels.map((item, index) => (
                <ThemedText
                  key={`${timeframe}-${item}`}
                  type="labelSm"
                  style={[index === 2 && styles.axisSelected, { color: index === 2 ? SCREEN_COLORS.primary : SCREEN_COLORS.onSurfaceVariant }]}>
                  {item}
                </ThemedText>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="titleMd" style={[styles.sectionTitle, { color: SCREEN_COLORS.primary }]}>
              Chỉ số thị trường trong kỳ
            </ThemedText>
            <View style={styles.statsGrid}>
              {STATS.map((stat) => (
                <View key={stat.label} style={styles.statCard}>
                  <ThemedText type="labelSm" numberOfLines={1} style={{ color: SCREEN_COLORS.onSurfaceVariant }}>
                    {stat.label}
                  </ThemedText>
                  <View style={styles.statValueRow}>
                    <ThemedText
                      type="numericLg"
                      style={[styles.statValue, { color: stat.positive ? SCREEN_COLORS.secondary : SCREEN_COLORS.onSurface }]}>
                      {stat.value}
                    </ThemedText>
                    <ThemedText
                      type={stat.positive ? 'labelSm' : 'bodySm'}
                      style={[stat.positive && styles.buttonLabel, { color: stat.positive ? SCREEN_COLORS.secondary : SCREEN_COLORS.onSurfaceVariant }]}>
                      {stat.suffix}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.inlineRow}>
                <Icon name="storefront" size={22} color={SCREEN_COLORS.secondary} />
                <ThemedText type="titleMd" style={[styles.sectionTitle, { color: SCREEN_COLORS.primary }]}>
                  Đại lý đang thu mua (4)
                </ThemedText>
              </View>
              <ThemedText type="labelSm" style={{ color: SCREEN_COLORS.onSurfaceVariant }}>
                Cập nhật 5p trước
              </ThemedText>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortRow}>
              <SortChip
                label="Giá cao nhất"
                icon="arrow_downward"
                selected={buyerSort === 'price'}
                onPress={() => setBuyerSort('price')}
              />
              <SortChip label="Gần tôi nhất" selected={buyerSort === 'nearby'} onPress={() => setBuyerSort('nearby')} />
              <SortChip label="Đã xác thực" selected={buyerSort === 'verified'} onPress={() => setBuyerSort('verified')} />
            </ScrollView>
            {buyers.map((buyer) => (
              <BuyerCard
                key={buyer.id}
                buyer={buyer}
                onPrimary={() =>
                  buyer.id === 'b1'
                    ? goToSell()
                    : router.push({ pathname: '/buyer/[id]', params: { id: buyer.id } })
                }
                onSecondary={() =>
                  buyer.id === 'b1'
                    ? Linking.openURL('tel:0905123456')
                    : Linking.openURL('https://zalo.me/0905123456')
                }
              />
            ))}
          </View>

          <View style={styles.tipCard}>
            <View style={styles.tipIcon}>
              <Icon name="lightbulb" size={18} color={SCREEN_COLORS.onSecondaryContainer} />
            </View>
            <ThemedText type="bodySm" style={[styles.tipText, { color: SCREEN_COLORS.onSurfaceVariant }]}>
              <ThemedText type="bodySm" style={[styles.bold, { color: SCREEN_COLORS.onSurfaceVariant }]}>Mẹo bán giá tốt: </ThemedText>
              Độ ẩm hạt dưới 14% và tỷ lệ đen vỡ dưới 3% giúp bạn thương lượng giá cộng thêm{' '}
              <ThemedText type="bodySm" style={[styles.bold, { color: SCREEN_COLORS.onSurfaceVariant }]}>300 - 600 ₫/kg</ThemedText> tại kho.
            </ThemedText>
          </View>
        </ScrollView>

        <View style={[styles.fixedFooter, { paddingBottom: insets.bottom }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Tạo phiếu bán ${label.toLowerCase()} ngay`}
            onPress={goToSell}
            style={({ pressed }) => [styles.sellCta, { backgroundColor: SCREEN_COLORS.primaryContainer }, pressed && styles.ctaPressed]}>
            <View style={styles.sellCopy}>
              <ThemedText type="titleMd" style={[styles.bold, { color: SCREEN_COLORS.onPrimary }]}>
                Tạo phiếu bán {label.toLowerCase()} ngay
              </ThemedText>
              <ThemedText type="labelSm" style={{ color: '#A5D0B9' }}>
                Khóa giá chốt {formatCommodityPrice(displayPrice)} ₫ trong 2 giờ
              </ThemedText>
            </View>
            <View style={styles.sellButtonLabel}>
              <ThemedText type="labelMd" style={[styles.buttonLabel, { color: SCREEN_COLORS.onPrimary }]}>Bán</ThemedText>
              <Icon name="arrow_forward" size={18} color={SCREEN_COLORS.onPrimary} />
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function SortChip({ label, icon, selected, onPress }: { label: string; icon?: IconName; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Sắp xếp: ${label}`}
      accessibilityState={{ selected }}
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [
        styles.sortChip,
        { backgroundColor: selected ? SCREEN_COLORS.secondary : SCREEN_COLORS.surfaceLow },
        pressed && styles.pressed,
      ]}>
      {icon && <Icon name={icon} size={15} color={selected ? SCREEN_COLORS.onPrimary : SCREEN_COLORS.onSurfaceVariant} />}
      <ThemedText type="labelSm" style={[styles.buttonLabel, { color: selected ? SCREEN_COLORS.onPrimary : SCREEN_COLORS.onSurfaceVariant }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function BuyerCard({ buyer, onPrimary, onSecondary }: { buyer: BuyerCardData; onPrimary: () => void; onSecondary: () => void }) {
  return (
    <View style={[styles.card, styles.buyerCard]}>
      <View style={styles.buyerHeader}>
        <View style={styles.buyerIdentity}>
          <View style={[styles.initials, { backgroundColor: buyer.id === 'b1' ? SCREEN_COLORS.secondaryContainer : SCREEN_COLORS.primary }]}>
            <ThemedText type="titleMd" style={[styles.bold, { color: buyer.id === 'b1' ? SCREEN_COLORS.onSecondaryContainer : SCREEN_COLORS.onPrimary }]}>
              {buyer.initials}
            </ThemedText>
          </View>
          <View style={styles.buyerNameBlock}>
            <ThemedText type="titleMd" style={[styles.buyerName, { color: SCREEN_COLORS.onSurface }]}>{buyer.name}</ThemedText>
            {buyer.rating != null ? (
              <View style={styles.inlineRow}>
                <Icon name="star" size={15} color={SCREEN_COLORS.amber} />
                <ThemedText type="labelSm" style={[styles.buttonLabel, { color: SCREEN_COLORS.amber }]}>{buyer.rating}</ThemedText>
                <ThemedText type="bodySm" style={{ color: SCREEN_COLORS.onSurfaceVariant }}>•</ThemedText>
                <View style={styles.inlineRow}>
                  <Icon name="verified" size={14} color={SCREEN_COLORS.secondary} />
                  <ThemedText type="labelSm" style={{ color: SCREEN_COLORS.secondary }}>Đã xác thực</ThemedText>
                </View>
              </View>
            ) : (
              <View style={styles.partnerBadge}>
                <ThemedText type="labelSm" style={{ color: SCREEN_COLORS.onSurfaceVariant }}>{buyer.badge}</ThemedText>
              </View>
            )}
          </View>
        </View>
        <View style={styles.buyerPriceBlock}>
          <ThemedText type="titleMd" style={[styles.bold, { color: SCREEN_COLORS.primary }]}>{formatCommodityPrice(buyer.price)} ₫</ThemedText>
          <ThemedText type="labelSm" style={[styles.buyerPriceNote, { color: buyer.id === 'b1' ? SCREEN_COLORS.secondary : SCREEN_COLORS.onSurfaceVariant }]}>
            {buyer.priceNote}
          </ThemedText>
        </View>
      </View>
      <View style={styles.buyerDetails}>
        {buyer.details.map((detail) => (
          <View key={detail.text} style={styles.detailRow}>
            <Icon
              name={detail.icon}
              size={16}
              color={detail.icon === 'location_on' || detail.icon === 'local_shipping' ? SCREEN_COLORS.secondary : SCREEN_COLORS.onSurfaceVariant}
            />
            <ThemedText type="bodySm" style={[styles.detailText, { color: SCREEN_COLORS.onSurfaceVariant }]}>{detail.text}</ThemedText>
          </View>
        ))}
      </View>
      <View style={styles.buyerActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${buyer.secondaryAction} với ${buyer.name}`}
          onPress={onSecondary}
          style={({ pressed }) => [styles.buyerAction, { backgroundColor: SCREEN_COLORS.surfaceLow }, pressed && styles.pressed]}>
          <Icon name={buyer.secondaryIcon} size={18} color={SCREEN_COLORS.primary} />
          <ThemedText type="labelMd" style={[styles.buttonLabel, { color: SCREEN_COLORS.primary }]}>{buyer.secondaryAction}</ThemedText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${buyer.primaryAction} với ${buyer.name}`}
          onPress={onPrimary}
          style={({ pressed }) => [
            styles.buyerAction,
            { backgroundColor: buyer.id === 'b1' ? SCREEN_COLORS.primaryContainer : SCREEN_COLORS.surfaceHigh },
            pressed && styles.pressed,
          ]}>
          <Icon name={buyer.primaryIcon} size={18} color={buyer.id === 'b1' ? SCREEN_COLORS.onPrimary : SCREEN_COLORS.primary} />
          <ThemedText type="labelMd" style={[styles.buttonLabel, { color: buyer.id === 'b1' ? SCREEN_COLORS.onPrimary : SCREEN_COLORS.primary }]}>
            {buyer.primaryAction}
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const cardShadow = {
  shadowColor: '#1B4332',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 4,
  elevation: 1,
} as const;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SCREEN_COLORS.surface },
  shell: { flex: 1, width: '100%', maxWidth: 430, alignSelf: 'center', backgroundColor: SCREEN_COLORS.surface },
  header: { height: 64, paddingHorizontal: Spacing.three, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 0, backgroundColor: 'rgba(246,251,245,0.85)', shadowColor: '#1B4332', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2, zIndex: 3 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flexShrink: 1 },
  brandLogo: { width: 36, height: 32, borderRadius: Radius.base },
  brandTitle: { lineHeight: 20 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  profileImage: { width: 34, height: 34, borderRadius: Radius.full },
  iconButton: { width: 44, height: 44, borderRadius: Radius.container, alignItems: 'center', justifyContent: 'center' },
  notificationDot: { position: 'absolute', top: 10, right: 9, width: 8, height: 8, borderRadius: Radius.full, backgroundColor: '#BA1A1A', borderColor: SCREEN_COLORS.surface, borderWidth: 2 },
  alertDot: { position: 'absolute', top: 9, right: 8, width: 8, height: 8, borderRadius: Radius.full, backgroundColor: SCREEN_COLORS.secondary, borderWidth: 2 },
  scrollView: { flex: 1, backgroundColor: SCREEN_COLORS.surface },
  content: { paddingHorizontal: Spacing.three, paddingTop: Spacing.five, paddingBottom: 140, gap: Spacing.three },
  topNavigation: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.one },
  backButton: { minHeight: 44, paddingHorizontal: 12, borderRadius: Radius.container, flexDirection: 'row', alignItems: 'center', gap: 6, ...cardShadow },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  card: { borderRadius: Radius.container, padding: Spacing.three, gap: 12, backgroundColor: SCREEN_COLORS.surfaceLowest, ...cardShadow },
  heroLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  heroCommodity: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, flexShrink: 1 },
  liveDot: { width: 10, height: 10, borderRadius: Radius.full, backgroundColor: SCREEN_COLORS.secondary },
  uppercaseLabel: { color: SCREEN_COLORS.onSurfaceVariant, textTransform: 'uppercase', flexShrink: 1 },
  gradeBadge: { backgroundColor: SCREEN_COLORS.secondaryContainer, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.two },
  changeRow: { marginTop: Spacing.one, gap: Spacing.two },
  changeBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: SCREEN_COLORS.secondaryContainer, borderRadius: Radius.full, paddingHorizontal: Spacing.two, paddingVertical: 4 },
  inlineRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  metadata: { backgroundColor: SCREEN_COLORS.surfaceLow, borderRadius: Radius.base, padding: 12, gap: Spacing.one },
  metadataRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  metadataText: { color: SCREEN_COLORS.onSurfaceVariant, flex: 1 },
  chartCard: { gap: Spacing.three },
  timeframeControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: SCREEN_COLORS.surfaceLow, borderRadius: Radius.container, padding: 4 },
  timeframeButton: { flex: 1, minHeight: 30, borderRadius: Radius.base, alignItems: 'center', justifyContent: 'center' },
  chartHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  chartTooltip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: SCREEN_COLORS.surfaceHigh, borderRadius: Radius.base, paddingHorizontal: 10, paddingVertical: 5 },
  smallDot: { width: 8, height: 8, borderRadius: Radius.full },
  chartCanvas: { height: 176 },
  axisLabels: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  axisSelected: { fontWeight: '700' },
  section: { gap: Spacing.two },
  sectionTitle: { fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { flexBasis: '48%', flexGrow: 1, minHeight: 76, borderRadius: Radius.container, padding: 12, justifyContent: 'space-between', backgroundColor: SCREEN_COLORS.surfaceLowest, ...cardShadow },
  statValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.one, marginTop: Spacing.one },
  statValue: { fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two, paddingHorizontal: Spacing.one },
  sortRow: { gap: Spacing.two, paddingVertical: Spacing.half },
  sortChip: { minHeight: 32, paddingHorizontal: 12, borderRadius: Radius.full, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.one },
  buyerCard: { marginBottom: Spacing.one },
  buyerHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.two },
  buyerIdentity: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  initials: { width: 40, height: 40, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  buyerNameBlock: { flex: 1 },
  buyerName: { lineHeight: 20 },
  partnerBadge: { alignSelf: 'flex-start', backgroundColor: SCREEN_COLORS.surfaceHigh, borderRadius: Radius.base, paddingHorizontal: 6, paddingVertical: 2, marginTop: 2 },
  buyerPriceBlock: { alignItems: 'flex-end', maxWidth: 104 },
  buyerPriceNote: { textAlign: 'right' },
  buyerDetails: { backgroundColor: SCREEN_COLORS.surfaceLow, borderRadius: Radius.base, padding: 10, gap: Spacing.one },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  detailText: { flex: 1 },
  buyerActions: { flexDirection: 'row', gap: Spacing.two, paddingTop: Spacing.one },
  buyerAction: { flex: 1, minHeight: 44, borderRadius: Radius.base, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 8 },
  tipCard: { borderRadius: Radius.container, backgroundColor: SCREEN_COLORS.surfaceLow, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  tipIcon: { width: 32, height: 32, borderRadius: Radius.full, backgroundColor: SCREEN_COLORS.secondaryContainer, alignItems: 'center', justifyContent: 'center' },
  tipText: { flex: 1, lineHeight: 18 },
  bold: { fontWeight: '700' },
  buttonLabel: { fontWeight: '600' },
  fixedFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'transparent' },
  sellCta: { minHeight: 44, marginHorizontal: Spacing.three, marginTop: Spacing.two, borderRadius: Radius.container, paddingHorizontal: Spacing.three, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two, ...cardShadow },
  sellCopy: { flex: 1 },
  sellButtonLabel: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: Radius.base, paddingHorizontal: 10, paddingVertical: 7 },
  pressed: { opacity: 0.68 },
  ctaPressed: { transform: [{ scale: 0.99 }] },
});
