/**
 * The light palette is the canonical role/value contract from DESIGN.md.
 * Legacy names remain as aliases so existing screens adopt the contract without
 * carrying a second palette. Dark mode has no DESIGN.md specification yet, but
 * exposes the same roles so shared themed components remain type-safe.
 */

import '@/global.css';

import { Platform } from 'react-native';

const lightPalette = {
  surface: '#F6FBF5',
  surfaceDim: '#D7DBD6',
  surfaceBright: '#F6FBF5',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F0F5F0',
  surfaceContainer: '#EBEFEA',
  surfaceContainerHigh: '#E5E9E4',
  surfaceContainerHighest: '#DFE4DF',
  onSurface: '#181D1A',
  onSurfaceVariant: '#414844',
  inverseSurface: '#2C322E',
  inverseOnSurface: '#EDF2ED',
  outline: '#717973',
  outlineVariant: '#C1C8C2',
  surfaceTint: '#3F6653',
  primary: '#012D1D',
  onPrimary: '#FFFFFF',
  primaryContainer: '#1B4332',
  onPrimaryContainer: '#86AF99',
  inversePrimary: '#A5D0B9',
  secondary: '#2C694E',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#AEEECB',
  onSecondaryContainer: '#316E52',
  tertiary: '#3E1E00',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#5E3000',
  onTertiaryContainer: '#F48C24',
  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#93000A',
  primaryFixed: '#C1ECD4',
  primaryFixedDim: '#A5D0B9',
  onPrimaryFixed: '#002114',
  onPrimaryFixedVariant: '#274E3D',
  secondaryFixed: '#B1F0CE',
  secondaryFixedDim: '#95D4B3',
  onSecondaryFixed: '#002114',
  onSecondaryFixedVariant: '#0E5138',
  tertiaryFixed: '#FFDCC3',
  tertiaryFixedDim: '#FFB77D',
  onTertiaryFixed: '#2F1500',
  onTertiaryFixedVariant: '#6E3900',
  background: '#F6FBF5',
  onBackground: '#181D1A',
  surfaceVariant: '#DFE4DF',
} as const;

type CanonicalPalette = Record<keyof typeof lightPalette, string>;

const darkPalette: CanonicalPalette = {
  surface: '#12140F',
  surfaceDim: '#252B22',
  surfaceBright: '#12140F',
  surfaceContainerLowest: '#1C2019',
  surfaceContainerLow: '#252B22',
  surfaceContainer: '#252B22',
  surfaceContainerHigh: '#2A302A',
  surfaceContainerHighest: '#333B31',
  onSurface: '#EDF2ED',
  onSurfaceVariant: '#9AA39C',
  inverseSurface: '#EDF2ED',
  inverseOnSurface: '#1C2019',
  outline: '#9AA39C',
  outlineVariant: '#333B31',
  surfaceTint: '#7FBF9E',
  primary: '#A5D0B9',
  onPrimary: '#012D1D',
  primaryContainer: '#C1ECD4',
  onPrimaryContainer: '#1E332A',
  inversePrimary: '#7FBF9E',
  secondary: '#7FBF9E',
  onSecondary: '#012D1D',
  secondaryContainer: '#1E332A',
  onSecondaryContainer: '#A5D0B9',
  tertiary: '#FBBF24',
  onTertiary: '#012D1D',
  tertiaryContainer: '#3A2A0A',
  onTertiaryContainer: '#FBBF24',
  error: '#F87171',
  onError: '#012D1D',
  errorContainer: '#3A1414',
  onErrorContainer: '#F87171',
  primaryFixed: '#C1ECD4',
  primaryFixedDim: '#A5D0B9',
  onPrimaryFixed: '#002114',
  onPrimaryFixedVariant: '#274E3D',
  secondaryFixed: '#B1F0CE',
  secondaryFixedDim: '#95D4B3',
  onSecondaryFixed: '#002114',
  onSecondaryFixedVariant: '#0E5138',
  tertiaryFixed: '#3A2A0A',
  tertiaryFixedDim: '#3A2A0A',
  onTertiaryFixed: '#EDF2ED',
  onTertiaryFixedVariant: '#FBBF24',
  background: '#12140F',
  onBackground: '#EDF2ED',
  surfaceVariant: '#252B22',
};

const withLegacyAliases = (palette: CanonicalPalette) => ({
  ...palette,
  text: palette.onSurface,
  textSecondary: palette.onSurfaceVariant,
  backgroundElement: palette.surfaceContainerLowest,
  backgroundSelected: palette.surfaceContainerLow,
  border: palette.outlineVariant,
  borderSubtle: palette.surfaceContainerHighest,
  primaryPressed: palette.primaryContainer,
  accent: palette.secondary,
  accentSoft: palette.secondaryContainer,
  gain: palette.secondary,
  gainContainer: palette.secondaryContainer,
  loss: palette.error,
  lossContainer: palette.errorContainer,
  pending: palette.onTertiaryFixedVariant,
  pendingContainer: palette.tertiaryFixed,
});

export const Colors = {
  light: withLegacyAliases(lightPalette),
  dark: {
    ...withLegacyAliases(darkPalette),
    borderSubtle: '#2A302A',
    gain: '#4ADE80',
    gainContainer: '#0F2A1A',
  },
} as const;

/** Canonical light roles plus compatibility names and derived UI effects. */
export const LightPalette = {
  ...Colors.light,
  surfaceLowest: Colors.light.surfaceContainerLowest,
  surfaceLow: Colors.light.surfaceContainerLow,
  surfaceHigh: Colors.light.surfaceContainerHigh,
  surfaceHighest: Colors.light.surfaceContainerHighest,
  textMuted: Colors.light.onSurfaceVariant,
  divider: Colors.light.outlineVariant,
  tertiaryCopy: Colors.light.onTertiaryFixedVariant,
  amber: Colors.light.onTertiaryContainer,
  shadow: Colors.light.primaryContainer,
  primaryScrim: 'rgba(1, 45, 29, 0.28)',
  surfaceScrim: 'rgba(44, 50, 46, 0.42)',
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Container Radius (8), Structural Sheet Radius (12), Base Radius (4) per DESIGN.md. */
export const Radius = {
  base: 4,
  container: 8,
  sheet: 12,
  full: 9999,
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
