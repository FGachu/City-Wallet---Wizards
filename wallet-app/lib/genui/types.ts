export const VARIANTS = ["hero", "compact", "sticker", "banner"] as const;
export type Variant = (typeof VARIANTS)[number];

export const TONES = ["factual", "emotional", "playful", "urgent"] as const;
export type Tone = (typeof TONES)[number];

export const AESTHETIC_BIASES = ["minimal", "warm", "playful", "bold"] as const;
export type AestheticBias = (typeof AESTHETIC_BIASES)[number];

export const TEXT_DENSITIES = ["low", "medium", "high"] as const;
export type TextDensity = (typeof TEXT_DENSITIES)[number];

export const FRAMING_PREFS = ["factual", "emotional"] as const;
export type FramingPreference = (typeof FRAMING_PREFS)[number];

export type UserStyle = {
  aestheticBias: AestheticBias;
  textDensity: TextDensity;
  framingPreference: FramingPreference;
};

export type Palette = {
  accent: string;
  bg?: string;
  surface?: string;
};

export type Slots = {
  kicker?: string;
  headline: string;
  subhead?: string;
  ctaText: string;
  chips?: string[];
  emoji?: string;
  showPrice?: boolean;
  showCountdown?: boolean;
};

export type GenUIWidget = {
  offerId: string;
  variant: Variant;
  tone: Tone;
  palette: Palette;
  slots: Slots;
};
