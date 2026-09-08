import { useFonts } from 'expo-font';

/**
 * Screen-local font family names for Buyer Detail.
 *
 * Keeping the family names scoped to this screen prevents loading the design
 * weights from changing typography elsewhere in the app.
 */
export const BUYER_DETAIL_FONTS = {
  manropeSemiBold: 'BuyerDetailManropeSemiBold',
  manropeBold: 'BuyerDetailManropeBold',
  publicSansRegular: 'BuyerDetailPublicSansRegular',
  publicSansMedium: 'BuyerDetailPublicSansMedium',
  publicSansSemiBold: 'BuyerDetailPublicSansSemiBold',
  publicSansBold: 'BuyerDetailPublicSansBold',
} as const;

const buyerDetailFontMap = {
  [BUYER_DETAIL_FONTS.manropeSemiBold]: require('../../../assets/fonts/Manrope-SemiBold.ttf'),
  [BUYER_DETAIL_FONTS.manropeBold]: require('../../../assets/fonts/Manrope-Bold.ttf'),
  [BUYER_DETAIL_FONTS.publicSansRegular]: require('../../../assets/fonts/PublicSans-Regular.ttf'),
  [BUYER_DETAIL_FONTS.publicSansMedium]: require('../../../assets/fonts/PublicSans-Medium.ttf'),
  [BUYER_DETAIL_FONTS.publicSansSemiBold]: require('../../../assets/fonts/PublicSans-SemiBold.ttf'),
  [BUYER_DETAIL_FONTS.publicSansBold]: require('../../../assets/fonts/PublicSans-Bold.ttf'),
};

/**
 * Load Buyer Detail's local fonts.
 *
 * A failed font load is treated as ready so the screen can render with the
 * platform fallback instead of remaining stuck on a loading state.
 */
export function useBuyerDetailFonts(): boolean {
  const [loaded, error] = useFonts(buyerDetailFontMap);

  return loaded || Boolean(error);
}
