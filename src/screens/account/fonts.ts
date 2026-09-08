import { useFonts } from 'expo-font';

/**
 * Screen-local font family names for Profile & Farm Settings.
 *
 * These names intentionally stay scoped to the account screen so loading the
 * design fonts does not change the typography of the rest of the app.
 * Static TTF instances are derived from the official Google Fonts repository:
 * https://raw.githubusercontent.com/google/fonts/main/ofl/manrope/Manrope%5Bwght%5D.ttf
 * https://raw.githubusercontent.com/google/fonts/main/ofl/publicsans/PublicSans%5Bwght%5D.ttf
 */
export const PROFILE_FONTS = {
  manropeSemiBold: 'ProfileManropeSemiBold',
  manropeBold: 'ProfileManropeBold',
  publicSansRegular: 'ProfilePublicSansRegular',
  publicSansMedium: 'ProfilePublicSansMedium',
  publicSansSemiBold: 'ProfilePublicSansSemiBold',
  publicSansBold: 'ProfilePublicSansBold',
} as const;

const profileFontMap = {
  // Static instances from the official Google Fonts repository variable files.
  // See assets/fonts/OFL.txt for the SIL Open Font License notices.
  [PROFILE_FONTS.manropeSemiBold]: require('../../../assets/fonts/Manrope-SemiBold.ttf'),
  [PROFILE_FONTS.manropeBold]: require('../../../assets/fonts/Manrope-Bold.ttf'),
  [PROFILE_FONTS.publicSansRegular]: require('../../../assets/fonts/PublicSans-Regular.ttf'),
  [PROFILE_FONTS.publicSansMedium]: require('../../../assets/fonts/PublicSans-Medium.ttf'),
  [PROFILE_FONTS.publicSansSemiBold]: require('../../../assets/fonts/PublicSans-SemiBold.ttf'),
  [PROFILE_FONTS.publicSansBold]: require('../../../assets/fonts/PublicSans-Bold.ttf'),
};

/**
 * Load the account screen's local fonts.
 *
 * A failed font load is treated as ready so the screen can render with the
 * platform fallback instead of remaining stuck on a loading state.
 */
export function useProfileFonts(): boolean {
  const [loaded, error] = useFonts(profileFontMap);

  return loaded || Boolean(error);
}
