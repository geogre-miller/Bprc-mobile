import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="commodity/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="buyer/[id]" options={{ headerShown: true, title: 'Đầu mối thu mua' }} />
        <Stack.Screen name="inventory" options={{ headerShown: true, title: 'Nông sản đang có' }} />
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
