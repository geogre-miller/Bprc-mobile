import { Link } from 'expo-router';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { BUYERS, COMMODITIES } from '@/data/mock-data';

function commodityLabels(ids: string[]): string {
  return ids
    .map((id) => COMMODITIES.find((commodity) => commodity.id === id)?.label ?? id)
    .join(', ');
}

export function BuyerList() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ThemedText type="title" style={styles.title}>
        Đầu mối thu mua
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
        Gần khu vực của bạn
      </ThemedText>

      <FlatList
        data={BUYERS}
        keyExtractor={(buyer) => buyer.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Link href={{ pathname: '/buyer/[id]', params: { id: item.id } }} asChild>
            <Pressable style={({ pressed }) => pressed && styles.pressed}>
              <ThemedView type="backgroundElement" style={styles.card}>
                <ThemedView type="backgroundElement" style={styles.cardHeader}>
                  <ThemedText type="smallBold">{item.name}</ThemedText>
                  {item.verified && (
                    <ThemedText type="small" themeColor="textSecondary">
                      Đã xác minh
                    </ThemedText>
                  )}
                </ThemedView>
                <ThemedText type="small" themeColor="textSecondary">
                  {item.address.district}, {item.address.province}
                </ThemedText>
                <ThemedText type="small">{commodityLabels(item.commodities)}</ThemedText>
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
  card: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    gap: Spacing.half,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
