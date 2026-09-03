/**
 * Core domain vocabulary for Rẫy Giá: agricultural price intelligence and
 * local buyer/farmer supply-demand matching. Types only — no logic here.
 */

export type Commodity =
  | 'coffee'
  | 'pepper'
  | 'cassava'
  | 'rubber'
  | 'cashew'
  | 'rice'
  | 'fruit'
  | 'vegetable';

export type Unit = 'kg' | 'ton' | 'quintal';

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface Address {
  line: string;
  ward?: string;
  district?: string;
  province: string;
  location?: GeoLocation;
}

/** Distinguishes what a price actually represents; the UI must not treat these as equivalent. */
export type PriceKind = 'reference_market' | 'buyer_quoted' | 'confirmed_transaction';

export type PriceSource = 'public_reference' | 'government' | 'verified_buyer' | 'admin' | 'farmer_confirmation';

export type Confidence = 'high' | 'recently_verified' | 'should_confirm' | 'outdated';

export interface PriceObservation {
  id: string;
  commodity: Commodity;
  kind: PriceKind;
  pricePerUnit: number;
  unit: Unit;
  source: PriceSource;
  buyerId?: string;
  location?: Address;
  observedAt: string;
  confidence: Confidence;
}

export interface BuyerProfile {
  id: string;
  name: string;
  address: Address;
  commodities: Commodity[];
  contactPhone?: string;
  verified: boolean;
  reputationScore?: number;
}

/** A buyer's normal current market offer, distinct from a specific BuyingDemand. */
export interface CurrentBuyingPrice {
  buyerId: string;
  commodity: Commodity;
  pricePerUnit: number;
  unit: Unit;
  updatedAt: string;
}

/** A buyer's specific, time-bound purchasing requirement (quantity, period, quality). */
export interface BuyingDemand {
  id: string;
  buyerId: string;
  commodity: Commodity;
  priceRangeMin: number;
  priceRangeMax: number;
  unit: Unit;
  desiredQuantity: number;
  remainingQuantity: number;
  qualityRequirements?: string;
  periodStart: string;
  periodEnd?: string;
}

export interface FarmerInventoryItem {
  commodity: Commodity;
  quantity: number;
  unit: Unit;
}

export interface PriceAlert {
  id: string;
  farmerId: string;
  commodity: Commodity;
  targetPricePerUnit: number;
  unit: Unit;
  active: boolean;
}

/** Farmer's own record of a past sale, used to compare quoted vs. actual price received. */
export interface SellingJournalEntry {
  id: string;
  farmerId: string;
  commodity: Commodity;
  quantity: number;
  unit: Unit;
  buyerId?: string;
  quotedPricePerUnit?: number;
  actualPricePerUnit: number;
  soldAt: string;
}
