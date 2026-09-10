import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'market',
};

export default function MarketStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
