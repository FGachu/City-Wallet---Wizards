import type {
  DensityMatrix,
  MerchantDensity,
  TransactionDensityProvider,
} from "./types";

const HOURS_PER_DAY = 24;
const DAYS_PER_WEEK = 7;

function hashMerchantId(merchantId: string): number {
  let h = 2166136261;
  for (let i = 0; i < merchantId.length; i++) {
    h ^= merchantId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hourlyShape(hour: number): number {
  const morning = Math.exp(-Math.pow(hour - 9, 2) / 4) * 0.9;
  const lunch = Math.exp(-Math.pow(hour - 12.5, 2) / 1.8) * 1.0;
  const slump = Math.exp(-Math.pow(hour - 15.5, 2) / 4) * 0.35;
  const evening = Math.exp(-Math.pow(hour - 19, 2) / 3.5) * 0.85;
  const late = Math.exp(-Math.pow(hour - 22, 2) / 4) * 0.3;
  const open = hour >= 7 && hour <= 23 ? 0.15 : 0.02;
  return open + morning + lunch + slump + evening + late;
}

function dailyShape(day: number): number {
  const weights = [0.85, 0.78, 0.82, 0.95, 1.1, 1.2, 0.7];
  return weights[day] ?? 1;
}

export function createMockDensityProvider(): TransactionDensityProvider {
  return {
    id: "payone-mock",
    label: "Payone (simulated)",
    async getDensity(merchantId: string): Promise<MerchantDensity> {
      const seed = hashMerchantId(merchantId || "anonymous");
      const rng = mulberry32(seed);

      const matrix: DensityMatrix = Array.from({ length: DAYS_PER_WEEK }, () =>
        new Array(HOURS_PER_DAY).fill(0)
      );

      let total = 0;
      let cells = 0;
      for (let d = 0; d < DAYS_PER_WEEK; d++) {
        const dayWeight = dailyShape(d) * (0.92 + rng() * 0.16);
        for (let h = 0; h < HOURS_PER_DAY; h++) {
          const noise = 0.85 + rng() * 0.3;
          const value = Math.max(0, hourlyShape(h) * dayWeight * noise);
          matrix[d][h] = value;
          total += value;
          cells += 1;
        }
      }

      return {
        merchantId,
        matrix,
        baseline: total / cells,
        sampleSize: 30 * 24 * 7,
        generatedAt: new Date().toISOString(),
      };
    },
  };
}
