import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Icon } from './icons';

/** Price freshness. Stale prices are called out, never shown as current. Region lives in the header. */
export function FreshnessBar({ updatedLabel, stale }: { updatedLabel?: string; stale: boolean }) {
  const theme = useTheme();
  const freshness = !updatedLabel
    ? 'Chưa có dữ liệu giá'
    : stale
      ? `Giá chưa cập nhật hôm nay (lần cuối ${updatedLabel})`
      : `Giá cập nhật ${updatedLabel}`;

  return (
    <ThemedView
      style={[styles.bar, { backgroundColor: stale ? theme.pendingContainer : theme.backgroundSelected }]}>
      <View style={styles.left}>
        <Icon name={stale ? 'schedule' : 'check_circle'} size={16} color={stale ? theme.pending : theme.accent} />
        <ThemedText type="labelMd" style={[styles.text, { color: stale ? theme.pending : theme.textSecondary }]}>
          {freshness}
        </ThemedText>
      </View>
      {/* ponytail: no region picker screen exists yet, so this points at account settings. */}
      <Link href="/account" asChild>
        <Pressable accessibilityRole="button" accessibilityLabel="Đổi vùng" style={styles.action}>
          <ThemedText type="labelMd" style={{ color: theme.accent }}>
            Đổi vùng
          </ThemedText>
          <Icon name="tune" size={16} color={theme.accent} />
        </Pressable>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    borderRadius: Radius.container,
    paddingLeft: 12,
    paddingVertical: Spacing.one,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexShrink: 1,
  },
  text: {
    flexShrink: 1,
  },
  action: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: 12,
  },
});
