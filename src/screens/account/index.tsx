import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';

const MENU_ITEMS = [
  { href: '/inventory', label: 'Nông sản đang có', description: 'Ước tính giá trị theo giá hiện tại' },
  { href: '/alerts', label: 'Báo giá mục tiêu', description: 'Nhận biết khi giá đạt mức mong muốn' },
  { href: '/journal', label: 'Nhật ký bán hàng', description: 'Lịch sử các lần bán và giá thực nhận' },
  { href: '/demands', label: 'Đang cần mua', description: 'Nhu cầu thu mua từ các đầu mối gần bạn' },
] as const;

export function Account() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ThemedText type="title" style={styles.title}>
        Của tôi
      </ThemedText>

      <ThemedView style={styles.list}>
        {MENU_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} asChild>
            <Pressable style={({ pressed }) => pressed && styles.pressed}>
              <ThemedView type="backgroundElement" style={styles.row}>
                <ThemedText type="smallBold">{item.label}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {item.description}
                </ThemedText>
              </ThemedView>
            </Pressable>
          </Link>
        ))}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    marginBottom: Spacing.three,
  },
  list: {
    gap: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
  row: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.half,
  },
});
