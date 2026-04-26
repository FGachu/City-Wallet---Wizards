import type { GenUIWidget, Tone, UserStyle, Variant } from "./schema";

type OfferLike = {
  id: string;
  emotionalHeadline: string;
  factualSummary: string;
  imageEmoji: string;
  accentColor: string;
  contextSignals: string[];
  discountPct: number;
};

type IntentLike = {
  intentCategory: string;
  weather: { condition: string; tempBucket: string };
  density: string;
};

const VARIANT_ROTATION: Variant[] = ["hero", "compact", "sticker", "banner"];

const URGENT_INTENTS = new Set(["quick-bite", "warm-comfort"]);
const EMOTIONAL_INTENTS = new Set(["cozy-treat", "post-work-unwind"]);

function pickVariant(index: number, userStyle: UserStyle): Variant {
  if (index === 0) {
    if (userStyle.aestheticBias === "minimal") return "compact";
    if (userStyle.aestheticBias === "playful") return "sticker";
    return "hero";
  }
  return VARIANT_ROTATION[index % VARIANT_ROTATION.length];
}

function pickTone(intent: IntentLike, userStyle: UserStyle): Tone {
  if (URGENT_INTENTS.has(intent.intentCategory) && userStyle.framingPreference === "factual") {
    return "urgent";
  }
  if (EMOTIONAL_INTENTS.has(intent.intentCategory)) return "emotional";
  if (userStyle.aestheticBias === "playful") return "playful";
  if (userStyle.framingPreference === "factual") return "factual";
  return "emotional";
}

function pickHeadline(offer: OfferLike, userStyle: UserStyle): string {
  return userStyle.framingPreference === "factual"
    ? offer.factualSummary
    : offer.emotionalHeadline;
}

function pickSubhead(offer: OfferLike, userStyle: UserStyle, variant: Variant): string | undefined {
  if (variant === "sticker") return undefined;
  if (userStyle.textDensity === "low" && variant !== "hero") return undefined;
  return userStyle.framingPreference === "factual"
    ? offer.emotionalHeadline
    : offer.factualSummary;
}

function pickCta(variant: Variant): string {
  if (variant === "sticker") return "Tap";
  if (variant === "banner") return "See offer";
  if (variant === "compact") return "Use it";
  return "Use this offer";
}

function pickKicker(intent: IntentLike, variant: Variant): string | undefined {
  if (variant !== "banner" && variant !== "hero") return undefined;
  if (intent.density === "quiet") return "Quiet right now";
  if (intent.weather.condition === "rain" || intent.weather.condition === "drizzle")
    return "While it rains";
  if (intent.weather.tempBucket === "cold" || intent.weather.tempBucket === "freezing")
    return "Cold outside";
  return undefined;
}

function clampChips(chips: string[], userStyle: UserStyle, variant: Variant): string[] | undefined {
  const max =
    variant === "sticker" ? 0 : variant === "banner" ? 1 : userStyle.textDensity === "low" ? 1 : 3;
  if (max === 0) return undefined;
  return chips.slice(0, max);
}

function paletteFor(offer: OfferLike, userStyle: UserStyle) {
  const accent = offer.accentColor;
  if (userStyle.aestheticBias === "minimal") return { accent, bg: "#0B0B0F", surface: "#16161B" };
  if (userStyle.aestheticBias === "bold") return { accent, bg: "#101010", surface: "#1E1E26" };
  if (userStyle.aestheticBias === "playful") return { accent, bg: "#0F0B14", surface: "#1A1620" };
  return { accent, bg: "#0E0B09", surface: "#1A1612" };
}

export function fallbackWidget(
  offer: OfferLike,
  intent: IntentLike,
  userStyle: UserStyle,
  index: number,
): GenUIWidget {
  const variant = pickVariant(index, userStyle);
  const tone = pickTone(intent, userStyle);
  return {
    offerId: offer.id,
    variant,
    tone,
    palette: paletteFor(offer, userStyle),
    slots: {
      kicker: pickKicker(intent, variant),
      headline: pickHeadline(offer, userStyle),
      subhead: pickSubhead(offer, userStyle, variant),
      ctaText: pickCta(variant),
      chips: clampChips(offer.contextSignals, userStyle, variant),
      emoji: offer.imageEmoji,
      showPrice: variant !== "sticker",
      showCountdown: variant !== "banner",
    },
  };
}
