import { forwardRef } from 'react';
import { StyleSheet, TextInput, type TextInputProps, type TextStyle } from 'react-native';

import { fontFamilyFor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * TextInput with DESIGN.md typography: Public Sans at body-lg (16px) by default, the static font
 * file picked from the effective weight, tabular figures for numeric keyboards.
 * Callers keep full control of layout, size, and colour through `style`.
 */
export const ThemedTextInput = forwardRef<TextInput, TextInputProps>(function ThemedTextInput(
  { style, placeholderTextColor, keyboardType, ...rest },
  ref,
) {
  const theme = useTheme();
  const flat = (StyleSheet.flatten(style) ?? {}) as TextStyle;
  const numeric = keyboardType === 'numeric' || keyboardType === 'number-pad' || keyboardType === 'decimal-pad';

  return (
    <TextInput
      ref={ref}
      keyboardType={keyboardType}
      placeholderTextColor={placeholderTextColor ?? theme.outline}
      style={[
        styles.base,
        { color: theme.text },
        numeric && styles.numeric,
        style,
        { fontFamily: fontFamilyFor('publicSans', Number(flat.fontWeight ?? 400)), fontWeight: 'normal' },
      ]}
      {...rest}
    />
  );
});

const styles = StyleSheet.create({
  base: {
    fontSize: 16,
  },
  numeric: {
    fontVariant: ['tabular-nums'],
  },
});
