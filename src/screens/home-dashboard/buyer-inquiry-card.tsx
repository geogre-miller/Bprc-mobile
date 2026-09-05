import { Link } from 'expo-router';
import { Linking, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatAmount, formatVnd } from '@/utils/format-price';

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

/** The newest buying demand, with call and profile actions plus a link to the rest. */
export function BuyerInquiryCard({ highlight }: { highlight: DemandHighlight }) {
  const theme = useTheme();
  const { demand, buyer, commodityLabel, postedLabel, otherCount } = highlight;

  return (
    <ThemedView type="backgroundElement" style={[styles.card, { borderColor: theme.border }]}>
      <ThemedView type="backgroundElement" style={styles.cardHeader}>
        <ThemedView type="backgroundElement" style={styles.headerRow}>
          <Icon name="handshake" size={18} color={theme.accent} />
          <ThemedText type="titleMd">Yêu cầu thu mua mới</ThemedText>
        </ThemedView>
        {buyer?.verified && (
          <ThemedView style={[styles.verifiedBadge, { backgroundColor: theme.accentSoft }]}>
            <ThemedText type="labelSm" style={{ color: theme.primary }}>
              Khách xác thực
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      <ThemedView type="backgroundSelected" style={styles.inner}>
        <ThemedView type="backgroundSelected" style={styles.buyerRow}>
          <ThemedView style={[styles.avatar, { backgroundColor: theme.accentSoft }]}>
            <ThemedText type="titleMd" style={{ color: theme.primary }}>
              {initialsFor(buyer?.name ?? 'Đầu mối')}
            </ThemedText>
          </ThemedView>
          <ThemedView type="backgroundSelected" style={styles.buyerBody}>
            <ThemedView type="backgroundSelected" style={styles.nameRow}>
              <ThemedText type="titleMd" numberOfLines={1} style={styles.name}>
                {buyer?.name ?? 'Đầu mối'}
              </ThemedText>
              <ThemedText type="labelSm" themeColor="textSecondary">
                {postedLabel}
              </ThemedText>
            </ThemedView>
            <ThemedText type="small" themeColor="textSecondary" style={styles.copy}>
              Cần thu mua{' '}
              <ThemedText type="small" style={styles.strong}>
                {formatAmount(demand.remainingQuantity)} {demand.unit} {commodityLabel}
              </ThemedText>{' '}
              với giá chào:{' '}
              <ThemedText type="smallBold" style={{ color: theme.accent }}>
                {formatVnd(demand.priceRangeMax)}/{demand.unit}
              </ThemedText>
              .
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView type="backgroundSelected" style={styles.actions}>
          {buyer?.contactPhone && (
            <Pressable
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={() => Linking.openURL(`tel:${buyer.contactPhone}`)}>
              <Icon name="call" size={16} color={theme.onPrimary} />
              <ThemedText type="labelMd" style={[styles.buttonLabel, { color: theme.onPrimary }]}>
                Gọi liên hệ
              </ThemedText>
            </Pressable>
          )}
          {buyer && (
            <Link href={{ pathname: '/buyer/[id]', params: { id: buyer.id } }} asChild>
              <Pressable style={styles.buttonWrapper}>
                <ThemedView type="backgroundElement" style={[styles.button, { borderColor: theme.border }]}>
                  <Icon name="handshake" size={16} color={theme.text} />
                  <ThemedText type="labelMd" style={styles.buttonLabel}>
                    Xem đầu mối
                  </ThemedText>
                </ThemedView>
              </Pressable>
            </Link>
          )}
        </ThemedView>
      </ThemedView>

      {otherCount > 0 && (
        <Link href="/demands" asChild>
          <Pressable style={styles.seeMoreRow}>
            <ThemedText type="labelMd" style={{ color: theme.accent }}>
              Xem thêm {otherCount} thương lái khác đang tìm mua
            </ThemedText>
            <Icon name="arrow_forward" size={16} color={theme.accent} />
          </Pressable>
        </Link>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.container,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifiedBadge: {
    borderRadius: 2,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
  inner: {
    borderRadius: Radius.container,
    padding: 12,
    gap: Spacing.two,
  },
  buyerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyerBody: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  name: {
    flexShrink: 1,
  },
  copy: {
    marginTop: Spacing.half,
  },
  strong: {
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  buttonWrapper: {
    flex: 1,
  },
  button: {
    flex: 1,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    borderRadius: Radius.base,
  },
  buttonLabel: {
    fontWeight: '600',
  },
  seeMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.one,
  },
});
