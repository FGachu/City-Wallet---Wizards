import { createMockDensityProvider } from "./mock-provider";
import type { TransactionDensityProvider } from "./types";

let provider: TransactionDensityProvider | null = null;

export function getDensityProvider(): TransactionDensityProvider {
  if (!provider) provider = createMockDensityProvider();
  return provider;
}

export function setDensityProvider(p: TransactionDensityProvider): void {
  provider = p;
}

export type {
  DensityMatrix,
  MerchantDensity,
  QuietWindow,
  TransactionDensityProvider,
} from "./types";
