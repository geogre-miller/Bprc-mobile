import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Layout, LightPalette, Radius } from '@/constants/theme';

/** White tonal card on the tinted canvas: DESIGN.md card padding, 8px radius, hairline lift. */
export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.container,
    padding: Layout.cardPadding,
    gap: Layout.gutter,
    backgroundColor: LightPalette.surfaceLowest,
    shadowColor: LightPalette.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
});
