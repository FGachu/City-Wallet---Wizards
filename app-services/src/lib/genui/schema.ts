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

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function isValidUserStyle(x: unknown): x is UserStyle {
  if (!x || typeof x !== "object") return false;
  const u = x as Record<string, unknown>;
  if (!AESTHETIC_BIASES.includes(u.aestheticBias as AestheticBias)) return false;
  if (!TEXT_DENSITIES.includes(u.textDensity as TextDensity)) return false;
  if (!FRAMING_PREFS.includes(u.framingPreference as FramingPreference)) return false;
  return true;
}

export function isValidWidget(x: unknown): x is GenUIWidget {
  if (!x || typeof x !== "object") return false;
  const w = x as Record<string, unknown>;
  if (typeof w.offerId !== "string" || w.offerId.length === 0) return false;
  if (!VARIANTS.includes(w.variant as Variant)) return false;
  if (!TONES.includes(w.tone as Tone)) return false;

  if (!w.palette || typeof w.palette !== "object") return false;
  const p = w.palette as Record<string, unknown>;
  if (typeof p.accent !== "string" || !HEX_RE.test(p.accent)) return false;
  if (p.bg !== undefined && (typeof p.bg !== "string" || !HEX_RE.test(p.bg))) return false;
  if (p.surface !== undefined && (typeof p.surface !== "string" || !HEX_RE.test(p.surface)))
    return false;

  if (!w.slots || typeof w.slots !== "object") return false;
  const s = w.slots as Record<string, unknown>;
  if (typeof s.headline !== "string" || s.headline.length === 0 || s.headline.length > 100)
    return false;
  if (typeof s.ctaText !== "string" || s.ctaText.length === 0 || s.ctaText.length > 30)
    return false;
  if (s.subhead !== undefined && (typeof s.subhead !== "string" || s.subhead.length > 140))
    return false;
  if (s.kicker !== undefined && (typeof s.kicker !== "string" || s.kicker.length > 40))
    return false;
  if (s.emoji !== undefined && typeof s.emoji !== "string") return false;
  if (s.chips !== undefined) {
    if (!Array.isArray(s.chips)) return false;
    if (s.chips.length > 4) return false;
    if (!s.chips.every((c) => typeof c === "string" && c.length <= 30)) return false;
  }
  if (s.showPrice !== undefined && typeof s.showPrice !== "boolean") return false;
  if (s.showCountdown !== undefined && typeof s.showCountdown !== "boolean") return false;
  return true;
}
