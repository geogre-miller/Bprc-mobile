import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { StackActions, type NavigationState } from 'expo-router/react-navigation';

import { Colors } from '@/constants/theme';
import { BOTTOM_NAV_ITEMS } from '@/constants/navigation';

export default function AppTabs() {
  const colors = Colors.light;

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.accentSoft}
      iconColor={{ default: colors.textSecondary, selected: colors.primary }}
      labelStyle={{ default: { color: colors.textSecondary }, selected: { color: colors.primary } }}
      tintColor={colors.primary}
      shadowColor={colors.borderSubtle}
      blurEffect="none"
      disableTransparentOnScrollEdge>
      <NativeTabs.Trigger
        name={BOTTOM_NAV_ITEMS[0].tabName}
        listeners={({ navigation, route }) => ({
          tabPress: () => {
            const tabState: NavigationState = navigation.getState();
            const homeStack = tabState.routes.find((item) => item.key === route.key)?.state;
            // Home always opens the dashboard, including when returning from another tab.
            if (homeStack?.key && (homeStack.index ?? 0) > 0) {
              navigation.dispatch({ ...StackActions.popToTop(), target: homeStack.key });
            }
          },
        })}>
        <NativeTabs.Trigger.Label>{BOTTOM_NAV_ITEMS[0].label}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name={BOTTOM_NAV_ITEMS[1].tabName}>
        <NativeTabs.Trigger.Label>{BOTTOM_NAV_ITEMS[1].label}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="chart.line.uptrend.xyaxis" md="trending_up" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name={BOTTOM_NAV_ITEMS[2].tabName}>
        <NativeTabs.Trigger.Label>{BOTTOM_NAV_ITEMS[2].label}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="storefront" md="storefront" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name={BOTTOM_NAV_ITEMS[3].tabName}>
        <NativeTabs.Trigger.Label>{BOTTOM_NAV_ITEMS[3].label}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="archivebox" md="inventory_2" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name={BOTTOM_NAV_ITEMS[4].tabName}>
        <NativeTabs.Trigger.Label>{BOTTOM_NAV_ITEMS[4].label}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.crop.circle" md="account_circle" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
