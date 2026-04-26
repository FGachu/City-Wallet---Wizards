import type {
  DensityLevel,
  IntentCategory,
  IntentPayload,
  TempBucket,
  TimeBucket,
  WeatherCondition,
} from "./types";

type Coords = { lat: number; lon: number };

type DistillerInput = {
  coords: Coords | null;
  weather: { temperature?: { current?: number }; conditions?: { main?: string } } | null;
  density: { summary?: { merchantCount?: number; quietCount?: number } } | null;
  events: unknown[] | null;
  now: Date;
  freeMinutes?: 15 | 30 | 60 | 120;
  budgetTier?: "thrifty" | "standard" | "treat";
};

const STUTTGART_DISTRICTS: Array<{
  id: string;
  latMin: number;
  latMax: number;
  lonMin: number;
  lonMax: number;
}> = [
  { id: "stuttgart-mitte", latMin: 48.770, latMax: 48.785, lonMin: 9.165, lonMax: 9.190 },
  { id: "stuttgart-west", latMin: 48.770, latMax: 48.790, lonMin: 9.140, lonMax: 9.165 },
  { id: "stuttgart-sued", latMin: 48.755, latMax: 48.770, lonMin: 9.155, lonMax: 9.190 },
  { id: "stuttgart-ost", latMin: 48.770, latMax: 48.790, lonMin: 9.190, lonMax: 9.220 },
  { id: "stuttgart-nord", latMin: 48.785, latMax: 48.810, lonMin: 9.150, lonMax: 9.200 },
];

export function inferDistrict(coords: Coords | null): string {
  if (!coords) return "unknown";
  const hit = STUTTGART_DISTRICTS.find(
    (d) =>
      coords.lat >= d.latMin &&
      coords.lat <= d.latMax &&
      coords.lon >= d.lonMin &&
      coords.lon <= d.lonMax,
  );
  return hit?.id ?? "stuttgart-other";
}

export function bucketTime(now: Date): TimeBucket {
  const h = now.getHours();
  if (h < 6) return "late-night";
  if (h < 9) return "early-morning";
  if (h < 11) return "morning";
  if (h < 14) return "lunch";
  if (h < 17) return "afternoon";
  if (h < 22) return "evening";
  return "late-night";
}

export function bucketTemp(celsius: number | undefined): TempBucket {
  if (celsius === undefined || Number.isNaN(celsius)) return "mild";
  if (celsius < 0) return "freezing";
  if (celsius < 10) return "cold";
  if (celsius < 18) return "mild";
  if (celsius < 25) return "warm";
  return "hot";
}

const WEATHER_MAIN_MAP: Record<string, WeatherCondition> = {
  clear: "clear",
  clouds: "clouds",
  rain: "rain",
  drizzle: "drizzle",
  snow: "snow",
  thunderstorm: "thunder",
  mist: "clouds",
  fog: "clouds",
  haze: "clouds",
};

export function bucketCondition(main: string | undefined): WeatherCondition {
  if (!main) return "unknown";
  return WEATHER_MAIN_MAP[main.toLowerCase()] ?? "unknown";
}

export function summarizeDensity(d: DistillerInput["density"]): DensityLevel {
  const total = d?.summary?.merchantCount ?? 0;
  const quiet = d?.summary?.quietCount ?? 0;
  if (total === 0) return "normal";
  const quietRatio = quiet / total;
  if (quietRatio >= 0.5) return "quiet";
  if (quietRatio <= 0.15) return "busy";
  return "normal";
}

export function inferIntentCategory(
  t: TimeBucket,
  w: { condition: WeatherCondition; tempBucket: TempBucket },
  density: DensityLevel,
): IntentCategory {
  const cold = w.tempBucket === "freezing" || w.tempBucket === "cold";
  const wet = w.condition === "rain" || w.condition === "drizzle" || w.condition === "snow";

  if ((t === "morning" || t === "lunch") && cold && wet) return "warm-comfort";
  if (t === "lunch" && density === "quiet") return "quick-bite";
  if (t === "afternoon" && (cold || wet)) return "cozy-treat";
  if (t === "evening") return "post-work-unwind";
  if (!wet && (t === "morning" || t === "afternoon")) return "weekend-explore";
  return "casual-browse";
}

export function distillIntent(input: DistillerInput): IntentPayload {
  const district = inferDistrict(input.coords);
  const timeBucket = bucketTime(input.now);
  const tempBucket = bucketTemp(input.weather?.temperature?.current);
  const condition = bucketCondition(input.weather?.conditions?.main);
  const density = summarizeDensity(input.density);
  const intentCategory = inferIntentCategory(
    timeBucket,
    { condition, tempBucket },
    density,
  );

  return {
    schemaVersion: 1,
    district,
    timeBucket,
    intentCategory,
    weather: { condition, tempBucket },
    density,
    ...(input.freeMinutes ? { freeMinutes: input.freeMinutes } : {}),
    ...(input.budgetTier ? { budgetTier: input.budgetTier } : {}),
  };
}
