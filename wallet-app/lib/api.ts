import Constants from "expo-constants";

const baseUrl: string =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ??
  "http://localhost:4000";

if (__DEV__) {
  console.log(`[api] baseUrl = ${baseUrl}`);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(res.status, text || res.statusText);
  }
  return (await res.json()) as T;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export type Coords = { lat: number; lon: number };

export type DensityRow = {
  id: string;
  name: string;
  category: string;
  distanceKm: number;
  expectedTx: number;
  actualTx: number;
  expectedRevenueCents: number;
  actualRevenueCents: number;
  quietScore: number;
  isQuiet: boolean;
  hasScenarioOverride: boolean;
  windowMinutes: number;
};

export type DensityResponse = {
  query: { lat: number; lon: number; radiusKm: number; windowMinutes: number };
  summary: { merchantCount: number; quietCount: number; activeOverrides: Record<string, number> };
  merchants: DensityRow[];
};

export type WeatherResponse = {
  location: { name?: string; country?: string };
  temperature: { current: number; feelsLike: number; min?: number; max?: number };
  conditions: { main: string; description: string; icon?: string };
  wind?: { speed: number };
  humidity?: number;
  clouds?: number;
};

export type MerchantNearby = {
  id: string;
  name: string;
  category: string;
  address?: string;
  location: { lat: number; lon: number };
  distanceKm?: number;
  rating?: number | null;
  userRatingCount?: number;
  priceLevel?: number | null;
  productCount?: number;
  rules?: { goalSummary?: string; maxDiscountPct?: number };
};

export type MerchantsNearbyResponse = { merchants: MerchantNearby[] };

export type EventItem = {
  id: string;
  name: string;
  url: string;
  start: string | null;
  startLocal: string | null;
  end: string | null;
  status: string | null;
  segment: string | null;
  genre: string | null;
  priceRange: { min: number; max: number; currency: string } | null;
  image: string | null;
  venue: {
    name: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    lat: number | null;
    lon: number | null;
    distanceKm: number | null;
  } | null;
  info: string | null;
};

export type EventsResponse = {
  provider: string;
  query: { lat: number; lon: number; within: string; startDate: string };
  count: number;
  events: EventItem[];
};

export const api = {
  baseUrl,
  density: (c: Coords, radiusKm = 1, windowMinutes = 30) =>
    request<DensityResponse>(
      `/api/transactions/density?lat=${c.lat}&lon=${c.lon}&radiusKm=${radiusKm}&windowMinutes=${windowMinutes}`,
    ),
  weather: (c: Coords) => request<WeatherResponse>(`/api/weather?lat=${c.lat}&lon=${c.lon}`),
  merchantsNearby: (c: Coords, radiusKm = 1) =>
    request<MerchantsNearbyResponse>(
      `/api/merchants/nearby?lat=${c.lat}&lon=${c.lon}&radiusKm=${radiusKm}`,
    ),
  events: (c: Coords, radiusKm = 10, size = 50) =>
    request<EventsResponse>(
      `/api/events?lat=${c.lat}&lon=${c.lon}&within=${radiusKm}km&size=${size}`,
    ),
  setScenario: (merchantId: string, multiplier: number) =>
    request<{ activeOverrides: Record<string, number> }>(`/api/transactions/scenario`, {
      method: "POST",
      body: JSON.stringify({ merchantId, multiplier }),
    }),
  clearScenario: (merchantId?: string) =>
    request<{ removed: boolean; activeOverrides: Record<string, number> }>(
      `/api/transactions/scenario${merchantId ? `?merchantId=${encodeURIComponent(merchantId)}` : ""}`,
      { method: "DELETE" },
    ),
};
