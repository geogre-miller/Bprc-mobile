import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Colors } from '@/constants/theme';
import { BOTTOM_NAV_ITEMS } from '@/constants/navigation';

export default function AppTabs() {
  const colors = Colors.light;

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name={BOTTOM_NAV_ITEMS[0].tabName}>
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
