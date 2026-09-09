import { useFonts } from 'expo-font';

/**
 * Screen-local font family names for Buyer Directory.
 *
 * These names intentionally stay scoped to the buyer directory so loading
 * the Stitch design fonts does not change typography elsewhere in the app.
 */
export const BUYER_DIRECTORY_FONTS = {
  manropeSemiBold: 'BuyerDirectoryManropeSemiBold',
  manropeBold: 'BuyerDirectoryManropeBold',
  publicSansRegular: 'BuyerDirectoryPublicSansRegular',
  publicSansMedium: 'BuyerDirectoryPublicSansMedium',
  publicSansSemiBold: 'BuyerDirectoryPublicSansSemiBold',
  publicSansBold: 'BuyerDirectoryPublicSansBold',
} as const;

const buyerDirectoryFontMap = {
  [BUYER_DIRECTORY_FONTS.manropeSemiBold]: require('../../../assets/fonts/Manrope-SemiBold.ttf'),
  [BUYER_DIRECTORY_FONTS.manropeBold]: require('../../../assets/fonts/Manrope-Bold.ttf'),
  [BUYER_DIRECTORY_FONTS.publicSansRegular]: require('../../../assets/fonts/PublicSans-Regular.ttf'),
  [BUYER_DIRECTORY_FONTS.publicSansMedium]: require('../../../assets/fonts/PublicSans-Medium.ttf'),
  [BUYER_DIRECTORY_FONTS.publicSansSemiBold]: require('../../../assets/fonts/PublicSans-SemiBold.ttf'),
  [BUYER_DIRECTORY_FONTS.publicSansBold]: require('../../../assets/fonts/PublicSans-Bold.ttf'),
};

/**
 * Load Buyer Directory's local fonts.
 *
 * A failed font load is treated as ready so the screen can render with the
 * platform fallback instead of remaining stuck on a loading state.
 */
export function useBuyerDirectoryFonts(): boolean {
  const [loaded, error] = useFonts(buyerDirectoryFontMap);

  return loaded || Boolean(error);
}
