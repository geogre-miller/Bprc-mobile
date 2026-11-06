import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { freshnessMessage } from './freshness';
import { Icon } from './icons';

/** Price freshness. Stale prices are called out, never shown as current. Region lives in the header. */
export function FreshnessBar({ updatedLabel, stale }: { updatedLabel?: string; stale: boolean }) {
  const theme = useTheme();
  const freshness = freshnessMessage(updatedLabel, stale);

  return (
    <ThemedView
      style={[styles.bar, { backgroundColor: stale ? theme.pendingContainer : theme.backgroundSelected }]}>
      <View style={styles.left}>
        <Icon name={stale ? 'schedule' : 'check_circle'} size={16} color={stale ? theme.pending : theme.accent} />
        <ThemedText type="labelMd" style={[styles.text, { color: stale ? theme.pending : theme.textSecondary }]}>
          {freshness}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.container,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: Spacing.two,
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
});
