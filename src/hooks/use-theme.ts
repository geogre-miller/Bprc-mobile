/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';

export function useTheme() {
  // Dark mode is intentionally deferred. Keeping the active palette explicit
  // also prevents partially migrated screens from mixing light and dark roles.
  return Colors.light;
}
