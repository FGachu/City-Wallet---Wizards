import type { PlaceItem } from "@/app/api/places/route";
import type { NearbyMerchant, RegisteredMerchant } from "@/lib/merchants/catalog";
import { synthesizeMerchant } from "@/lib/merchants/synthesize";
import { upstreamFetchOptions } from "@/lib/upstreamCache";

const PLACES_URL = "https://places.googleapis.com/v1/places:searchNearby";
const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.types",
  "places.primaryType",
  "places.primaryTypeDisplayName",
  "places.rating",
  "places.userRatingCount",
  "places.priceLevel",
  "places.businessStatus",
].join(",");

const DEFAULT_TYPES = ["cafe", "restaurant", "bakery", "bar"];
const GRID_TTL_MS = 5 * 60_000;
const GRID_RESOLUTION = 0.005;
const MAX_RESULTS = 8;
const MIN_REVIEWS = 10;

const merchantCache = new Map<string, RegisteredMerchant>();
const nearbyCache = new Map<string, { ts: number; placeIds: string[] }>();

function gridKey(lat: number, lon: number, radiusKm: number, types: string[]): string {
  const lt = Math.round(lat / GRID_RESOLUTION) * GRID_RESOLUTION;
  const ln = Math.round(lon / GRID_RESOLUTION) * GRID_RESOLUTION;
  return `${lt.toFixed(3)}|${ln.toFixed(3)}|${radiusKm}|${types.slice().sort().join(",")}`;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1000) / 1000;
}

function parsePlaces(data: unknown): PlaceItem[] {
  const raw: unknown[] = Array.isArray((data as { places?: unknown[] })?.places)
    ? ((data as { places: unknown[] }).places)
    : [];
  return raw.map((p) => {
    const pl = p as Record<string, unknown>;
    const displayName = pl.displayName as { text?: string } | undefined;
    const primaryTypeDisplay = pl.primaryTypeDisplayName as { text?: string } | undefined;
    const location = pl.location as { latitude?: number; longitude?: number } | undefined;
    const placeLat = location?.latitude != null ? Number(location.latitude) : null;
    const placeLon = location?.longitude != null ? Number(location.longitude) : null;
    return {
      id: String(pl.id ?? ""),
      name: displayName?.text ?? "",
      primaryType: (pl.primaryType as string) ?? null,
      primaryTypeLabel: primaryTypeDisplay?.text ?? null,
      types: Array.isArray(pl.types) ? (pl.types as string[]) : [],
      address: (pl.formattedAddress as string) ?? null,
      location: placeLat != null && placeLon != null ? { lat: placeLat, lon: placeLon } : null,
      distanceKm: null,
      rating: pl.rating != null ? Number(pl.rating) : null,
      userRatingCount: pl.userRatingCount != null ? Number(pl.userRatingCount) : null,
      popularityProxy: pl.userRatingCount != null ? Number(pl.userRatingCount) : 0,
      priceLevel: (pl.priceLevel as string) ?? null,
      businessStatus: (pl.businessStatus as string) ?? null,
      openNow: null,
      hoursToday: null,
      googleMapsUri: null,
      websiteUri: null,
    };
  });
}

async function fetchPlaces(
  lat: number,
  lon: number,
  radiusKm: number,
  types: string[],
  apiKey: string,
): Promise<PlaceItem[]> {
  const body = {
    locationRestriction: {
      circle: { center: { latitude: lat, longitude: lon }, radius: radiusKm * 1000 },
    },
    maxResultCount: 20,
    languageCode: "en",
    rankPreference: "POPULARITY",
    includedTypes: types,
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
    throw new Error(`Google Places ${res.status}: ${text.slice(0, 200)}`);
  }
  return parsePlaces(await res.json());
}

export async function discoverMerchantsNearby(
  lat: number,
  lon: number,
  radiusKm: number,
  types: string[] = DEFAULT_TYPES,
): Promise<NearbyMerchant[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return [];

  const key = gridKey(lat, lon, radiusKm, types);
  const cached = nearbyCache.get(key);
  const now = Date.now();
  if (cached && now - cached.ts < GRID_TTL_MS) {
    const merchants = cached.placeIds
      .map((pid) => merchantCache.get(pid))
      .filter((m): m is RegisteredMerchant => m != null)
      .map((m) => ({ merchant: m, distanceKm: haversineKm(lat, lon, m.lat, m.lon) }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
    return merchants;
  }

  let places: PlaceItem[];
  try {
    places = await fetchPlaces(lat, lon, radiusKm, types, apiKey);
  } catch (err) {
    console.warn("[discovery] Google Places fetch failed:", err instanceof Error ? err.message : err);
    return [];
  }

  const filtered = places
    .filter((p) => p.businessStatus == null || p.businessStatus === "OPERATIONAL")
    .filter((p) => (p.userRatingCount ?? 0) >= MIN_REVIEWS)
    .filter((p) => p.location != null)
    .sort((a, b) => (b.userRatingCount ?? 0) - (a.userRatingCount ?? 0))
    .slice(0, MAX_RESULTS);

  const synthesized: RegisteredMerchant[] = [];
  for (const p of filtered) {
    const existing = merchantCache.get(p.id);
    if (existing) {
      synthesized.push(existing);
      continue;
    }
    const m = synthesizeMerchant(p);
    if (!m) continue;
    merchantCache.set(p.id, m);
    synthesized.push(m);
  }

  nearbyCache.set(key, { ts: now, placeIds: synthesized.map((m) => m.googlePlaceId!).filter(Boolean) });

  return synthesized
    .map((m) => ({ merchant: m, distanceKm: haversineKm(lat, lon, m.lat, m.lon) }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export function getCachedMerchant(id: string): RegisteredMerchant | null {
  if (!id.startsWith("mer_g_")) return null;
  const placeId = id.slice("mer_g_".length);
  return merchantCache.get(placeId) ?? null;
}
