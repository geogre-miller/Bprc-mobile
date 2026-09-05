import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset, Spacing } from '@/constants/theme';

import { AdvisoryTip } from './advisory-tip';
import { BuyerInquiryCard } from './buyer-inquiry-card';
import { DashboardHeader } from './dashboard-header';
import { GreetingSection } from './greeting-section';
import { MarketBulletin } from './market-bulletin';
import { PortfolioSummaryCard } from './portfolio-summary-card';
import { PriceTracker } from './price-tracker';
import { useDashboardData } from './use-dashboard-data';

export function HomeDashboard() {
  const data = useDashboardData();
  if (!data) return null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <DashboardHeader />
      <ScrollView contentContainerStyle={styles.content}>
        <GreetingSection now={data.now} updatedLabel={data.updatedLabel} />
        <MarketBulletin movers={data.movers} />
        <PortfolioSummaryCard
          now={data.now}
          inventoryValue={data.inventoryValue}
          inventoryChangePercent={data.inventoryChangePercent}
          gainVsQuoted={data.gainVsQuoted}
          revenueThisMonth={data.revenueThisMonth}
          closedDealCount={data.closedDealCount}
        />
        <PriceTracker rows={data.priceRows} />
        {data.demandHighlight && <BuyerInquiryCard highlight={data.demandHighlight} />}
        <AdvisoryTip topMover={data.topMover} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    gap: 12,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
  },
});
