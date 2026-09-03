import { useLocalSearchParams } from 'expo-router';

import { BuyerDetail } from '@/screens/buyer-detail';

export default function BuyerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <BuyerDetail buyerId={id} />;
}
