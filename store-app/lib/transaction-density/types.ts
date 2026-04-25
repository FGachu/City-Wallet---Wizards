export type DensityMatrix = number[][];

export type MerchantDensity = {
  merchantId: string;
  matrix: DensityMatrix;
  baseline: number;
  sampleSize: number;
  generatedAt: string;
};

export type QuietWindow = {
  day: number;
  startHour: number;
  endHour: number;
  avgDensity: number;
  deviationPct: number;
};

export interface TransactionDensityProvider {
  id: string;
  label: string;
  getDensity(merchantId: string): Promise<MerchantDensity>;
}
