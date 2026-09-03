import { useLocalSearchParams } from 'expo-router';

import { CommodityDetail } from '@/screens/commodity-detail';
import type { Commodity } from '@/types/domain';

export default function CommodityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: Commodity }>();
  return <CommodityDetail commodity={id} />;
}
