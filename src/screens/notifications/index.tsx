import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { NOTIFICATIONS, type NotificationCategory, type NotificationItem } from '@/data/notifications';
import { useReadNotifications } from '@/hooks/use-unread-notifications';
import { useTheme } from '@/hooks/use-theme';

import { DashboardHeader } from '../home-dashboard/dashboard-header';
import { Icon } from '../home-dashboard/icons';

type NotificationFilter = 'all' | NotificationCategory;


const FILTERS: readonly { key: NotificationFilter; label: string }[] = [
  { key: 'all', label: `Tất cả ${NOTIFICATIONS.length}` },
  { key: 'price', label: 'Biến động giá' },
  { key: 'buyer', label: 'Yêu cầu mua' },
  { key: 'system', label: 'Hệ thống' },
];


function NotificationCard({ item, onAction }: { item: NotificationItem; onAction: (label: string) => void }) {
  const theme = useTheme();
  const actions = item.actions;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surfaceContainerLowest,
          shadowColor: theme.primary,
          opacity: item.unread ? 1 : 0.82,
        },
      ]}>
      <View style={styles.cardRow}>
        <View style={[styles.iconWell, { backgroundColor: item.iconBackground }]}>
          <Icon name={item.icon} size={20} color={item.iconColor} />
        </View>
        <View style={styles.cardCopy}>
          <View style={styles.metaRow}>
            <ThemedText type="labelSm" style={{ color: item.iconColor }} numberOfLines={1}>
              {item.label}
            </ThemedText>
            <View style={styles.timeRow}>
              {item.unread && <View style={[styles.unreadDot, { backgroundColor: theme.error }]} />}
              <Icon name="schedule" size={13} color={theme.outline} />
              <ThemedText type="labelSm" themeColor="textSecondary" numberOfLines={1}>
                {item.time}
              </ThemedText>
            </View>
          </View>
          <ThemedText type="titleMd" style={styles.cardTitle}>
            {item.title}
          </ThemedText>
          <ThemedText type="bodySm" themeColor="textSecondary" style={styles.cardBody}>
            {item.body}
          </ThemedText>

          {item.metric && (
            <View
              style={[
                styles.metricRow,
                { backgroundColor: item.category === 'system' ? theme.errorContainer : theme.secondaryContainer },
              ]}>
              <Icon
                name={item.metricIcon ?? 'task_alt'}
                size={15}
                color={item.category === 'system' ? theme.onErrorContainer : theme.onSecondaryContainer}
              />
              <ThemedText
                type="labelMd"
                style={{ color: item.category === 'system' ? theme.onErrorContainer : theme.onSecondaryContainer }}>
                {item.metric}
              </ThemedText>
            </View>
          )}

          {item.verified && (
            <View style={[styles.verifiedRow, { backgroundColor: theme.surfaceContainerLow }]}>
              <Icon name="verified" size={15} color={theme.secondary} />
              <ThemedText type="bodySm" themeColor="textSecondary" style={styles.verifiedText}>
                {item.verified}
              </ThemedText>
            </View>
          )}

          {item.status && (
            <View style={[styles.statusRow, { borderTopColor: theme.surfaceContainerHigh }]}>
              <Icon name="task_alt" size={15} color={theme.secondary} />
              <ThemedText type="labelMd" style={{ color: theme.secondary }}>
                {item.status}
              </ThemedText>
            </View>
          )}

          {actions && (
            <View style={styles.actionsRow}>
              {actions.map((action, index) => (
                <Pressable
                  key={action}
                  accessibilityRole="button"
                  accessibilityLabel={action}
                  onPress={() => onAction(action)}
                  style={({ pressed }) => [
                    styles.actionButton,
                    index === 0 && actions.length > 1
                      ? [styles.secondaryAction, { borderColor: theme.outlineVariant }]
                      : [styles.primaryAction, { backgroundColor: theme.primary }],
                    pressed && styles.pressed,
                  ]}>
                  <ThemedText
                    type="labelMd"
                    style={{ color: index === 0 && actions.length > 1 ? theme.primary : theme.onPrimary }}>
                    {action}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

export function Notifications() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { readIds, unreadCount, markAllRead, isLoaded } = useReadNotifications();
  const [filter, setFilter] = useState<NotificationFilter>('all');

  const notifications = useMemo(
    () => NOTIFICATIONS.map((item) => ({ ...item, unread: item.unread && !readIds.includes(item.id) })),
    [readIds],
  );
  const filteredNotifications = useMemo(
    () => notifications.filter((notification) => filter === 'all' || notification.category === filter),
    [filter, notifications],
  );

  const handleAction = (_label: string) => {
    // These actions intentionally stay local until their destination flows are defined.
  };

  if (!isLoaded) return null;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <DashboardHeader />
      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + insets.bottom + Spacing.four }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.headingRow}>
          <View style={styles.headingCopy}>
            <View style={styles.headingTitleRow}>
              <ThemedText type="headlineSm">Cập nhật khẩn cấp</ThemedText>
              {unreadCount > 0 && <View style={[styles.unreadPulse, { backgroundColor: theme.error }]} />}
            </View>
            <ThemedText type="bodySm" themeColor="textSecondary">
              {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Bạn đã đọc hết thông báo'}
            </ThemedText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Đánh dấu đã đọc"
            accessibilityState={{ disabled: unreadCount === 0 }}
            disabled={unreadCount === 0}
            onPress={markAllRead}
            style={({ pressed }) => [styles.markReadButton, pressed && styles.pressed]}>
            <Icon name={unreadCount === 0 ? 'check_circle' : 'task_alt'} size={16} color={theme.secondary} />
            <ThemedText type="labelSm" style={{ color: theme.secondary }}>
              {unreadCount === 0 ? 'Đã đọc hết' : 'Đánh dấu đã đọc'}
            </ThemedText>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          style={styles.filterScroll}>
          {FILTERS.map((item) => {
            const selected = filter === item.key;
            return (
              <Pressable
                key={item.key}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                accessibilityState={{ selected }}
                onPress={() => setFilter(item.key)}
                style={({ pressed }) => [
                  styles.filterChip,
                  selected
                    ? { backgroundColor: theme.primary, borderColor: theme.primary }
                    : { backgroundColor: theme.surfaceContainerLow, borderColor: theme.surfaceContainerHigh },
                  pressed && styles.pressed,
                ]}>
                <ThemedText type="labelMd" style={{ color: selected ? theme.onPrimary : theme.onSurfaceVariant }}>
                  {item.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.notificationList}>
          {filteredNotifications.map((item) => (
            <NotificationCard key={item.id} item={item} onAction={handleAction} />
          ))}
          {filteredNotifications.length === 0 && (
            <View style={[styles.emptyState, { backgroundColor: theme.surfaceContainerLow }]}>
              <Icon name="notifications" size={24} color={theme.outline} />
              <ThemedText type="titleMd">Chưa có thông báo</ThemedText>
              <ThemedText type="bodySm" themeColor="textSecondary" style={styles.emptyCopy}>
                Khi có cập nhật mới, thông báo sẽ xuất hiện ở đây.
              </ThemedText>
            </View>
          )}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Thiết lập cảnh báo"
          onPress={() => undefined}
          style={({ pressed }) => [styles.settingsCard, { backgroundColor: theme.surfaceContainerLow }, pressed && styles.pressed]}>
          <View style={[styles.settingsIconWell, { backgroundColor: theme.secondaryContainer }]}>
            <Icon name="tune" size={20} color={theme.onSecondaryContainer} />
          </View>
          <View style={styles.settingsCopy}>
            <ThemedText type="titleMd">Cài đặt ngưỡng giá</ThemedText>
            <ThemedText type="bodySm" themeColor="textSecondary">
              Báo rung khi giá Robusta biến động &gt; 2,000₫/ngày
            </ThemedText>
          </View>
          <Icon name="chevron_right" size={20} color={theme.outline} />
        </Pressable>
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  headingCopy: {
    flex: 1,
    gap: Spacing.half,
  },
  headingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  unreadPulse: {
    width: 7,
    height: 7,
    borderRadius: Radius.full,
  },
  markReadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    minHeight: 32,
    paddingHorizontal: Spacing.one,
  },
  filterScroll: {
    marginHorizontal: -Spacing.three,
  },
  filterRow: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  filterChip: {
    minHeight: 36,
    justifyContent: 'center',
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
  },
  notificationList: {
    gap: Spacing.two,
  },
  card: {
    borderRadius: Radius.sheet,
    padding: Spacing.three,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconWell: {
    width: 40,
    height: 40,
    borderRadius: Radius.container,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCopy: {
    flex: 1,
    gap: Spacing.two,
    minWidth: 0,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.one,
    minHeight: 16,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  cardTitle: {
    lineHeight: 21,
  },
  cardBody: {
    lineHeight: 18,
  },
  metricRow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderRadius: Radius.base,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.one,
    borderRadius: Radius.base,
    padding: Spacing.two,
  },
  verifiedText: {
    flex: 1,
    lineHeight: 17,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.two,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actionButton: {
    minHeight: 34,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.container,
    paddingHorizontal: Spacing.two,
  },
  primaryAction: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  secondaryAction: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  unreadDot: {
    flexShrink: 0,
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
  emptyState: {
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.sheet,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
  },
  emptyCopy: {
    textAlign: 'center',
  },
  settingsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: Radius.sheet,
    padding: Spacing.three,
  },
  settingsIconWell: {
    width: 40,
    height: 40,
    borderRadius: Radius.container,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsCopy: {
    flex: 1,
    gap: Spacing.half,
  },
  pressed: {
    opacity: 0.7,
  },
});
