/**
 * Colors follow DESIGN.md ("AgroFinance Editorial"). Light mode values are taken
 * directly from that spec; dark mode has no spec of its own, so it keeps the same
 * semantic roles at inverted lightness.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1F2421',
    textSecondary: '#6B7280',
    background: '#F6FBF5',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#EFECE6',
    border: '#E2E0D8',
    borderSubtle: '#ECEAE4',
    primary: '#1B4332',
    primaryPressed: '#133024',
    onPrimary: '#FFFFFF',
    accent: '#2D6A4F',
    accentSoft: '#E8F1EC',
    gain: '#15803D',
    gainContainer: '#DCFCE7',
    loss: '#B91C1C',
    lossContainer: '#FEE2E2',
    pending: '#B45309',
    pendingContainer: '#FEF3C7',
  },
  dark: {
    text: '#EDF2ED',
    textSecondary: '#9AA39C',
    background: '#12140F',
    backgroundElement: '#1C2019',
    backgroundSelected: '#252B22',
    border: '#333B31',
    borderSubtle: '#2A302A',
    primary: '#A5D0B9',
    primaryPressed: '#C1ECD4',
    onPrimary: '#012D1D',
    accent: '#7FBF9E',
    accentSoft: '#1E332A',
    gain: '#4ADE80',
    gainContainer: '#0F2A1A',
    loss: '#F87171',
    lossContainer: '#3A1414',
    pending: '#FBBF24',
    pendingContainer: '#3A2A0A',
  },
} as const;

/**
 * Shared light-theme aliases used by screens that were authored with the
 * detailed surface-role vocabulary from DESIGN.md. Keeping the aliases here
 * prevents each screen from carrying its own palette while dark mode is
 * intentionally deferred.
 */
export const LightPalette = {
  background: Colors.light.background,
  surface: Colors.light.backgroundElement,
  surfaceLowest: Colors.light.backgroundElement,
  surfaceLow: Colors.light.backgroundSelected,
  surfaceContainer: Colors.light.backgroundSelected,
  surfaceHigh: Colors.light.borderSubtle,
  surfaceHighest: Colors.light.border,
  text: Colors.light.text,
  onSurface: Colors.light.text,
  onSurfaceVariant: Colors.light.textSecondary,
  textMuted: Colors.light.textSecondary,
  outline: Colors.light.border,
  borderSubtle: Colors.light.borderSubtle,
  divider: Colors.light.borderSubtle,
  primary: Colors.light.primary,
  primaryContainer: Colors.light.primary,
  onPrimary: Colors.light.onPrimary,
  onPrimaryContainer: Colors.light.accent,
  secondary: Colors.light.accent,
  secondaryContainer: Colors.light.accentSoft,
  onSecondaryContainer: Colors.light.primary,
  secondaryFixed: Colors.light.accentSoft,
  onSecondaryFixedVariant: Colors.light.primary,
  tertiaryCopy: Colors.light.pending,
  tertiaryFixed: Colors.light.pendingContainer,
  onTertiaryFixed: Colors.light.text,
  inverseSurface: Colors.light.text,
  inverseOnSurface: Colors.light.backgroundElement,
  amber: Colors.light.pending,
  error: Colors.light.loss,
  errorContainer: Colors.light.lossContainer,
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
