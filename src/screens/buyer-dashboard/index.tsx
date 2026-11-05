import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { COMMODITIES } from '@/data/mock-data';
import { expiryLabel, isPostActive, useMyBuyerPosts, useMyBuyerProfile } from '@/hooks/use-buyer-posts';
import { useTheme } from '@/hooks/use-theme';
import { Icon } from '@/screens/home-dashboard/icons';
import type { BuyingDemand } from '@/types/domain';
import { formatAmount } from '@/utils/format-price';

/**
 * ponytail: usePersistedState instances do not share writes, so this screen remounts its
 * content on focus to pick up posts saved by the form. Upgrade path: make the hook notify
 * other instances of the same key (it has 8 callers; needs its own change).
 */
export function BuyerDashboard() {
  const [focusKey, setFocusKey] = useState(0);
  useFocusEffect(useCallback(() => setFocusKey((key) => key + 1), []));
  return <BuyerDashboardContent key={focusKey} />;
}

function BuyerDashboardContent() {
  const theme = useTheme();
  const [profile, setProfile, profileLoaded] = useMyBuyerProfile();
  const [posts, setPosts, postsLoaded] = useMyBuyerPosts();
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  if (!profileLoaded || !postsLoaded) return <ActivityIndicator style={styles.loading} size="large" />;

  const now = new Date();
  const sorted = [...posts].sort(
    (a, b) => Number(isPostActive(b, now)) - Number(isPostActive(a, now)) || b.periodStart.localeCompare(a.periodStart),
  );
  const profileIncomplete = !profile.name.trim() || !profile.contactPhone?.trim();
  const inputStyle = [styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.backgroundElement }];

  const header = (
    <View style={styles.header}>
      <ThemedView
        style={[styles.notice, { backgroundColor: profile.verified ? theme.accentSoft : theme.pendingContainer }]}>
        <Icon name={profile.verified ? 'verified' : 'shield'} size={20} color={profile.verified ? theme.primary : theme.pending} />
        <ThemedText type="bodySm" style={[styles.noticeText, { color: profile.verified ? theme.primary : theme.pending }]}>
          {profile.verified
            ? 'Đã xác thực. Tin của bạn hiện trên trang chủ người bán gần bạn.'
            : 'Chưa xác thực. Tin của bạn hiện trong mục "Đang cần mua" với nhãn "Chưa xác thực", chưa hiện trên trang chủ người bán.'}
        </ThemedText>
      </ThemedView>

      <View style={styles.section}>
        <ThemedText type="headlineSm" accessibilityRole="header">
          Hồ sơ đầu mối
        </ThemedText>
        <Labeled label="Tên đầu mối / doanh nghiệp">
          <TextInput
            accessibilityLabel="Tên đầu mối hoặc doanh nghiệp"
            value={profile.name}
            onChangeText={(name) => setProfile((current) => ({ ...current, name }))}
            placeholder="Ví dụ: Đại lý Minh Tâm"
            placeholderTextColor={theme.outline}
            style={inputStyle}
          />
        </Labeled>
        <Labeled label="Số điện thoại liên hệ">
          <TextInput
            accessibilityLabel="Số điện thoại liên hệ"
            value={profile.contactPhone}
            onChangeText={(contactPhone) => setProfile((current) => ({ ...current, contactPhone }))}
            placeholder="Người bán sẽ gọi số này"
            placeholderTextColor={theme.outline}
            keyboardType="phone-pad"
            style={inputStyle}
          />
        </Labeled>
        <Labeled label="Địa chỉ kho / điểm thu mua">
          <TextInput
            accessibilityLabel="Địa chỉ kho hoặc điểm thu mua"
            value={profile.address.line}
            onChangeText={(line) => setProfile((current) => ({ ...current, address: { ...current.address, line } }))}
            placeholder="Số nhà, thôn, xã"
            placeholderTextColor={theme.outline}
            style={inputStyle}
          />
        </Labeled>
        {profileIncomplete && (
          <ThemedText type="labelSm" style={{ color: theme.pending }}>
            Thêm tên và số điện thoại để người bán liên hệ được với bạn.
          </ThemedText>
        )}
      </View>

      <View style={styles.sectionHeader}>
        <ThemedText type="headlineSm" accessibilityRole="header">
          Tin thu mua của tôi
        </ThemedText>
      </View>
      <Link href="/buyer-demand-form" asChild>
        <Pressable accessibilityRole="button">
          {({ pressed }) => (
            <View style={[styles.primaryButton, { backgroundColor: pressed ? theme.primary : theme.primaryContainer }]}>
              <Icon name="add_circle" size={20} color={theme.onPrimary} />
              <ThemedText type="titleMd" style={{ color: theme.onPrimary }}>
                Đăng tin thu mua
              </ThemedText>
            </View>
          )}
        </Pressable>
      </Link>
    </View>
  );

  return (
    <FlatList
      data={sorted}
      keyExtractor={(post) => post.id}
      ListHeaderComponent={header}
      ListEmptyComponent={
        <ThemedText type="bodySm" themeColor="textSecondary" style={styles.empty}>
          Bạn chưa có tin thu mua nào. Đăng giá và số lượng cần mua để người bán gần bạn tìm thấy.
        </ThemedText>
      }
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      renderItem={({ item }) => (
        <PostRow
          post={item}
          now={now}
          confirming={confirmingDelete === item.id}
          onAskDelete={() => setConfirmingDelete(item.id)}
          onCancelDelete={() => setConfirmingDelete(null)}
          onDelete={() => {
            setPosts((current) => current.filter((post) => post.id !== item.id));
            setConfirmingDelete(null);
          }}
        />
      )}
    />
  );
}

