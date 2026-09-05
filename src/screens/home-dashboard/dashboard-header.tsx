import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Icon } from './icons';
import { HOME_REGION } from './use-dashboard-data';

/** Brand mark, region context, notifications and profile — the design's 64px top bar. */
export function DashboardHeader() {
  const theme = useTheme();

  return (
    <ThemedView style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
      <ThemedView style={styles.brand}>
        <ThemedView style={[styles.brandMark, { backgroundColor: theme.accentSoft }]}>
          <Icon name="storefront" size={18} color={theme.primary} />
        </ThemedView>
        <ThemedView>
          <ThemedText type="titleMd" themeColor="primary">
            NôngSản Pro
          </ThemedText>
          <ThemedView style={styles.regionRow}>
            <Icon name="location_on" size={14} color={theme.accent} />
            <ThemedText type="labelSm" themeColor="textSecondary">
              {HOME_REGION}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.actions}>
        <Pressable accessibilityLabel="Thông báo">
          <ThemedView type="backgroundSelected" style={styles.button}>
            <Icon name="notifications" size={22} color={theme.textSecondary} />
            <View style={[styles.badgeDot, { backgroundColor: theme.loss, borderColor: theme.background }]} />
          </ThemedView>
        </Pressable>
        <Link href="/account" asChild>
          <Pressable accessibilityLabel="Cá nhân">
            <ThemedView style={[styles.avatar, { backgroundColor: theme.accentSoft }]}>
              <Icon name="person" size={20} color={theme.primary} />
            </ThemedView>
          </Pressable>
        </Link>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  brandMark: {
    width: 32,
    height: 32,
    borderRadius: Radius.container,
    alignItems: 'center',
    justifyContent: 'center',
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: Radius.container,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: Radius.full,
    borderWidth: 2,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
