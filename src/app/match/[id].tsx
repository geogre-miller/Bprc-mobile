import { useLocalSearchParams } from 'expo-router';

import { Match } from '@/screens/match';

export default function MatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Match id={id} />;
}