function PostRow({
  post,
  now,
  confirming,
  onAskDelete,
  onCancelDelete,
  onDelete,
}: {
  post: BuyingDemand;
  now: Date;
  confirming: boolean;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onDelete: () => void;
}) {
  const theme = useTheme();
  const active = isPostActive(post, now);
  const label = COMMODITIES.find((c) => c.id === post.commodity)?.label ?? post.commodity;
  const quantityText =
    post.desiredQuantity == null
      ? 'Không giới hạn số lượng'
      : `Còn cần ${formatAmount(post.remainingQuantity ?? 0)} / ${formatAmount(post.desiredQuantity)} ${post.unit}`;

  return (
    <ThemedView type="backgroundElement" style={[styles.card, { borderColor: theme.border }]}>
      <View style={styles.cardTop}>
        <ThemedText type="titleMd">{label}</ThemedText>
        <ThemedView
          style={[styles.badge, { backgroundColor: active ? theme.accentSoft : theme.surfaceContainerHighest }]}>
          <ThemedText type="labelSm" style={{ color: active ? theme.primary : theme.textSecondary }}>
            {active ? expiryLabel(post, now) : post.remainingQuantity === 0 ? 'Đã đủ hàng' : 'Đã hết hạn'}
          </ThemedText>
        </ThemedView>
      </View>
      <View style={styles.priceRow}>
        <ThemedText type="numericLg">{formatAmount(post.pricePerUnit)}</ThemedText>
        <ThemedText type="bodySm" themeColor="textSecondary">
          {' '}
          ₫/{post.unit}
        </ThemedText>
      </View>
      <ThemedText type="bodySm" themeColor="textSecondary">
        {quantityText}
      </ThemedText>
      {post.qualityRequirements && <ThemedText type="bodySm">Chất lượng: {post.qualityRequirements}</ThemedText>}
      {post.priceNote && (
        <ThemedText type="bodySm" themeColor="textSecondary">
          {post.priceNote}
        </ThemedText>
      )}
      {post.area && (
        <ThemedText type="labelSm" themeColor="textSecondary">
          Khu vực: {post.area}
        </ThemedText>
      )}

      {confirming ? (
        <View style={styles.actions}>
          <ThemedText type="labelMd" style={styles.confirmText}>
            Xóa tin này? Người bán sẽ không thấy tin nữa.
          </ThemedText>
          <Pressable accessibilityRole="button" onPress={onCancelDelete} style={[styles.action, { borderColor: theme.outline }]}>
            <ThemedText type="labelMd">Giữ lại</ThemedText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Xác nhận xóa tin ${label}`}
            onPress={onDelete}
            style={[styles.action, { backgroundColor: theme.lossContainer, borderColor: theme.loss }]}>
            <ThemedText type="labelMd" style={{ color: theme.loss }}>
              Xóa
            </ThemedText>
          </Pressable>
        </View>
      ) : (
        <View style={styles.actions}>
          <Link href={{ pathname: '/buyer-demand-form', params: { id: post.id } }} asChild>
            <Pressable accessibilityRole="button" accessibilityLabel={`${active ? 'Sửa' : 'Gia hạn'} tin ${label}`}>
              {/* Link asChild rejects array styles on its child, so the styled box sits inside. */}
              <View style={[styles.action, { borderColor: theme.outline }]}>
                <ThemedText type="labelMd" themeColor="primary">
                  {active ? 'Sửa' : 'Gia hạn'}
                </ThemedText>
              </View>
            </Pressable>
          </Link>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Xóa tin ${label}`}
            onPress={onAskDelete}
            style={[styles.action, { borderColor: theme.border }]}>
            <ThemedText type="labelMd" themeColor="textSecondary">
              Xóa
            </ThemedText>
          </Pressable>
        </View>
      )}
    </ThemedView>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <ThemedText type="labelMd" themeColor="textSecondary">
        {label}
      </ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1 },
  content: {
    padding: Spacing.three,
    gap: 12,
  },
  header: {
    gap: Spacing.three,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    padding: 12,
    borderRadius: Radius.container,
  },
  noticeText: { flex: 1 },
  section: { gap: 12 },
  sectionHeader: { marginTop: Spacing.two },
  field: { gap: Spacing.one },
  input: {
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: Radius.container,
    borderWidth: 1,
    fontSize: 16,
  },
  primaryButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderRadius: Radius.container,
  },
  empty: { paddingVertical: Spacing.three },
  card: {
    borderWidth: 1,
    borderRadius: Radius.container,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  badge: {
    borderRadius: Radius.base,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  confirmText: { flexBasis: '100%' },
  action: {
    minHeight: 44,
    minWidth: 88,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.container,
    borderWidth: 1,
  },
});
