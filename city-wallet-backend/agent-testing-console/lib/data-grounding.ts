import type { LiveOpenWeatherSnapshot } from "@/lib/live-weather";

/**
 * Grounding signals the console agents consume.
 * Shape matches what real integrations would return (OpenWeatherMap-style, Eventbrite-style,
 * Maps/OSM, Payone-style merchant windows, on-device SLM abstraction, GenUI).
 */

export type WeatherProvider = "openweathermap";

export type WeatherGrounding = {
  provider: WeatherProvider;
  city: string;
  lat: number;
  lon: number;
  observedAt: string;
  tempC: number;
  feelsLikeC: number;
  precipMm1h: number;
  windMs: number;
  conditionCode: string;
  conditionLabel: string;
  /** Short human-readable provenance for logs and copy. */
  sourceNote: string;
};

export type LocalEventGrounding = {
  provider: "eventbrite_api_stub";
  eventId: string;
  title: string;
  category: string;
  venueName: string;
  startLocal: string;
  endLocal: string;
  distanceM: number;
  /** Demand proxy: expected attendance tier for spike scoring. */
  demandTier: "low" | "medium" | "high";
  sourceNote: string;
};

export type PoiGrounding = {
  provider: "osm_overpass_stub" | "google_maps_platform_stub";
  anchorPoiName: string;
  anchorCategory: string;
  distanceM: number;
  /** Normalized 0–1 footfall proxy from POI density + time-of-day model. */
  footfallProxy: number;
  /** Normalized 0–1 route / corridor density near the user. */
  routeDensityProxy: number;
  sourceNote: string;
};

export type PayoneMerchantWindow = {
  provider: "payone_transaction_feed_sim";
  merchantId: string;
  merchantName: string;
  windowStart: string;
  windowEnd: string;
  /** Transactions per 15 minutes in window (simulated Payone density). */
  txPer15m: number;
  /** Rolling baseline tx/15m for this merchant at this dow/hour. */
  baselineTxPer15m: number;
  quietScore: number;
  sourceNote: string;
};

/** Only abstract intent crosses the wire; SLM runs on-device (GDPR posture). */
export type OnDeviceIntentGrounding = {
  slmFamily: "phi-3" | "gemma" | "unknown_slm";
  abstractIntent: "food_now" | "browse_deals" | "commute" | "social" | "unknown";
  confidence: number;
  redactedRawText: true;
  sourceNote: string;
};

export type GenUiGrounding = {
  framework: "react-native-genui" | "flutter-genui";
  /** Runtime-built surface id (not a static template library key). */
  surfaceId: string;
  componentTreeHint: string;
  sourceNote: string;
};

export type DataGrounding = {
  weather: WeatherGrounding;
  localEvent: LocalEventGrounding;
  poi: PoiGrounding;
  payone: PayoneMerchantWindow;
  onDeviceIntent: OnDeviceIntentGrounding;
  genUi: GenUiGrounding;
};

export function isDataGrounding(value: unknown): value is DataGrounding {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.weather === "object" &&
    v.weather !== null &&
    typeof v.localEvent === "object" &&
    v.localEvent !== null &&
    typeof v.poi === "object" &&
    v.poi !== null &&
    typeof v.payone === "object" &&
    v.payone !== null &&
    typeof v.onDeviceIntent === "object" &&
    v.onDeviceIntent !== null &&
    typeof v.genUi === "object" &&
    v.genUi !== null
  );
}

export function mergeLiveOpenWeather(g: DataGrounding, live: LiveOpenWeatherSnapshot): DataGrounding {
  const precip = live.rain1h ?? 0;
  return {
    ...g,
    weather: {
      ...g.weather,
      provider: "openweathermap",
      city: live.city,
      lat: live.lat,
      lon: live.lon,
      observedAt: live.observedAt,
      tempC: live.tempC,
      feelsLikeC: live.feelsLikeC,
      precipMm1h: precip,
      windMs: live.windMs,
      conditionCode: live.icon || g.weather.conditionCode,
      conditionLabel: live.description,
      sourceNote: "Live OpenWeatherMap current weather API."
    }
  };
}

export function stuttgartDemoGrounding(merchantName = "Cafe Hafen"): DataGrounding {
  return {
    weather: {
      provider: "openweathermap",
      city: "Stuttgart",
      lat: 48.7758,
      lon: 9.1829,
      observedAt: "2026-04-26T11:45:00+02:00",
      tempC: 11.2,
      feelsLikeC: 8.9,
      precipMm1h: 2.1,
      windMs: 5.4,
      conditionCode: "rain_showers",
      conditionLabel: "Rain showers",
      sourceNote: "OpenWeatherMap One Call-style aggregate (stub values for console demo)."
    },
    localEvent: {
      provider: "eventbrite_api_stub",
      eventId: "evt-stuttgart-fruehlingsfest-block-a",
      title: "Frühlingsfest — family afternoon block",
      category: "community_festival",
      venueName: "Cannstatter Wasen",
      startLocal: "2026-04-26T14:00:00+02:00",
      endLocal: "2026-04-26T19:00:00+02:00",
      distanceM: 4200,
      demandTier: "high",
      sourceNote: "Eventbrite-style calendar feed (synthetic but realistic demand spike)."
    },
    poi: {
      provider: "osm_overpass_stub",
      anchorPoiName: merchantName,
      anchorCategory: "cafe",
      distanceM: 82,
      footfallProxy: 0.44,
      routeDensityProxy: 0.63,
      sourceNote: "OSM POI + synthetic footfall/route density (Maps Platform equivalent signal)."
    },
    payone: {
      provider: "payone_transaction_feed_sim",
      merchantId: "payone_mrch_de_stuttgart_001",
      merchantName,
      windowStart: "2026-04-26T11:00:00+02:00",
      windowEnd: "2026-04-26T12:00:00+02:00",
      txPer15m: 2.1,
      baselineTxPer15m: 6.4,
      quietScore: 0.78,
      sourceNote: "Simulated Payone tx density vs baseline — DSV asset for quiet-period offers."
    },
    onDeviceIntent: {
      slmFamily: "phi-3",
      abstractIntent: "food_now",
      confidence: 0.86,
      redactedRawText: true,
      sourceNote: "On-device SLM; server sees abstract intent only (GDPR-friendly boundary)."
    },
    genUi: {
      framework: "react-native-genui",
      surfaceId: "streamed.offer.wallet_strip.v3",
      componentTreeHint: "OfferStrip > DynamicBadge > CTA(primary) + QRPreview(slot)",
      sourceNote: "GenUI: widget composed at runtime, not pulled from static template library."
    }
  };
}
