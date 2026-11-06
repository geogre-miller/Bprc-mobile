/**
 * Core domain vocabulary for Mùa Vàng: agricultural price intelligence and
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

/**
 * A buyer's post ("tin thu mua"): one firm price for a stated quality, valid until periodEnd.
 * Without a quantity it is a standing price; with one it is a bounded demand.
 */
export interface BuyingDemand {
  id: string;
  buyerId: string;
  commodity: Commodity;
  pricePerUnit: number;
  unit: Unit;
  desiredQuantity?: number;
  remainingQuantity?: number;
  qualityRequirements?: string;
  /** Optional note on how the price changes with quality, e.g. "-1.000 ₫/kg mỗi 1% ẩm trên 13%". */
  priceNote?: string;
  /** Where the buyer purchases, in the buyer's words (e.g. "Ngọc Hồi, Đắk Tô"). */
  area?: string;
  periodStart: string;
  periodEnd?: string;
}

export interface FarmerInventoryItem {
  commodity: Commodity;
  quantity: number;
  unit: Unit;
  /** What the farmer paid or spent per unit. Optional: profit is only shown when it is known. */
  unitCost?: number;
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

/** Farmer's posted intent to sell, used to find and compare matching buyers. */
export interface SellingIntent {
  id: string;
  farmerId: string;
  commodity: Commodity;
  quantity: number;
  unit: Unit;
  desiredPricePerUnit?: number;
  qualityNote?: string;
  createdAt: string;
}

/** Farmer's structured feedback on a buyer after dealing with them, feeding reputation. */
export interface BuyerFeedback {
  id: string;
  buyerId: string;
  farmerId: string;
  priceMatched: boolean;
  weighingClear: boolean;
  paymentReliable: boolean;
  note?: string;
  createdAt: string;
}
