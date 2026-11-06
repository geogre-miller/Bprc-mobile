import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Layout, LightPalette, Radius } from '@/constants/theme';
import { Icon, type IconName } from '@/screens/home-dashboard/icons';

type ChipProps = {
  label: string;
  onPress: () => void;
  selected?: boolean;
  /** Leading glyph. */
  icon?: IconName;
  /** Trailing chevron: the chip opens a picker instead of toggling. */
  dropdown?: boolean;
  /** `md` is a 44px filter chip. `sm` is a 32px inline sort chip (hitSlop keeps the touch area usable). */
  size?: 'md' | 'sm';
  accessibilityLabel?: string;
};

/** One chip for filters, pickers and sort toggles. Selected = solid secondary, idle = surface. */
export function Chip({
  label,
  onPress,
  selected = false,
  icon,
  dropdown = false,
  size = 'md',
  accessibilityLabel,
}: ChipProps) {
  const small = size === 'sm';
  const fg = selected ? LightPalette.onPrimary : LightPalette.onSurfaceVariant;
  const iconColor = selected ? LightPalette.onPrimary : small ? LightPalette.onSurfaceVariant : LightPalette.secondary;
  const iconSize = small ? 15 : 16;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      hitSlop={small ? 6 : 4}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        small ? styles.small : styles.medium,
        {
          backgroundColor: selected
            ? LightPalette.secondary
            : small
              ? LightPalette.surfaceLow
              : LightPalette.surface,
        },
        pressed && styles.pressed,
      ]}>
      {icon && <Icon name={icon} size={iconSize} color={iconColor} />}
      <ThemedText type={small ? 'labelSm' : 'labelMd'} style={{ color: fg, fontWeight: small ? '600' : '500' }}>
        {label}
      </ThemedText>
      {dropdown && <Icon name="expand_more" size={iconSize} color={fg} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  medium: {
    minHeight: Layout.touchTarget,
    gap: 6,
    paddingHorizontal: 16,
    shadowColor: LightPalette.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  small: {
    minHeight: 32,
    gap: 4,
    paddingHorizontal: 12,
  },
  pressed: {
    opacity: 0.78,
  },
});
