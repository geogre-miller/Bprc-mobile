import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'buyers',
};

export default function BuyersStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
