import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Layout, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useReadNotifications } from '@/hooks/use-unread-notifications';
import { Icon } from '@/screens/home-dashboard/icons';

const DEFAULT_REGION = 'Tây Nguyên • Đắk Lắk';
/** Largest text scale the fixed-height brand row is designed for. */
const MAX_FONT_SCALE = 1.3;

type AppHeaderProps = {
  /** Region line under the brand name. */
  region?: string;
  /** True on the account screen itself: the avatar shows as selected and does not navigate. */
  accountSelected?: boolean;
};

/**
 * The single brand top bar (logo, region, notifications, profile) for tab root screens and the
 * tab detail screens. The screen owns the top safe area (`SafeAreaView edges={['top']}`); this
 * component never reads insets. Pushed routes use the native header from the root Stack.
 */
export function AppHeader({ region = DEFAULT_REGION, accountSelected = false }: AppHeaderProps) {
  const theme = useTheme();
  const router = useRouter();
  const { unreadCount } = useReadNotifications();

  return (
    <View
      style={[
        styles.header,
        { backgroundColor: theme.background, borderBottomColor: theme.borderSubtle },
      ]}>
      <View style={styles.brand}>
        <Image
          accessibilityLabel="Biểu trưng Mùa Vàng"
          source={require('@/assets/images/nongsan-pro-logo.png')}
          contentFit="contain"
          style={[styles.brandMark, { backgroundColor: theme.backgroundSelected }]}
        />
        <View style={styles.brandCopy}>
          <ThemedText
            type="titleMd"
            themeColor="primary"
            numberOfLines={1}
            maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Mùa Vàng
          </ThemedText>
          <View style={styles.regionRow}>
            <Icon name="location_on" size={14} color={theme.accent} />
            <ThemedText
              type="labelSm"
              themeColor="textSecondary"
              numberOfLines={1}
              maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {region}
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={unreadCount > 0 ? `Thông báo, ${unreadCount} chưa đọc` : 'Thông báo'}
          onPress={() => router.push('/alerts')}
          style={({ pressed }) => [
            styles.touch,
            { backgroundColor: theme.backgroundSelected },
            pressed && styles.pressed,
          ]}>
          <Icon name="notifications" size={22} color={theme.textSecondary} />
          {unreadCount > 0 && (
            <View
              style={[styles.badgeDot, { backgroundColor: theme.loss, borderColor: theme.background }]}
            />
          )}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mở trang cá nhân"
          accessibilityState={{ selected: accountSelected }}
          onPress={accountSelected ? undefined : () => router.push('/account')}
          style={({ pressed }) => [styles.touch, pressed && styles.pressed]}>
          <Image
            accessibilityLabel="Ảnh đại diện"
            source={require('@/assets/images/nongsan-pro-profile.png')}
            contentFit="cover"
            style={styles.avatar}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingHorizontal: Layout.screenMargin,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  brand: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  brandCopy: {
    flexShrink: 1,
  },
  brandMark: {
    width: 32,
    height: 32,
    borderRadius: Radius.container,
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
  touch: {
    width: Layout.touchTarget,
    height: Layout.touchTarget,
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
  pressed: {
    opacity: 0.7,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
});
