import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Colors } from '@/constants/theme';

const AppNavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.primary,
    background: Colors.light.background,
    card: Colors.light.backgroundElement,
    text: Colors.light.text,
    border: Colors.light.border,
    notification: Colors.light.pending,
  },
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <ThemeProvider value={AppNavigationTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="alerts" options={{ headerShown: true, title: 'Báo giá mục tiêu' }} />
        <Stack.Screen name="journal" options={{ headerShown: true, title: 'Nhật ký bán hàng' }} />
        <Stack.Screen name="demands" options={{ headerShown: true, title: 'Đang cần mua' }} />
        <Stack.Screen name="selling-intents" options={{ headerShown: true, title: 'Ý định bán' }} />
        <Stack.Screen name="match/[id]" options={{ headerShown: true, title: 'So sánh đầu mối' }} />
        <Stack.Screen name="buyer-dashboard" options={{ headerShown: true, title: 'Kênh đầu mối' }} />
        <Stack.Screen
          name="buyer-price-form"
          options={{ headerShown: true, title: 'Cập nhật giá thu mua', presentation: 'modal' }}
        />
        <Stack.Screen
          name="buyer-demand-form"
          options={{ headerShown: true, title: 'Cập nhật nhu cầu thu mua', presentation: 'modal' }}
        />
        <Stack.Screen name="onboarding" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
