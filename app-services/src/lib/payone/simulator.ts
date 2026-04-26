import { DensityQuery, Merchant, MerchantCategory, MerchantDensity } from "./types";

const HOURLY_SHAPE: Record<MerchantCategory, number[]> = {
  cafe: [0, 0, 0, 0, 0, 1, 4, 7, 9, 8, 6, 7, 9, 8, 6, 6, 7, 8, 6, 4, 2, 1, 0, 0],
  restaurant: [0, 0, 0, 0, 0, 0, 1, 2, 2, 3, 4, 6, 9, 9, 6, 3, 3, 5, 9, 11, 9, 6, 3, 1],
  bakery: [0, 0, 0, 0, 1, 4, 9, 11, 10, 8, 6, 5, 4, 3, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0],
  bar: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 3, 4, 5, 7, 9, 11, 12, 12, 10, 6],
  retail: [0, 0, 0, 0, 0, 0, 1, 2, 4, 6, 8, 9, 9, 9, 8, 8, 8, 7, 6, 4, 2, 1, 0, 0],
};

const DOW_MULTIPLIER: Record<MerchantCategory, number[]> = {
  cafe: [1.0, 1.0, 1.0, 1.05, 1.15, 1.3, 0.85],
  restaurant: [0.9, 0.95, 1.0, 1.1, 1.3, 1.5, 1.1],
  bakery: [1.0, 1.0, 1.0, 1.0, 1.05, 1.4, 1.45],
  bar: [0.7, 0.75, 0.85, 1.0, 1.45, 1.7, 1.0],
  retail: [0.9, 1.0, 1.0, 1.05, 1.2, 1.4, 0.6],
};

const QUIET_THRESHOLD = -0.4;
const NOISE_AMPLITUDE = 0.3;
const TICKET_NOISE_AMPLITUDE = 0.15;
const BUCKET_SECONDS = 5 * 60;

const runtimeOverrides = new Map<string, number>();

export function setScenarioOverride(merchantId: string, multiplier: number): void {
  runtimeOverrides.set(merchantId, multiplier);
}

export function clearScenarioOverride(merchantId: string): boolean {
  return runtimeOverrides.delete(merchantId);
}

export function clearAllScenarioOverrides(): void {
  runtimeOverrides.clear();
}

export function getActiveOverrides(): Record<string, number> {
  const all: Record<string, number> = {};
  for (const [id, mult] of envOverrides()) all[id] = mult;
  for (const [id, mult] of runtimeOverrides) all[id] = mult;
  return all;
}

export function queryDensity(merchants: Merchant[], query: DensityQuery): MerchantDensity[] {
  const overrides = getActiveOverrides();
  return merchants
    .map((m) => {
      const distance = haversineKm(query.lat, query.lon, m.lat, m.lon);
      if (distance > query.radiusKm) return null;
      return computeDensity(m, query.windowMinutes, query.at, overrides[m.id], distance);
    })
    .filter((x): x is MerchantDensity => x !== null)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export function computeDensity(
  merchant: Merchant,
  windowMinutes: number,
  at: Date,
  override: number | undefined,
  distanceKm: number,
): MerchantDensity {
  const expectedHourly = expectedHourlyTx(merchant, at);
  const expectedTx = expectedHourly * (windowMinutes / 60);
  const txNoise = bucketedNoise(merchant.id, at, "tx");
  const ticketNoise = bucketedNoise(merchant.id, at, "ticket");
  const overrideMultiplier = override ?? 1;
  const actualTx = Math.max(0, expectedTx * (1 + txNoise) * overrideMultiplier);
  const ticketCents = merchant.avgTicketCents * (1 + ticketNoise * (TICKET_NOISE_AMPLITUDE / NOISE_AMPLITUDE));
  const expectedRevenueCents = Math.round(expectedTx * merchant.avgTicketCents);
  const actualRevenueCents = Math.round(actualTx * ticketCents);
  const quietScore = expectedTx > 0 ? (actualTx - expectedTx) / expectedTx : 0;
  return {
    merchant,
    distanceKm: round2(distanceKm),
    windowMinutes,
    expectedTx: round2(expectedTx),
    actualTx: round2(actualTx),
    expectedRevenueCents,
    actualRevenueCents,
    quietScore: round2(quietScore),
    isQuiet: quietScore <= QUIET_THRESHOLD && expectedTx >= 1,
    hasScenarioOverride: override !== undefined,
  };
}

function expectedHourlyTx(merchant: Merchant, at: Date): number {
  const hour = at.getHours();
  const dow = (at.getDay() + 6) % 7;
  const shape = HOURLY_SHAPE[merchant.category];
  const dowMult = DOW_MULTIPLIER[merchant.category][dow];
  const shapeWeight = shape[hour];
  const shapeSum = shape.reduce((a, b) => a + b, 0);
  if (shapeSum === 0) return 0;
  return (merchant.baselineDailyTx * shapeWeight * dowMult) / shapeSum;
}

function bucketedNoise(merchantId: string, at: Date, salt: string): number {
  const bucket = Math.floor(at.getTime() / 1000 / BUCKET_SECONDS);
  const seed = hashStringToFloat(`${merchantId}:${bucket}:${salt}`);
  return (seed - 0.5) * 2 * NOISE_AMPLITUDE;
}

function hashStringToFloat(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1_000_000) / 1_000_000;
}

function envOverrides(): Map<string, number> {
  const raw = process.env.PAYONE_SCENARIO_MULTIPLIERS;
  const map = new Map<string, number>();
  if (!raw) return map;
  for (const pair of raw.split(",")) {
    const [id, mult] = pair.split(":").map((s) => s.trim());
    const n = Number(mult);
    if (id && Number.isFinite(n)) map.set(id, n);
  }
  return map;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
