/**
 * The one place that builds and reads the link into the sale journal ("Ghi nhận bán").
 * Every screen that starts a sale (inventory, market detail, buyer detail, offer comparison)
 * goes through `buildJournalHref`, so they all hand the journal the same fields.
 * Pure on purpose: no React Native or alias imports, so `npm test` can load it.
 */

export type JournalLink = {
  commodity?: string;
  /** kg in stock. Lets the journal show the right stock before storage has loaded. */
  stock?: number;
  /** Price per kg to start from (market price or a buyer's offer). */
  price?: number;
  /** What the farmer paid per kg, for the profit line. */
  unitCost?: number;
  /** kg the farmer plans to sell, for example the quantity of a selling intent. */
  weight?: number;
  buyerId?: string;
  buyerName?: string;
};

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;

export function buildJournalHref(link: JournalLink) {
  const params: Record<string, string> = {};
  if (link.commodity) params.commodity = link.commodity;
  if (isNumber(link.stock)) params.stock = String(link.stock);
  if (isNumber(link.price) && link.price > 0) params.price = String(link.price);
  if (isNumber(link.unitCost)) params.unitCost = String(link.unitCost);
  if (isNumber(link.weight) && link.weight > 0) params.weight = String(link.weight);
  // A buyer needs both an id and a name to be shown; half of one would render a blank option.
  if (link.buyerId && link.buyerName?.trim()) {
    params.buyerId = link.buyerId;
    params.buyerName = link.buyerName.trim();
  }
  return { pathname: '/journal' as const, params };
}

export type JournalPrefill = {
  commodity?: string;
  stock?: number;
  price?: number;
  unitCost?: number;
  weight?: number;
  buyer?: { id: string; name: string };
};

type RawParams = Record<string, string | string[] | undefined>;

const readNumber = (value: string | string[] | undefined): number | undefined => {
  if (typeof value !== 'string' || value.trim() === '') return undefined;
  const parsed = Number(value);
  return isNumber(parsed) ? parsed : undefined;
};

export function readJournalPrefill(params: RawParams): JournalPrefill {
  const buyerId = typeof params.buyerId === 'string' ? params.buyerId : '';
  const buyerName = typeof params.buyerName === 'string' ? params.buyerName.trim() : '';
  const weight = readNumber(params.weight);
  return {
    commodity: typeof params.commodity === 'string' && params.commodity ? params.commodity : undefined,
    stock: readNumber(params.stock),
    price: readNumber(params.price),
    unitCost: readNumber(params.unitCost),
    weight: weight != null && weight > 0 ? weight : undefined,
    buyer: buyerId && buyerName ? { id: buyerId, name: buyerName } : undefined,
  };
}
