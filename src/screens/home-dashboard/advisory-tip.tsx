import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Icon } from './icons';
import type { PriceRow } from './use-dashboard-data';

/** Selling advice derived from the day's biggest mover. */
export function AdvisoryTip({ topMover }: { topMover?: PriceRow }) {
  const theme = useTheme();
  if (!topMover?.latest || topMover.changePercent == null) return null;

  const rising = topMover.changePercent >= 0;

  return (
    <ThemedView type="backgroundSelected" style={styles.tip}>
      <Icon name="lightbulb" size={20} color={theme.accent} />
      <ThemedView type="backgroundSelected" style={styles.body}>
        <ThemedText type="labelMd" style={styles.title}>
          Kinh nghiệm nhà nông:
        </ThemedText>
        <ThemedText type="bodySm" themeColor="textSecondary">
          Giá {topMover.label} đang {rising ? 'tăng' : 'giảm'} {Math.abs(topMover.changePercent).toFixed(1)}% hôm nay
          {rising
            ? ', đây có thể là thời điểm tốt để chốt bán một phần lượng hàng lưu kho.'
            : ', cân nhắc chờ giá ổn định trước khi bán.'}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: Radius.container,
    padding: 12,
  },
  body: {
    flex: 1,
  },
  title: {
    fontWeight: '700',
  },
});
