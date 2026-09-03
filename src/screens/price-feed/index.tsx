import { Link } from 'expo-router';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { COMMODITIES, latestObservation } from '@/data/mock-data';
import { formatPricePerUnit } from '@/utils/format-price';
import { CONFIDENCE_LABEL } from '@/utils/price-confidence';

export function PriceFeed() {
  const rows = COMMODITIES.map((commodity) => ({
    ...commodity,
    observation: latestObservation(commodity.id),
  }));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ThemedText type="title" style={styles.title}>
        Giá nông sản
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
        Ngọc Hồi, Kon Tum
      </ThemedText>

      <FlatList
        data={rows}
        keyExtractor={(row) => row.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Link href={{ pathname: '/commodity/[id]', params: { id: item.id } }} asChild>
            <Pressable style={({ pressed }) => pressed && styles.pressed}>
              <ThemedView type="backgroundElement" style={styles.row}>
                <ThemedView type="backgroundElement" style={styles.rowLeft}>
                  <ThemedText type="smallBold">{item.label}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {item.observation ? CONFIDENCE_LABEL[item.observation.confidence] : 'Chưa có dữ liệu'}
                  </ThemedText>
                </ThemedView>
                {item.observation && (
                  <ThemedText type="smallBold">
                    {formatPricePerUnit(item.observation.pricePerUnit, item.observation.unit)}
                  </ThemedText>
                )}
              </ThemedView>
            </Pressable>
          </Link>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  subtitle: {
    marginTop: Spacing.half,
    marginBottom: Spacing.three,
  },
  listContent: {
    gap: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  rowLeft: {
    gap: Spacing.half,
  },
});
