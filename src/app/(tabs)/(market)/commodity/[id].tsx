import { useLocalSearchParams } from 'expo-router';

import { COMMODITIES } from '@/data/mock-data';
import { CommodityDetail } from '@/screens/commodity-detail';

export default function CommodityDetailScreen() {
  const { id, label, price } = useLocalSearchParams<{ id: string; label?: string; price?: string }>();
  const commodity = COMMODITIES.find((item) => item.id === id)?.id;
  const parsedPrice = price == null ? undefined : Number(price);
  const currentPrice = parsedPrice != null && Number.isFinite(parsedPrice) ? parsedPrice : undefined;

  return <CommodityDetail commodity={commodity} commodityLabel={label} currentPrice={currentPrice} />;
}
