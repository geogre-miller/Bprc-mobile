import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { COMMODITIES } from '@/data/mock-data';
import { usePersistedState } from '@/hooks/use-persisted-state';
import { useTheme } from '@/hooks/use-theme';
import type { BuyerProfile, BuyingDemand, CurrentBuyingPrice } from '@/types/domain';
import { formatVnd } from '@/utils/format-price';

const EMPTY_PROFILE: BuyerProfile = {
  id: 'me-buyer',
  name: '',
  address: { line: '', district: 'Ngọc Hồi', province: 'Kon Tum' },
  commodities: [],
  contactPhone: '',
  verified: false,
};

export function BuyerDashboard() {
  const theme = useTheme();
  const [profile, setProfile] = usePersistedState<BuyerProfile>('my-buyer-profile', EMPTY_PROFILE);
  const [prices, setPrices, pricesLoaded] = usePersistedState<CurrentBuyingPrice[]>('my-buyer-prices', []);
  const [demands, setDemands, demandsLoaded] = usePersistedState<BuyingDemand[]>('my-buyer-demands', []);

  const removePrice = (commodity: string) => {
    setPrices((current) => current.filter((price) => price.commodity !== commodity));
  };

  const removeDemand = (id: string) => {
    setDemands((current) => current.filter((demand) => demand.id !== id));
  };

  if (!pricesLoaded || !demandsLoaded) return null;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ThemedText type="title" style={styles.title}>
        Kênh đầu mối thu mua
      </ThemedText>

      <ThemedView type="backgroundElement" style={styles.formColumn}>
        <TextInput
          value={profile.name}
          onChangeText={(name) => setProfile((current) => ({ ...current, name }))}
          placeholder="Tên đầu mối / doanh nghiệp"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text }]}
        />
        <TextInput
          value={profile.address.line}
          onChangeText={(line) => setProfile((current) => ({ ...current, address: { ...current.address, line } }))}
          placeholder="Địa chỉ"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text }]}
        />
        <TextInput
          value={profile.contactPhone}
          onChangeText={(contactPhone) => setProfile((current) => ({ ...current, contactPhone }))}
          placeholder="Số điện thoại liên hệ"
          placeholderTextColor={theme.textSecondary}
          keyboardType="phone-pad"
          style={[styles.input, { color: theme.text }]}
        />
      </ThemedView>

      <ThemedView style={styles.sectionHeader}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Giá đang thu mua
        </ThemedText>
        <Link href="/buyer-price-form" asChild>
          <Pressable>
            <ThemedText type="linkPrimary">Thêm giá</ThemedText>
          </Pressable>
        </Link>
      </ThemedView>

      {prices.length === 0 && <ThemedText themeColor="textSecondary">Chưa đăng giá nào.</ThemedText>}
      {prices.map((price) => {
        const label = COMMODITIES.find((c) => c.id === price.commodity)?.label ?? price.commodity;
        return (
          <ThemedView key={price.commodity} type="backgroundElement" style={styles.row}>
            <ThemedView type="backgroundElement" style={styles.rowLeft}>
              <ThemedText type="smallBold">{label}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {formatVnd(price.pricePerUnit)}/{price.unit}
              </ThemedText>
            </ThemedView>
            <ThemedView type="backgroundElement" style={styles.rowActions}>
              <Link href={{ pathname: '/buyer-price-form', params: { commodity: price.commodity } }} asChild>
                <Pressable>
                  <ThemedText type="small">Sửa</ThemedText>
                </Pressable>
              </Link>
              <Pressable onPress={() => removePrice(price.commodity)}>
                <ThemedText type="small" themeColor="textSecondary">
                  Xóa
                </ThemedText>
              </Pressable>
            </ThemedView>
          </ThemedView>
        );
      })}

      <ThemedView style={styles.sectionHeader}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Nhu cầu đang cần mua
        </ThemedText>
        <Link href="/buyer-demand-form" asChild>
          <Pressable>
            <ThemedText type="linkPrimary">Thêm nhu cầu</ThemedText>
          </Pressable>
        </Link>
      </ThemedView>

      {demands.length === 0 && <ThemedText themeColor="textSecondary">Chưa đăng nhu cầu nào.</ThemedText>}
      {demands.map((demand) => {
        const label = COMMODITIES.find((c) => c.id === demand.commodity)?.label ?? demand.commodity;
        return (
          <ThemedView key={demand.id} type="backgroundElement" style={styles.row}>
            <ThemedView type="backgroundElement" style={styles.rowLeft}>
              <ThemedText type="smallBold">{label}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {formatVnd(demand.priceRangeMin)} - {formatVnd(demand.priceRangeMax)}/{demand.unit} · còn{' '}
                {demand.remainingQuantity}/{demand.desiredQuantity} {demand.unit}
              </ThemedText>
            </ThemedView>
            <ThemedView type="backgroundElement" style={styles.rowActions}>
              <Link href={{ pathname: '/buyer-demand-form', params: { id: demand.id } }} asChild>
                <Pressable>
                  <ThemedText type="small">Sửa</ThemedText>
                </Pressable>
              </Link>
              <Pressable onPress={() => removeDemand(demand.id)}>
                <ThemedText type="small" themeColor="textSecondary">
                  Xóa
                </ThemedText>
              </Pressable>
            </ThemedView>
          </ThemedView>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  formColumn: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  input: {
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 26,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  rowLeft: {
    gap: Spacing.half,
  },
  rowActions: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
});
