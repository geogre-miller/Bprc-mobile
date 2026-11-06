import { useMemo } from 'react';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { Card } from '@/components/ui/card';
import { ThemedText } from '@/components/themed-text';
import { LightPalette, Layout, Spacing } from '@/constants/theme';
import { BUYER_DIRECTORY } from '@/data/buyer-directory';
import { BUYER_EXTRAS, buildBuyerQuotes, type BuyerPolicy, type BuyerQuote } from '@/data/buyer-profiles';
import { getBuyer } from '@/data/mock-data';
import type { BuyerProfile } from '@/types/domain';

import { Icon, type IconName } from '../home-dashboard/icons';


const COLORS = LightPalette;

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

function QuoteCard({ quote }: { quote: BuyerQuote }) {
  const { title, badge, description, price, priceNote, gain, quota, urgent, compact } = quote;
  return (
    <Card style={compact ? styles.compactQuote : styles.quoteCard}>
      <View style={[styles.quoteTop, compact && styles.compactQuoteTop]}>
        <View style={styles.quoteCopy}>
          <View style={styles.quoteTitleRow}>
            <ThemedText type="titleMd" style={styles.quoteTitle}>
              {title}
            </ThemedText>
            {badge && (
              <View style={styles.gradeBadge}>
                <ThemedText type="labelSm" style={styles.gradeText}>
                  {badge}
                </ThemedText>
              </View>
            )}
          </View>
          {description && (
            <ThemedText type="bodySm" style={styles.quoteDescription}>
              {description}
            </ThemedText>
          )}
        </View>
        <View style={styles.quotePrice}>
          <Price value={price.toLocaleString('en-US')} compact={compact} />
          {priceNote && gain ? (
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

const TONE_COLORS = { amber: COLORS.amber, primary: COLORS.primary, secondary: COLORS.secondary } as const;

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .slice(-2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');

const formatAddress = (address: BuyerProfile['address']) =>
  [address.line, address.district, address.province].filter(Boolean).join(', ');

export function BuyerDetail({ buyerId }: { buyerId?: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const buyer = getBuyer(buyerId);
  const now = useMemo(() => new Date(), []);
  const quotes = useMemo(() => (buyer ? buildBuyerQuotes(buyer.id, now) : []), [buyer, now]);

  if (!buyer) {
    return (
      <View style={[styles.empty, { paddingTop: insets.top }]}>
        <ThemedText type="bodySm" style={styles.mutedLabel}>Không tìm thấy đầu mối này.</ThemedText>
      </View>
    );
  }

  const extras = BUYER_EXTRAS[buyer.id];
  const directory = BUYER_DIRECTORY.find((entry) => entry.id === buyer.id);
  const policies: BuyerPolicy[] =
    extras?.policies ??
    (directory ? [{ icon: directory.policyIcon, title: 'Chính sách thu mua', description: directory.policy }] : []);
  const phone = buyer.contactPhone?.replace(/\s/g, '');

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/buyers'));
  const callBuyer = () => phone && Linking.openURL(`tel:${phone}`);
  const shareBuyer = () => Share.share({
    title: buyer.name,
    message: `${buyer.name} đang thu mua nông sản trên Mùa Vàng.`,
  });
  // The journal records the sale; it takes the buyer and the first priced commodity as defaults.
  const startSale = () => {
    const first = quotes.find((quote) => quote.commodity);
    router.push({
      pathname: '/journal',
      params: {
        buyerId: buyer.id,
        buyerName: buyer.name,
        ...(first?.commodity ? { commodity: first.commodity, price: String(first.price) } : {}),
      },
    });
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.shell}>
        <AppHeader />

        <ScrollView style={styles.scrollView} contentContainerStyle={[styles.content, { paddingBottom: 148 + insets.bottom }]} showsVerticalScrollIndicator={false}>
          <View style={styles.topNavigation}>
            <Pressable accessibilityRole="button" accessibilityLabel="Quay lại danh bạ" onPress={goBack} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
              <Icon name="arrow_back" size={20} color={COLORS.secondary} />
              <ThemedText type="labelMd" style={styles.backText}>Danh bạ</ThemedText>
            </Pressable>
            <View style={styles.topActions}>
              {phone && (
                <Pressable accessibilityRole="button" accessibilityLabel={`Gọi ${buyer.name}`} onPress={callBuyer} style={({ pressed }) => [styles.topIconButton, pressed && styles.pressed]}>
                  <Icon name="call" size={20} color={COLORS.secondary} />
                </Pressable>
              )}
              <Pressable accessibilityRole="button" accessibilityLabel={`Chia sẻ hồ sơ ${buyer.name}`} onPress={shareBuyer} style={({ pressed }) => [styles.topIconButton, pressed && styles.pressed]}>
                <Icon name="share" size={20} color={COLORS.onSurfaceVariant} />
              </Pressable>
            </View>
          </View>

          <Card style={styles.buyerCard}>
            <View style={styles.brandGlow} />
            <View style={styles.identityRow}>
              <View style={styles.portraitWrap}>
                {extras ? (
                  <Image accessibilityLabel={extras.portraitLabel} source={require('@/assets/images/buyer-detail-portrait.jpg')} resizeMode="cover" style={styles.portrait} />
                ) : (
                  <View style={[styles.portrait, styles.initialsTile]}>
                    <ThemedText type="titleMd" style={styles.initialsText}>{initialsOf(buyer.name)}</ThemedText>
                  </View>
                )}
                {buyer.verified && <View style={styles.portraitVerified}><Icon name="verified" size={11} color={COLORS.onPrimary} /></View>}
              </View>
              <View style={styles.identityCopy}>
                <ThemedText type="headlineSm" style={styles.buyerName} numberOfLines={2}>{buyer.name}</ThemedText>
                {extras && <ThemedText type="bodySm" style={styles.ownerText}>{extras.owner}</ThemedText>}
                <ThemedText type="bodySm" style={styles.ownerText}>{formatAddress(buyer.address)}</ThemedText>
                <View style={styles.licenseBadge}>
                  <Icon name={buyer.verified ? 'check_circle' : 'shield'} size={13} color={COLORS.secondary} />
                  <ThemedText type="labelSm" style={styles.licenseText} numberOfLines={2}>
                    {extras?.license ?? (buyer.verified ? 'Đã xác thực' : 'Chưa xác thực')}
                  </ThemedText>
                </View>
              </View>
            </View>
            {extras && <QuotaRow value={extras.quota} />}
            {extras ? (
              <View style={styles.trustGrid}>
                {extras.stats.map((stat) => (
                  <TrustStat key={stat.label} icon={stat.icon} value={stat.value} label={stat.label} color={TONE_COLORS[stat.tone]} />
                ))}
              </View>
            ) : (
              buyer.reputationScore != null && (
                <View style={styles.trustGrid}>
                  <TrustStat icon="star" value={buyer.reputationScore.toFixed(1)} label="Điểm uy tín" color={COLORS.amber} />
                </View>
              )
            )}
          </Card>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeading}>
                <Icon name="price_change" size={20} color={COLORS.primary} />
                <ThemedText type="titleMd" style={styles.sectionTitle}>Giá thu mua hôm nay</ThemedText>
              </View>
              {extras && (
                <View style={styles.updatedBadge}>
                  <View style={styles.liveDot} />
                  <ThemedText type="labelSm" style={styles.updatedText}>Cập nhật 08:30</ThemedText>
                </View>
              )}
            </View>
            {quotes.length > 0 ? (
              <View style={styles.quoteStack}>
                {quotes.map((quote) => <QuoteCard key={quote.key} quote={quote} />)}
              </View>
            ) : (
              <ThemedText type="bodySm" style={styles.mutedLabel}>
                Đầu mối này chưa công bố giá. Hãy gọi để hỏi giá trước khi chở hàng.
              </ThemedText>
            )}
          </View>

          {extras && (
            <View style={styles.warehouseCard}>
              <Image accessibilityLabel={extras.warehouseLabel} source={require('@/assets/images/buyer-detail-warehouse.jpg')} resizeMode="cover" style={styles.warehouseImage} />
              <View style={styles.warehouseCaption}>
                <Icon name="warehouse" size={18} color={COLORS.onPrimary} />
                <ThemedText type="labelMd" style={styles.warehouseText}>{extras.warehouseCaption}</ThemedText>
              </View>
            </View>
          )}

          {extras && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeading}>
                  <Icon name="receipt_long" size={20} color={COLORS.primary} />
                  <ThemedText type="titleMd" style={styles.sectionTitle}>Lịch sử giao dịch của bạn</ThemedText>
                </View>
                <ThemedText type="labelSm" style={styles.loyalText}>{extras.history.note}</ThemedText>
              </View>
              <View style={styles.historySummary}>
                <View style={styles.summaryTop}>
                  <ThemedText type="labelSm" style={styles.summaryLabel}>TỔNG GIÁ TRỊ ĐÃ GIAO DỊCH</ThemedText>
                  <View style={styles.dealBadge}><ThemedText type="labelSm" style={styles.dealText}>{extras.history.dealsLabel}</ThemedText></View>
                </View>
                <ThemedText type="numericHero" style={styles.summaryValue}>{extras.history.total} <ThemedText type="titleMd" style={styles.summaryCurrency}>₫</ThemedText></ThemedText>
                <View style={styles.summaryFooter}>
                  <ThemedText type="bodySm" style={styles.summaryFooterText}>Tổng sản lượng cung ứng:</ThemedText>
                  <ThemedText type="labelMd" style={styles.summaryFooterValue}>{extras.history.volume}</ThemedText>
                </View>
              </View>
              <View style={styles.transactionList}>
                {extras.history.rows.map((row, index) => (
                  <View key={row.title}>
                    {index > 0 && <View style={styles.divider} />}
                    <TransactionRow title={row.title} detail={row.detail} value={row.value} />
                  </View>
                ))}
              </View>
            </View>
          )}

          {policies.length > 0 && (
            <Card style={styles.policyCard}>
              <View style={styles.sectionHeading}>
                <Icon name="verified_user" size={20} color={COLORS.secondary} />
                <ThemedText type="titleMd" style={styles.sectionTitle}>Quy chuẩn thu mua & Hỗ trợ</ThemedText>
              </View>
              <View style={styles.policyStack}>
                {policies.map((policy) => <PolicyRow key={policy.title} icon={policy.icon} title={policy.title} description={policy.description} />)}
              </View>
            </Card>
          )}

          <View style={styles.ctaStack}>
            {phone && (
              <Pressable accessibilityRole="button" accessibilityLabel={`Gọi ${buyer.name}`} onPress={callBuyer} style={({ pressed }) => [styles.primaryCta, pressed && styles.ctaPressed]}>
                <Icon name="call" size={20} color={COLORS.onPrimary} />
                <ThemedText type="titleMd" style={styles.primaryCtaText} numberOfLines={1}>Gọi {buyer.name}</ThemedText>
              </Pressable>
            )}
            <Pressable accessibilityRole="button" accessibilityLabel="Tạo phiếu bán cho đại lý này" onPress={startSale} style={({ pressed }) => [styles.secondaryCta, pressed && styles.pressed]}>
              <Icon name="post_add" size={20} color={COLORS.secondary} />
              <ThemedText type="titleMd" style={styles.secondaryCtaText}>Tạo phiếu bán cho đại lý này</ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
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
  scrollView: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: Layout.screenMargin, paddingTop: Spacing.two, gap: Layout.sectionGap },
  topNavigation: { minHeight: 56, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { minHeight: 40, paddingRight: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { color: COLORS.onSurfaceVariant, fontWeight: '500' },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topIconButton: { width: 40, height: 40, borderRadius: 8, backgroundColor: COLORS.surfaceLow, alignItems: 'center', justifyContent: 'center' },
  buyerCard: { position: 'relative', overflow: 'hidden' },
  brandGlow: { position: 'absolute', width: 112, height: 112, borderRadius: 999, right: -32, top: -32, backgroundColor: COLORS.secondaryContainer },
  identityRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  portraitWrap: { width: 56, height: 56, borderRadius: 8, overflow: 'hidden', backgroundColor: COLORS.surfaceHigh },
  initialsTile: { alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.secondaryContainer },
  initialsText: { color: COLORS.onSecondaryContainer, fontWeight: '700' },
  portrait: { width: 56, height: 56 },
  portraitVerified: { position: 'absolute', right: 0, bottom: 0, width: 16, height: 16, borderTopLeftRadius: 4, backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center' },
  identityCopy: { flex: 1, minWidth: 0 },
  buyerName: { color: COLORS.primary, fontWeight: '600' },
  ownerText: { color: COLORS.onSurfaceVariant, fontWeight: '400', marginTop: 2 },
  licenseBadge: { alignSelf: 'flex-start', maxWidth: '100%', marginTop: 4, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.secondaryContainer },
  licenseText: { color: COLORS.onSecondaryContainer, fontWeight: '600', flexShrink: 1, lineHeight: 14 },
  quotaRow: { minHeight: 32, borderRadius: 4, paddingHorizontal: 12, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, backgroundColor: COLORS.surfaceLow },
  quotaLabel: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },
  quotaValue: { color: COLORS.primary, fontWeight: '600' },
  trustGrid: { flexDirection: 'row', gap: 8, paddingTop: 4 },
  trustStat: { flex: 1, minHeight: 55, borderRadius: 4, padding: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surfaceContainer },
  inlineCompact: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  mutedLabel: { color: COLORS.onSurfaceVariant, fontWeight: '600' },
  semibold: { fontWeight: '600' },
  section: { gap: 12 },
  sectionHeader: { minHeight: 24, paddingHorizontal: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  sectionTitle: { color: COLORS.primary, fontWeight: '600', flexShrink: 1 },
  updatedBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.secondaryContainer },
  liveDot: { width: 6, height: 6, borderRadius: 999, backgroundColor: COLORS.secondary },
  updatedText: { color: COLORS.onSecondaryContainer, fontWeight: '600' },
  quoteStack: { gap: 8 },
  quoteCard: { gap: 8 },
  compactQuote: { paddingVertical: 16, gap: 0 },
  quoteTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  compactQuoteTop: { alignItems: 'center' },
  quoteCopy: { flex: 1, minWidth: 0 },
  quoteTitleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  quoteTitle: { color: COLORS.onSurface, fontWeight: '700' },
  gradeBadge: { borderRadius: 2, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: COLORS.surfaceHigh },
  gradeText: { color: COLORS.onSurfaceVariant, fontWeight: '600' },
  quoteDescription: { color: COLORS.onSurfaceVariant, fontWeight: '400', marginTop: 2 },
  quotePrice: { alignItems: 'flex-end', flexShrink: 0 },
  price: { color: COLORS.primary, fontWeight: '700' },
  priceUnit: { color: COLORS.outline, fontWeight: '400' },
  gainBadge: { borderRadius: 2, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: COLORS.gainContainer },
  gainText: { color: COLORS.secondary, fontWeight: '600' },
  marketNote: { color: COLORS.onSurfaceVariant, fontWeight: '600', marginTop: 1 },
  warehouseCard: { height: 144, borderRadius: 8, overflow: 'hidden', backgroundColor: COLORS.surfaceContainer, ...shadow },
  warehouseImage: { width: '100%', height: '100%' },
  warehouseCaption: { position: 'absolute', left: 0, right: 0, bottom: 0, minHeight: 45, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primary },
  warehouseText: { color: COLORS.onPrimary, fontWeight: '500', flexShrink: 1 },
  loyalText: { color: COLORS.secondary, fontWeight: '500', textAlign: 'right', flexShrink: 1 },
  historySummary: { borderRadius: 8, overflow: 'hidden', padding: 16, paddingBottom: 0, gap: 8, backgroundColor: COLORS.primary, ...shadow },
  summaryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  summaryLabel: { color: COLORS.onPrimaryContainer, fontWeight: '600', letterSpacing: 1 },
  dealBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: COLORS.primaryContainer },
  dealText: { color: COLORS.secondaryContainer, fontWeight: '600' },
  summaryValue: { color: COLORS.onPrimary, fontWeight: '700' },
  summaryCurrency: { color: COLORS.onPrimaryContainer, fontWeight: '600' },
  summaryFooter: { minHeight: 40, marginHorizontal: -16, marginTop: 2, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.primaryPressed },
  summaryFooterText: { color: COLORS.onPrimary, fontWeight: '400' },
  summaryFooterValue: { color: COLORS.onPrimary, fontWeight: '700' },
  transactionList: { borderRadius: 8, overflow: 'hidden', backgroundColor: COLORS.surfaceLowest, ...shadow },
  transactionRow: { padding: 16, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  transactionCopy: { flex: 1, minWidth: 0 },
  transactionTitle: { color: COLORS.onSurface, fontWeight: '600' },
  transactionDetail: { color: COLORS.onSurfaceVariant, fontWeight: '600', marginTop: 2 },
  transactionValueBlock: { maxWidth: '40%', alignItems: 'flex-end' },
  transactionValue: { color: COLORS.primary, fontWeight: '700', textAlign: 'right' },
  paidRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  paidText: { color: COLORS.secondary, fontWeight: '600', textAlign: 'right' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: COLORS.surfaceContainer },
  policyCard: { gap: 12 },
  policyStack: { gap: 12 },
  policyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  policyIcon: { width: 28, height: 28, borderRadius: 4, marginTop: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surfaceLow },
  policyCopy: { flex: 1 },
  policyTitle: { color: COLORS.onSurface, fontWeight: '500' },
  policyDescription: { color: COLORS.onSurfaceVariant, fontWeight: '400' },
  ctaStack: { gap: 8, paddingBottom: 4 },
  primaryCta: { height: 48, borderRadius: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primaryContainer, ...shadow },
  primaryCtaText: { color: COLORS.onPrimary, fontWeight: '600' },
  secondaryCta: { height: 48, borderRadius: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.surfaceLowest, ...shadow },
  secondaryCtaText: { color: COLORS.primary, fontWeight: '600' },
  pressed: { opacity: 0.68 },
  ctaPressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
});
