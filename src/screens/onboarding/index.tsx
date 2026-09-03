import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

type Role = 'farmer' | 'buyer';

const ROLE_OPTIONS: { id: Role; label: string; description: string }[] = [
  { id: 'farmer', label: 'Tôi là nông dân', description: 'Xem giá, tìm đầu mối thu mua gần bạn' },
  { id: 'buyer', label: 'Tôi là đầu mối thu mua', description: 'Đăng giá và nhu cầu thu mua' },
];

export function Onboarding() {
  const [role, setRole] = useState<Role | null>(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedText type="title" style={styles.title}>
        Rẫy Giá
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.subtitle}>
        Giá nông sản và đầu mối thu mua gần bạn
      </ThemedText>

      <ThemedView style={styles.options}>
        {ROLE_OPTIONS.map((option) => (
          <Pressable key={option.id} onPress={() => setRole(option.id)}>
            <ThemedView
              type={role === option.id ? 'backgroundSelected' : 'backgroundElement'}
              style={styles.optionCard}>
              <ThemedText type="smallBold">{option.label}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {option.description}
              </ThemedText>
            </ThemedView>
          </Pressable>
        ))}
      </ThemedView>

      <Pressable
        disabled={!role}
        onPress={() => router.replace('/')}
        style={({ pressed }) => [styles.continueButton, (pressed || !role) && styles.disabled]}>
        <ThemedView type="text" style={styles.continueButton}>
          <ThemedText themeColor="background" type="smallBold">
            Tiếp tục
          </ThemedText>
        </ThemedView>
      </Pressable>

      <Pressable onPress={() => router.replace('/')}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.skip}>
          Bỏ qua, xem giá ngay
        </ThemedText>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    gap: Spacing.four,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
  },
  subtitle: {
    marginTop: -Spacing.three,
  },
  options: {
    gap: Spacing.two,
  },
  optionCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.half,
  },
  continueButton: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  skip: {
    textAlign: 'center',
  },
});
