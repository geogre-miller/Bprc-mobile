import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'inventory',
};

export default function InventoryStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
