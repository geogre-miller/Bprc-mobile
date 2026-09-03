import { Link } from 'expo-router';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { BUYERS, BUYING_DEMANDS, COMMODITIES } from '@/data/mock-data';
import { formatVnd } from '@/utils/format-price';

export function BuyingDemands() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ThemedText type="title" style={styles.title}>
        Đang cần mua
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
        Nhu cầu thu mua hiện tại từ các đầu mối gần bạn
      </ThemedText>

      <FlatList
        data={BUYING_DEMANDS}
        keyExtractor={(demand) => demand.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const buyer = BUYERS.find((b) => b.id === item.buyerId);
          const label = COMMODITIES.find((c) => c.id === item.commodity)?.label ?? item.commodity;
          return (
            <Link href={{ pathname: '/buyer/[id]', params: { id: item.buyerId } }} asChild>
              <Pressable style={({ pressed }) => pressed && styles.pressed}>
                <ThemedView type="backgroundElement" style={styles.card}>
                  <ThemedText type="smallBold">{label}</ThemedText>
                  <ThemedText>
                    {formatVnd(item.priceRangeMin)} - {formatVnd(item.priceRangeMax)}/{item.unit}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Còn cần {item.remainingQuantity} {item.unit} · {buyer?.name}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            </Link>
          );
        }}
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
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.half,
  },
});
