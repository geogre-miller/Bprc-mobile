import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Icon } from './icons';
import { FARMER_NAME, HOME_REGION } from './use-dashboard-data';

/** Greeting, today's date, and the region bar carrying the price feed's freshness. */
export function GreetingSection({ now, updatedLabel }: { now: Date; updatedLabel?: string }) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.section}>
      <ThemedText type="subtitle" themeColor="primary">
        Xin chào, {FARMER_NAME} 👋
      </ThemedText>
      <ThemedText type="bodySm" themeColor="textSecondary">
        Hôm nay, {now.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </ThemedText>
      <ThemedView type="backgroundSelected" style={styles.locationBar}>
        <ThemedView type="backgroundSelected" style={styles.locationLeft}>
          <Icon name="location_on" size={16} color={theme.accent} />
          <ThemedText type="labelSm" themeColor="textSecondary" numberOfLines={1} style={styles.locationText}>
            {HOME_REGION}
            {updatedLabel ? ` • Cập nhật ${updatedLabel}` : ''}
          </ThemedText>
        </ThemedView>
        {/* ponytail: no region picker screen exists yet, so this points at account settings. */}
        <Link href="/account" asChild>
          <Pressable accessibilityLabel="Đổi vùng" style={styles.locationAction}>
            <ThemedText type="labelSm" style={{ color: theme.accent }}>
              Đổi vùng
            </ThemedText>
            <Icon name="tune" size={14} color={theme.accent} />
          </Pressable>
        </Link>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.one,
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    marginTop: Spacing.one,
    borderRadius: Radius.container,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  locationText: {
    flexShrink: 1,
  },
  locationAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
  },
});
