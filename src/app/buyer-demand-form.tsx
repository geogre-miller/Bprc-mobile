import { useLocalSearchParams } from 'expo-router';

import { BuyerDemandForm } from '@/screens/buyer-demand-form';

export default function BuyerDemandFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <BuyerDemandForm id={id} />;
}
