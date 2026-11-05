import { Link } from 'expo-router';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatAmount, formatVnd } from '@/utils/format-price';

import { NEARBY_RADIUS_KM } from './best-offer';
import { Icon } from './icons';
import type { DemandHighlight } from './use-dashboard-data';

function initialsFor(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

const formatKm = (km: number) => `${km.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} km`;

/** The highest open offer from a verified buyer near the seller, for a commodity they hold. */
export function BuyerInquiryCard({ highlight }: { highlight?: DemandHighlight }) {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={[styles.card, { borderColor: theme.border }]}>
      <View style={styles.headerRow}>
        <Icon name="handshake" size={20} color={theme.accent} />
        <ThemedText type="titleMd">Giá tốt nhất gần bạn</ThemedText>
      </View>
      {highlight ? <Offer highlight={highlight} /> : <NoOffer />}
    </ThemedView>
  );
}

function NoOffer() {
  const theme = useTheme();
  return (
    <>
      <ThemedText type="bodySm" themeColor="textSecondary">
        Chưa có thương lái xác thực nào trong bán kính {NEARBY_RADIUS_KM} km đang tìm mua mặt hàng bạn có.
      </ThemedText>
      <Link href="/demands" asChild>
        <Pressable accessibilityRole="link" style={styles.seeMoreRow}>
          <ThemedText type="labelMd" style={{ color: theme.accent }}>
            Xem tất cả tin thu mua
          </ThemedText>
          <Icon name="arrow_forward" size={16} color={theme.accent} />
        </Pressable>
      </Link>
    </>
  );
}

function Offer({ highlight }: { highlight: DemandHighlight }) {
  const theme = useTheme();
  const { demand, buyer, distanceKm, commodityLabel, postedLabel, gapVsMarket, otherCount } = highlight;
  const gapUp = gapVsMarket != null && gapVsMarket > 0;
  const gapDown = gapVsMarket != null && gapVsMarket < 0;
  const gapColor = gapUp ? theme.gain : gapDown ? theme.loss : theme.textSecondary;

  const offerA11y = [
    `${buyer.name}, khách xác thực, cách ${formatKm(distanceKm)}`,
    `cần mua ${formatAmount(demand.remainingQuantity)} ${demand.unit} ${commodityLabel ?? ''}`,
    `giá ${formatAmount(demand.priceRangeMax)} đồng một ${demand.unit}`,
    gapVsMarket
      ? `${gapUp ? 'cao hơn' : 'thấp hơn'} giá thị trường ${formatAmount(Math.abs(gapVsMarket))} đồng`
      : undefined,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <>
      <ThemedView type="backgroundSelected" style={styles.inner}>
        <View accessible accessibilityLabel={offerA11y} style={styles.offerBody}>
          <View style={styles.buyerRow}>
            <ThemedView style={[styles.avatar, { backgroundColor: theme.accentSoft }]}>
              <ThemedText type="titleMd" style={{ color: theme.primary }}>
                {initialsFor(buyer.name)}
              </ThemedText>
            </ThemedView>
            <View style={styles.buyerText}>
              <ThemedText type="titleMd">{buyer.name}</ThemedText>
              <View style={styles.metaRow}>
                <Icon name="verified" size={14} color={theme.accent} />
                <ThemedText type="labelSm" style={{ color: theme.accent }}>
                  Khách xác thực
                </ThemedText>
              </View>
              <ThemedText type="labelSm" themeColor="textSecondary">
                Cách {formatKm(distanceKm)} · Đăng {postedLabel}
              </ThemedText>
            </View>
          </View>

          <View>
            <ThemedText type="bodySm" themeColor="textSecondary">
              Cần mua {formatAmount(demand.remainingQuantity)} {demand.unit} {commodityLabel}
            </ThemedText>
            <View style={styles.priceRow}>
              <ThemedText type="numericLg">{formatAmount(demand.priceRangeMax)}</ThemedText>
              <ThemedText type="bodySm" themeColor="textSecondary">
                {' '}
                ₫/{demand.unit}
              </ThemedText>
            </View>
            {gapVsMarket != null && (
              <View style={styles.metaRow}>
                {(gapUp || gapDown) && (
                  <Icon name={gapUp ? 'arrow_upward' : 'arrow_downward'} size={14} color={gapColor} />
                )}
                <ThemedText type="labelMd" style={{ color: gapColor }}>
                  {gapVsMarket === 0
                    ? 'Bằng giá thị trường'
                    : `${gapUp ? '+' : '-'}${formatVnd(Math.abs(gapVsMarket))} so với giá thị trường`}
                </ThemedText>
              </View>
            )}
            {demand.qualityRequirements && (
              <ThemedText type="labelSm" themeColor="textSecondary">
                Yêu cầu: {demand.qualityRequirements}
              </ThemedText>
            )}
          </View>
        </View>

        <View style={styles.actions}>
          {buyer.contactPhone && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Gọi ${buyer.name}`}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: pressed ? theme.primaryPressed : theme.primary },
              ]}
              onPress={() => Linking.openURL(`tel:${buyer.contactPhone}`)}>
              <Icon name="call" size={18} color={theme.onPrimary} />
              <ThemedText type="titleMd" style={{ color: theme.onPrimary }}>
                Gọi
              </ThemedText>
            </Pressable>
          )}
          <Link href={{ pathname: '/buyer/[id]', params: { id: buyer.id } }} asChild>
            <Pressable accessibilityRole="button" style={styles.buttonWrapper}>
              <ThemedView type="backgroundElement" style={[styles.button, styles.outline, { borderColor: theme.outline }]}>
                <ThemedText type="titleMd" themeColor="primary">
                  Xem đầu mối
                </ThemedText>
              </ThemedView>
            </Pressable>
          </Link>
        </View>
      </ThemedView>

      {otherCount > 0 && (
        <Link href="/demands" asChild>
          <Pressable accessibilityRole="link" style={styles.seeMoreRow}>
            <ThemedText type="labelMd" style={{ color: theme.accent }}>
              Xem thêm {otherCount} thương lái khác gần bạn
            </ThemedText>
            <Icon name="arrow_forward" size={16} color={theme.accent} />
          </Pressable>
        </Link>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.container,
    borderWidth: 1,
    padding: Spacing.three,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  inner: {
    borderRadius: Radius.container,
    padding: 12,
    gap: 12,
  },
  offerBody: {
    gap: 12,
  },
  buyerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyerText: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.one,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  buttonWrapper: {
    flex: 1,
    minWidth: 140,
  },
  button: {
    flex: 1,
    minWidth: 120,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.container,
  },
  outline: {
    borderWidth: 1.5,
  },
  seeMoreRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
});
