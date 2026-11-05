import { Link } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing, Layout } from '@/constants/theme';
import { BUYERS, BUYING_DEMANDS, COMMODITIES } from '@/data/mock-data';
import { expiryLabel, isPostActive, MY_BUYER_ID, useMyBuyerPosts, useMyBuyerProfile } from '@/hooks/use-buyer-posts';
import { useTheme } from '@/hooks/use-theme';
import { Icon } from '@/screens/home-dashboard/icons';
import type { BuyerProfile, BuyingDemand } from '@/types/domain';
import { formatAmount } from '@/utils/format-price';

/**
 * Every open buying post, verified buyers first. Posts made on this device are merged in so the
 * trader flow can be demoed end to end before a backend exists. Unverified buyers are listed
 * here with a label but never promoted to the seller home.
 */
export function BuyingDemands() {
  const theme = useTheme();
  const [myPosts, , postsLoaded] = useMyBuyerPosts();
  const [myProfile, , profileLoaded] = useMyBuyerProfile();
  if (!postsLoaded || !profileLoaded) return <ActivityIndicator style={styles.loading} size="large" />;

  const now = new Date();
  const buyers: BuyerProfile[] = [...BUYERS, myProfile];
  const rows = [...BUYING_DEMANDS, ...myPosts]
    .filter((post) => isPostActive(post, now))
    .map((post) => ({ post, buyer: buyers.find((b) => b.id === post.buyerId) }))
    .sort(
      (a, b) =>
        Number(!!b.buyer?.verified) - Number(!!a.buyer?.verified) || b.post.periodStart.localeCompare(a.post.periodStart),
    );

  return (
    <FlatList
      data={rows}
      keyExtractor={({ post }) => post.id}
      contentContainerStyle={styles.content}
      ListEmptyComponent={
        <ThemedText type="bodySm" themeColor="textSecondary">
          Hiện chưa có tin thu mua nào còn hiệu lực.
        </ThemedText>
      }
      renderItem={({ item: { post, buyer } }) => {
        const card = <PostCard post={post} buyer={buyer} now={now} />;
        // The trader on this device has no public profile page yet.
        if (!buyer || buyer.id === MY_BUYER_ID) return card;
        return (
          <Link href={{ pathname: '/buyer/[id]', params: { id: buyer.id } }} asChild>
            <Pressable accessibilityRole="link">{({ pressed }) => <View style={pressed && styles.pressed}>{card}</View>}</Pressable>
          </Link>
        );
      }}
      ListHeaderComponent={
        <ThemedText type="bodySm" themeColor="textSecondary">
          Giá áp dụng cho hàng đạt yêu cầu chất lượng ghi trong tin. Hãy gọi xác nhận trước khi chở hàng.
        </ThemedText>
      }
      ListHeaderComponentStyle={styles.headerNote}
      style={{ backgroundColor: theme.background }}
    />
  );
}

function PostCard({ post, buyer, now }: { post: BuyingDemand; buyer?: BuyerProfile; now: Date }) {
  const theme = useTheme();
  const label = COMMODITIES.find((c) => c.id === post.commodity)?.label ?? post.commodity;
  const verified = !!buyer?.verified;

  return (
    <ThemedView type="backgroundElement" style={[styles.card, { borderColor: theme.border }]}>
      <View style={styles.top}>
        <ThemedText type="titleMd">{label}</ThemedText>
        <ThemedText type="labelSm" themeColor="textSecondary">
          {expiryLabel(post, now)}
        </ThemedText>
      </View>
      <View style={styles.priceRow}>
        <ThemedText type="numericLg">{formatAmount(post.pricePerUnit)}</ThemedText>
        <ThemedText type="bodySm" themeColor="textSecondary">
          {' '}
          ₫/{post.unit}
        </ThemedText>
      </View>
      <ThemedText type="bodySm" themeColor="textSecondary">
        {post.remainingQuantity != null
          ? `Còn cần ${formatAmount(post.remainingQuantity)} ${post.unit}`
          : 'Không giới hạn số lượng'}
        {post.area ? ` · ${post.area}` : ''}
      </ThemedText>
      {post.qualityRequirements && <ThemedText type="bodySm">Chất lượng: {post.qualityRequirements}</ThemedText>}
      {post.priceNote && (
        <ThemedText type="bodySm" themeColor="textSecondary">
          {post.priceNote}
        </ThemedText>
      )}
      <View style={styles.buyerRow}>
        <ThemedText type="labelMd" style={styles.buyerName}>
          {buyer?.name.trim() || 'Đầu mối chưa đặt tên'}
        </ThemedText>
        <ThemedView
          style={[styles.badge, { backgroundColor: verified ? theme.accentSoft : theme.pendingContainer }]}>
          <Icon name={verified ? 'verified' : 'shield'} size={14} color={verified ? theme.primary : theme.pending} />
          <ThemedText type="labelSm" style={{ color: verified ? theme.primary : theme.pending }}>
            {verified ? 'Khách xác thực' : 'Chưa xác thực'}
          </ThemedText>
        </ThemedView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1 },
  content: {
    padding: Layout.screenMargin,
    gap: Layout.gutter,
  },
  headerNote: { marginBottom: Spacing.one },
  pressed: { opacity: 0.85 },
  card: {
    borderWidth: 1,
    borderRadius: Radius.container,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  buyerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  buyerName: { flexShrink: 1 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderRadius: Radius.base,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
});
