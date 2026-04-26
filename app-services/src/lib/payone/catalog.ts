import { upstreamFetchOptions } from "@/lib/upstreamCache";
import { Merchant, MerchantCategory } from "./types";

const PLACES_URL = "https://places.googleapis.com/v1/places:searchNearby";

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.types",
  "places.primaryType",
  "places.location",
  "places.rating",
  "places.userRatingCount",
  "places.priceLevel",
  "places.businessStatus",
].join(",");

const INCLUDED_TYPES = [
  "cafe",
  "coffee_shop",
  "bakery",
  "restaurant",
  "meal_takeaway",
  "bar",
  "pub",
  "wine_bar",
  "store",
];

const TYPE_TO_CATEGORY: Record<string, MerchantCategory> = {
  cafe: "cafe",
  coffee_shop: "cafe",
  ice_cream_shop: "cafe",
  tea_house: "cafe",
  bakery: "bakery",
  patisserie: "bakery",
  donut_shop: "bakery",
  restaurant: "restaurant",
  meal_takeaway: "restaurant",
  meal_delivery: "restaurant",
  fast_food_restaurant: "restaurant",
  pizza_restaurant: "restaurant",
  italian_restaurant: "restaurant",
  german_restaurant: "restaurant",
  japanese_restaurant: "restaurant",
  chinese_restaurant: "restaurant",
  mexican_restaurant: "restaurant",
  indian_restaurant: "restaurant",
  thai_restaurant: "restaurant",
  steak_house: "restaurant",
  seafood_restaurant: "restaurant",
  vegetarian_restaurant: "restaurant",
  vegan_restaurant: "restaurant",
  bar: "bar",
  pub: "bar",
  cocktail_bar: "bar",
  wine_bar: "bar",
  bar_and_grill: "bar",
  brewery: "bar",
  night_club: "bar",
  store: "retail",
  clothing_store: "retail",
  shoe_store: "retail",
  book_store: "retail",
  electronics_store: "retail",
  shopping_mall: "retail",
};

const MCC_BY_CATEGORY: Record<MerchantCategory, string> = {
  cafe: "5814",
  bakery: "5462",
  restaurant: "5812",
  bar: "5813",
  retail: "5311",
};

const BASELINE_LOG_FACTOR: Record<MerchantCategory, number> = {
  cafe: 110,
  bakery: 130,
  restaurant: 95,
  bar: 70,
  retail: 60,
};

const BASELINE_FLOOR_TX = 40;

const PRICE_LEVEL_TICKET_CENTS: Record<string, number> = {
  PRICE_LEVEL_FREE: 0,
  PRICE_LEVEL_INEXPENSIVE: 800,
  PRICE_LEVEL_MODERATE: 1800,
  PRICE_LEVEL_EXPENSIVE: 4500,
  PRICE_LEVEL_VERY_EXPENSIVE: 9000,
};

const CATEGORY_DEFAULT_TICKET_CENTS: Record<MerchantCategory, number> = {
  cafe: 600,
  bakery: 450,
  restaurant: 2200,
  bar: 1400,
  retail: 3500,
};

export type CatalogQuery = {
  lat: number;
  lon: number;
  radiusKm: number;
  maxResults?: number;
};

export async function fetchMerchantCatalog(query: CatalogQuery): Promise<Merchant[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new CatalogError(500, "Missing GOOGLE_MAPS_API_KEY environment variable");
  }

  const radiusMeters = Math.min(50000, Math.max(1, Math.round(query.radiusKm * 1000)));
  const body = {
    locationRestriction: {
      circle: {
        center: { latitude: query.lat, longitude: query.lon },
        radius: radiusMeters,
      },
    },
    includedTypes: INCLUDED_TYPES,
    maxResultCount: Math.min(Math.max(1, query.maxResults ?? 20), 20),
    rankPreference: "POPULARITY",
    languageCode: "en",
  };

  const res = await fetch(PLACES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify(body),
    ...upstreamFetchOptions(300),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new CatalogError(res.status, "Google Places request failed", safeJson(text));
  }

  const data = await res.json();
  const rawPlaces: unknown[] = Array.isArray(data?.places) ? data.places : [];
  return rawPlaces
    .map(toMerchant)
    .filter((m): m is Merchant => m !== null);
}

export class CatalogError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "CatalogError";
  }
}

function toMerchant(raw: unknown): Merchant | null {
  const p = raw as Record<string, unknown>;
  if (typeof p?.id !== "string") return null;

  const businessStatus = p.businessStatus as string | undefined;
  if (businessStatus && businessStatus !== "OPERATIONAL") return null;

  const displayName = p.displayName as Record<string, unknown> | undefined;
  const name = (displayName?.text as string) ?? "";
  if (!name) return null;

  const location = p.location as Record<string, unknown> | undefined;
  const lat = location?.latitude != null ? Number(location.latitude) : null;
  const lon = location?.longitude != null ? Number(location.longitude) : null;
  if (lat == null || lon == null || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  const types = Array.isArray(p.types) ? (p.types as string[]) : [];
  const primaryType = (p.primaryType as string | undefined) ?? types[0];
  const category = mapCategory(primaryType, types);
  if (!category) return null;

  const userRatingCount = Number(p.userRatingCount ?? 0) || 0;
  const rating = p.rating != null ? Number(p.rating) : null;
  const priceLevel = (p.priceLevel as string | undefined) ?? null;

  return {
    id: p.id,
    googlePlaceId: p.id,
    name,
    category,
    mcc: MCC_BY_CATEGORY[category],
    lat,
    lon,
    rating,
    userRatingCount,
    priceLevel,
    baselineDailyTx: deriveBaselineDailyTx(userRatingCount, category),
    avgTicketCents: deriveAvgTicketCents(priceLevel, category),
  };
}

function mapCategory(primary: string | undefined, types: string[]): MerchantCategory | null {
  const candidates = primary ? [primary, ...types] : [...types];
  for (const t of candidates) {
    const mapped = TYPE_TO_CATEGORY[t];
    if (mapped) return mapped;
  }
  if (candidates.some((t) => t.endsWith("_restaurant"))) return "restaurant";
  if (candidates.some((t) => t.endsWith("_store"))) return "retail";
  return null;
}

function deriveBaselineDailyTx(userRatingCount: number, category: MerchantCategory): number {
  const compressed = Math.log10(1 + Math.max(0, userRatingCount));
  const scaled = compressed * BASELINE_LOG_FACTOR[category];
  return Math.max(BASELINE_FLOOR_TX, Math.round(scaled));
}

function deriveAvgTicketCents(priceLevel: string | null, category: MerchantCategory): number {
  if (priceLevel && priceLevel in PRICE_LEVEL_TICKET_CENTS) {
    const fromLevel = PRICE_LEVEL_TICKET_CENTS[priceLevel];
    if (fromLevel > 0) return fromLevel;
  }
  return CATEGORY_DEFAULT_TICKET_CENTS[category];
}

function safeJson(body: string): unknown {
  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}
