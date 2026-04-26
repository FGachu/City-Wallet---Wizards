export type TimeBucket =
  | "early-morning"
  | "morning"
  | "lunch"
  | "afternoon"
  | "evening"
  | "late-night";

export type TempBucket = "freezing" | "cold" | "mild" | "warm" | "hot";

export type WeatherCondition =
  | "clear"
  | "clouds"
  | "rain"
  | "drizzle"
  | "snow"
  | "thunder"
  | "unknown";

export type IntentCategory =
  | "warm-comfort"
  | "quick-bite"
  | "cozy-treat"
  | "casual-browse"
  | "post-work-unwind"
  | "weekend-explore";

export type DensityLevel = "quiet" | "normal" | "busy";

export type BudgetTier = "thrifty" | "standard" | "treat";

export type IntentPayload = {
  schemaVersion: 1;
  district: string;
  timeBucket: TimeBucket;
  intentCategory: IntentCategory;
  weather: { condition: WeatherCondition; tempBucket: TempBucket };
  density: DensityLevel;
  freeMinutes?: 15 | 30 | 60 | 120;
  budgetTier?: BudgetTier;
};

export const ALLOWED_TIME_BUCKETS: TimeBucket[] = [
  "early-morning",
  "morning",
  "lunch",
  "afternoon",
  "evening",
  "late-night",
];

export const ALLOWED_TEMP_BUCKETS: TempBucket[] = ["freezing", "cold", "mild", "warm", "hot"];

export const ALLOWED_CONDITIONS: WeatherCondition[] = [
  "clear",
  "clouds",
  "rain",
  "drizzle",
  "snow",
  "thunder",
  "unknown",
];

export const ALLOWED_INTENT_CATEGORIES: IntentCategory[] = [
  "warm-comfort",
  "quick-bite",
  "cozy-treat",
  "casual-browse",
  "post-work-unwind",
  "weekend-explore",
];

export const ALLOWED_DENSITY: DensityLevel[] = ["quiet", "normal", "busy"];

export const ALLOWED_BUDGET: BudgetTier[] = ["thrifty", "standard", "treat"];

export const ALLOWED_FREE_MINUTES = [15, 30, 60, 120] as const;
