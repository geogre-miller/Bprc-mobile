import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset, Spacing, Layout } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { BuyerInquiryCard } from './buyer-inquiry-card';
import { DashboardHeader } from './dashboard-header';
import { FreshnessBar } from './freshness-bar';
import { MarketBulletin } from './market-bulletin';
import { MyCommodities } from './my-commodities';
import { PortfolioSummaryCard } from './portfolio-summary-card';
import { PriceTracker } from './price-tracker';
import { useDashboardData } from './use-dashboard-data';

/**
 * Seller home. Order answers, in turn: what is my stock worth today, who nearby pays most,
 * what moved, how am I doing, then the full board.
 */
export function HomeDashboard() {
  const theme = useTheme();
  const data = useDashboardData();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <DashboardHeader />
      {!data ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.primary} accessibilityLabel="Đang tải giá" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <FreshnessBar updatedLabel={data.updatedLabel} stale={data.pricesStale} />
          <MyCommodities rows={data.myRows} />
          {data.myRows.length > 0 && <BuyerInquiryCard highlight={data.demandHighlight} />}
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
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    gap: Layout.sectionGap,
    paddingHorizontal: Layout.screenMargin,
    paddingTop: Layout.screenMargin,
    paddingBottom: BottomTabInset + Spacing.four,
  },
});
