import { Platform, StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { Colors, fontFamilyFor, Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'title'
    | 'small'
    | 'smallBold'
    | 'subtitle'
    | 'headlineSm'
    | 'titleMd'
    | 'bodySm'
    | 'labelMd'
    | 'labelSm'
    | 'numericLg'
    | 'numericHero'
    | 'link'
    | 'linkPrimary'
    | 'code';
  themeColor?: ThemeColor;
};

/** DESIGN.md: display and headline roles use Manrope; everything else uses Public Sans. */
const MANROPE_TYPES = new Set<ThemedTextProps['type']>(['title', 'subtitle', 'headlineSm']);
const NUMERIC_TYPES = new Set<ThemedTextProps['type']>(['numericLg', 'numericHero', 'smallBold']);

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const flat = StyleSheet.flatten([styles[type], style]) as TextStyle;

  // A caller's explicit fontFamily wins (e.g. code). Otherwise the static file is chosen from the
  // effective weight, and fontWeight is reset so platforms do not synthesize a second bold.
  const typeface: TextStyle | undefined =
    type === 'code' || flat.fontFamily
      ? undefined
      : {
          fontFamily: fontFamilyFor(MANROPE_TYPES.has(type) ? 'manrope' : 'publicSans', Number(flat.fontWeight ?? 400)),
          fontWeight: 'normal',
        };

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'headlineSm' && styles.headlineSm,
        type === 'titleMd' && styles.titleMd,
        type === 'bodySm' && styles.bodySm,
        type === 'labelMd' && styles.labelMd,
        type === 'labelSm' && styles.labelSm,
        type === 'numericLg' && styles.numericLg,
        type === 'numericHero' && styles.numericHero,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        NUMERIC_TYPES.has(type) && styles.tabular,
        style,
        typeface,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  // DESIGN.md "body-md"
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 400,
    letterSpacing: 0,
  },
  // DESIGN.md "numeric-md"
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 600,
  },
  // DESIGN.md "body-lg"
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 400,
  },
  // DESIGN.md "display-lg-mobile"
  title: {
    fontSize: 26,
    fontWeight: 700,
    lineHeight: 34,
    letterSpacing: -0.4,
  },
  // DESIGN.md "headline-lg"
  subtitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: 600,
    letterSpacing: -0.2,
  },
  // DESIGN.md "headline-sm"
  headlineSm: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 600,
    letterSpacing: -0.09,
  },
  // DESIGN.md "title-md"
  titleMd: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: 600,
    letterSpacing: 0,
  },
  // DESIGN.md "body-sm"
  bodySm: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 400,
    letterSpacing: 0.12,
  },
  // DESIGN.md "label-md"
  labelMd: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 500,
    letterSpacing: 0.13,
  },
  // DESIGN.md "label-sm"
  labelSm: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: 600,
    letterSpacing: 0.44,
  },
  // DESIGN.md "numeric-lg"
  numericLg: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: 600,
    letterSpacing: -0.18,
  },
  // DESIGN.md "numeric-hero"
  numericHero: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: 700,
    letterSpacing: -0.56,
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
  },
  linkPrimary: {
    lineHeight: 30,
    fontSize: 14,
    color: Colors.light.accent,
  },
  // DESIGN.md: all prices and metrics use tabular figures so columns align.
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 12,
  },
});
