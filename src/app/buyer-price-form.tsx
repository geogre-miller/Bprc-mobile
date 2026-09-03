import { useLocalSearchParams } from 'expo-router';

import { BuyerPriceForm } from '@/screens/buyer-price-form';
import type { Commodity } from '@/types/domain';

export default function BuyerPriceFormScreen() {
  const { commodity } = useLocalSearchParams<{ commodity?: Commodity }>();
  return <BuyerPriceForm commodity={commodity} />;
}
