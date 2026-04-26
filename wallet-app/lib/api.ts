import Constants from "expo-constants";
import type { IntentPayload } from "./privacy/types";
import type { Offer } from "./mockOffers";
import type { GenUIWidget, UserStyle } from "./genui/types";

const baseUrl: string =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ??
  "http://localhost:4000";

if (__DEV__) {
  console.log(`[api] baseUrl = ${baseUrl}`);
}

function logOutbound(method: string, path: string, init?: RequestInit) {
  if (!__DEV__) return;
  const isPublicLookup = method === "GET" && /[?&]lat=/.test(path);
  if (isPublicLookup) {
    console.log(`[privacy:public-lookup] ${method} ${path}`);
    return;
  }
  if (init?.body && typeof init.body === "string") {
    try {
      const parsed = JSON.parse(init.body);
      const summary = describeKeys(parsed);
      console.log(`[privacy] -> ${method} ${path} keys=${JSON.stringify(summary)}`);
    } catch {
      console.log(`[privacy] -> ${method} ${path} (non-JSON body)`);
    }
  } else {
    console.log(`[api] ${method} ${path}`);
  }
}

function describeKeys(node: unknown, prefix = ""): string[] {
  if (node === null || typeof node !== "object") return [];
  if (Array.isArray(node)) return [`${prefix || "(root)"}[]`];
  const out: string[] = [];
  for (const k of Object.keys(node as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${k}` : k;
    const v = (node as Record<string, unknown>)[k];
    if (v && typeof v === "object" && !Array.isArray(v)) {
      out.push(...describeKeys(v, path));
    } else {
      out.push(path);
    }
  }
  return out;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const method = init?.method ?? "GET";
  logOutbound(method, path, init);
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

function coarsen(c: Coords): Coords {
  return {
    lat: Math.round(c.lat * 1000) / 1000,
    lon: Math.round(c.lon * 1000) / 1000,
  };
}

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

export type GenerateOfferResponse = {
  offers: Offer[];
  source: "gemini" | "fallback.no-gemini-key" | "fallback.gemini-error";
  details?: string;
};

export type RenderOffersResponse = {
  widgets: GenUIWidget[];
  source:
    | "gemini"
    | "gemini.partial-fallback"
    | "fallback.no-gemini-key"
    | "fallback.gemini-error";
  details?: string;
};

export const api = {
  baseUrl,
  density: (c: Coords, radiusKm = 1, windowMinutes = 30) => {
    const cc = coarsen(c);
    return request<DensityResponse>(
      `/api/transactions/density?lat=${cc.lat}&lon=${cc.lon}&radiusKm=${radiusKm}&windowMinutes=${windowMinutes}`,
    );
  },
  weather: (c: Coords) => {
    const cc = coarsen(c);
    return request<WeatherResponse>(`/api/weather?lat=${cc.lat}&lon=${cc.lon}`);
  },
  merchantsNearby: (c: Coords, radiusKm = 1) => {
    const cc = coarsen(c);
    return request<MerchantsNearbyResponse>(
      `/api/merchants/nearby?lat=${cc.lat}&lon=${cc.lon}&radiusKm=${radiusKm}`,
    );
  },
  events: (c: Coords, radiusKm = 10, size = 50) => {
    const cc = coarsen(c);
    return request<EventsResponse>(
      `/api/events?lat=${cc.lat}&lon=${cc.lon}&within=${radiusKm}km&size=${size}`,
    );
  },
  generateOffer: (intent: IntentPayload, merchantIds: string[] = []) =>
    request<GenerateOfferResponse>(`/api/offers/generate`, {
      method: "POST",
      body: JSON.stringify({ intent, merchantIds }),
    }),
  renderOffers: (intent: IntentPayload, userStyle: UserStyle, offers: Offer[]) =>
    request<RenderOffersResponse>(`/api/offers/render`, {
      method: "POST",
      body: JSON.stringify({
        intent,
        userStyle,
        offers: offers.map((o) => ({
          id: o.id,
          merchantId: o.merchantId,
          merchantName: o.merchantName,
          productName: o.productName,
          emotionalHeadline: o.emotionalHeadline,
          factualSummary: o.factualSummary,
          discountPct: o.discountPct,
          originalCents: o.originalCents,
          finalCents: o.finalCents,
          expiresAt: o.expiresAt,
          distanceM: o.distanceM,
          contextSignals: o.contextSignals,
          imageEmoji: o.imageEmoji,
          accentColor: o.accentColor,
        })),
      }),
    }),
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
