export type MerchantCategory = "cafe" | "restaurant" | "bakery" | "bar" | "retail";

export type Merchant = {
  id: string;
  googlePlaceId: string | null;
  name: string;
  category: MerchantCategory;
  mcc: string;
  lat: number;
  lon: number;
  rating: number | null;
  userRatingCount: number;
  priceLevel: string | null;
  baselineDailyTx: number;
  avgTicketCents: number;
};

export type MerchantDensity = {
  merchant: Merchant;
  distanceKm: number;
  windowMinutes: number;
  expectedTx: number;
  actualTx: number;
  expectedRevenueCents: number;
  actualRevenueCents: number;
  quietScore: number;
  isQuiet: boolean;
  hasScenarioOverride: boolean;
};

export type DensityQuery = {
  lat: number;
  lon: number;
  radiusKm: number;
  windowMinutes: number;
  at: Date;
};
