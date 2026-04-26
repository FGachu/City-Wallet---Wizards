import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { fallbackWidget } from "@/lib/genui/fallback";
import {
  AESTHETIC_BIASES,
  FRAMING_PREFS,
  TEXT_DENSITIES,
  TONES,
  VARIANTS,
  isValidUserStyle,
  isValidWidget,
  type GenUIWidget,
  type UserStyle,
} from "@/lib/genui/schema";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const FORBIDDEN_KEYS = new Set([
  "lat",
  "lon",
  "latitude",
  "longitude",
  "coords",
  "coord",
  "userid",
  "user_id",
  "email",
  "phone",
  "pushtoken",
  "push_token",
  "deviceid",
  "device_id",
  "ip",
  "ipaddress",
  "name",
  "firstname",
  "lastname",
  "fullname",
  "dob",
  "birthday",
  "gender",
  "ssn",
  "address",
  "history",
  "transactions",
  "purchases",
]);

const ALLOWED_TIMES = [
  "early-morning",
  "morning",
  "lunch",
  "afternoon",
  "evening",
  "late-night",
];
const ALLOWED_TEMPS = ["freezing", "cold", "mild", "warm", "hot"];
const ALLOWED_CONDITIONS = [
  "clear",
  "clouds",
  "rain",
  "drizzle",
  "snow",
  "thunder",
  "unknown",
];
const ALLOWED_INTENTS = [
  "warm-comfort",
  "quick-bite",
  "cozy-treat",
  "casual-browse",
  "post-work-unwind",
  "weekend-explore",
];
const ALLOWED_DENSITY = ["quiet", "normal", "busy"];

type IntentPayload = {
  schemaVersion: 1;
  district: string;
  timeBucket: string;
  intentCategory: string;
  weather: { condition: string; tempBucket: string };
  density: string;
  freeMinutes?: number;
  budgetTier?: string;
};

type OfferInput = {
  id: string;
  merchantId: string;
  merchantName: string;
  productName: string;
  emotionalHeadline: string;
  factualSummary: string;
  discountPct: number;
  originalCents: number;
  finalCents: number;
  expiresAt: string;
  distanceM: number;
  contextSignals: string[];
  imageEmoji: string;
  accentColor: string;
};

const FIELD_LIMITS = {
  emotionalHeadline: 200,
  factualSummary: 200,
  productName: 80,
  merchantName: 80,
  imageEmoji: 8,
  accentColor: 16,
  contextSignal: 60,
};

function findPII(node: unknown, path: string[] = []): { key: string; path: string } | null {
  if (node === null || typeof node !== "object") return null;
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i += 1) {
      const inner = findPII(node[i], [...path, String(i)]);
      if (inner) return inner;
    }
    return null;
  }
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
    if (FORBIDDEN_KEYS.has(k.toLowerCase())) {
      return { key: k, path: [...path, k].join(".") };
    }
    const inner = findPII(v, [...path, k]);
    if (inner) return inner;
  }
  return null;
}

function isValidIntent(x: unknown): x is IntentPayload {
  if (!x || typeof x !== "object") return false;
  const i = x as Record<string, unknown>;
  if (i.schemaVersion !== 1) return false;
  if (typeof i.district !== "string" || !/^[a-z][a-z0-9-]{1,40}$/.test(i.district)) return false;
  if (!ALLOWED_TIMES.includes(i.timeBucket as string)) return false;
  if (!ALLOWED_INTENTS.includes(i.intentCategory as string)) return false;
  if (!ALLOWED_DENSITY.includes(i.density as string)) return false;
  if (!i.weather || typeof i.weather !== "object") return false;
  const w = i.weather as Record<string, unknown>;
  if (!ALLOWED_CONDITIONS.includes(w.condition as string)) return false;
  if (!ALLOWED_TEMPS.includes(w.tempBucket as string)) return false;
  return true;
}

function isValidOffer(x: unknown): x is OfferInput {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  if (typeof o.id !== "string" || o.id.length === 0 || o.id.length > 80) return false;
  if (typeof o.merchantId !== "string" || o.merchantId.length > 80) return false;
  if (typeof o.merchantName !== "string" || o.merchantName.length > FIELD_LIMITS.merchantName)
    return false;
  if (typeof o.productName !== "string" || o.productName.length > FIELD_LIMITS.productName)
    return false;
  if (
    typeof o.emotionalHeadline !== "string" ||
    o.emotionalHeadline.length > FIELD_LIMITS.emotionalHeadline
  )
    return false;
  if (typeof o.factualSummary !== "string" || o.factualSummary.length > FIELD_LIMITS.factualSummary)
    return false;
  if (typeof o.discountPct !== "number" || o.discountPct < 0 || o.discountPct > 90) return false;
  if (typeof o.originalCents !== "number" || o.originalCents < 0) return false;
  if (typeof o.finalCents !== "number" || o.finalCents < 0) return false;
  if (typeof o.expiresAt !== "string") return false;
  if (typeof o.distanceM !== "number") return false;
  if (typeof o.imageEmoji !== "string" || o.imageEmoji.length > FIELD_LIMITS.imageEmoji)
    return false;
  if (typeof o.accentColor !== "string" || o.accentColor.length > FIELD_LIMITS.accentColor)
    return false;
  if (!Array.isArray(o.contextSignals)) return false;
  if (
    !o.contextSignals.every(
      (s) => typeof s === "string" && s.length <= FIELD_LIMITS.contextSignal,
    )
  )
    return false;
  return true;
}

function buildPrompt(
  intent: IntentPayload,
  userStyle: UserStyle,
  offers: OfferInput[],
): string {
  const offerSummaries = offers.map((o) => ({
    offerId: o.id,
    merchantName: o.merchantName,
    productName: o.productName,
    emotionalHeadline: o.emotionalHeadline,
    factualSummary: o.factualSummary,
    discountPct: o.discountPct,
    contextSignals: o.contextSignals,
    imageEmoji: o.imageEmoji,
    accentColor: o.accentColor,
  }));

  return `You are a Generative UI engine for a city wallet. For each offer, design a fitting widget.
Do NOT just fill a template — pick the variant, tone, palette, and slot content that best matches BOTH the abstract user intent AND the user style preferences.

ABSTRACT USER INTENT (no PII):
${JSON.stringify(intent, null, 2)}

USER STYLE (from on-device signal):
${JSON.stringify(userStyle, null, 2)}

OFFERS TO RENDER:
${JSON.stringify(offerSummaries, null, 2)}

Design rules:
- variant: one of ${VARIANTS.join(" | ")}.
  - "hero": full attention, emotional framing, photo-like emoji, plenty of text.
  - "compact": dense list row — short, factual.
  - "sticker": tiny pill with one bold word + emoji. No price or subhead.
  - "banner": full-width announcement bar. One line. No countdown.
- tone: one of ${TONES.join(" | ")}.
- palette.accent: hex (#RRGGBB), pull from offer.accentColor or shift hue to match tone.
- palette.bg, palette.surface: optional dark hex backgrounds harmonising with accent.
- slots.headline (≤80 chars): rewrite if needed to match tone — emotional/playful tones allowed to be evocative.
- slots.subhead (≤120 chars): REQUIRED for hero (a short factual descriptive sentence about the offer). Omit for sticker. Omit for low textDensity unless variant is hero.
- slots.kicker (≤30 chars): REQUIRED for hero and banner — a short emotional hook that grabs attention BEFORE the headline (e.g. "Cold outside", "12 min to spare?", "Quiet right now"). Optional otherwise.
- slots.ctaText (≤20 chars): action verb suiting variant ("Tap", "Use it", "See offer").
- slots.chips (0–3 short tags): semantic context labels. Sticker=0, banner≤1, low-density≤1.
- slots.emoji: keep offer's emoji or a more fitting single-glyph one.
- slots.showPrice: false for sticker; true otherwise unless tone is "playful" and variant is "banner".
- slots.showCountdown: false for banner; true otherwise.

Variety rules:
- DO NOT give every offer the same variant. Distribute across the 4 variants.
- Reflect aestheticBias: minimal→compact-leaning, warm→hero-leaning, playful→sticker-leaning, bold→banner-leaning. But keep variety.
- Reflect framingPreference: factual→shorter, fact-first; emotional→evocative headline.
- Reflect textDensity: low→minimum text, no chips/subhead where optional; high→fill subhead+chips.

Respond with a JSON object: { "widgets": [<widget>...] } — one widget per offer in the same order. Each widget shape:
{
  "offerId": "<offerId>",
  "variant": "...",
  "tone": "...",
  "palette": { "accent": "#RRGGBB", "bg": "#RRGGBB", "surface": "#RRGGBB" },
  "slots": {
    "kicker": "...",
    "headline": "...",
    "subhead": "...",
    "ctaText": "...",
    "chips": ["...", "..."],
    "emoji": "...",
    "showPrice": true,
    "showCountdown": true
  }
}`;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const pii = findPII(raw);
  if (pii) {
    return NextResponse.json(
      {
        error: "PII detected — this endpoint accepts only abstract intent + style + offers",
        offendingKey: pii.key,
        path: pii.path,
      },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const body = raw as { intent?: unknown; userStyle?: unknown; offers?: unknown };

  if (!isValidIntent(body.intent)) {
    return NextResponse.json(
      { error: "Invalid intent payload" },
      { status: 400, headers: CORS_HEADERS },
    );
  }
  if (!isValidUserStyle(body.userStyle)) {
    return NextResponse.json(
      {
        error: "Invalid userStyle payload",
        allowed: {
          aestheticBias: AESTHETIC_BIASES,
          textDensity: TEXT_DENSITIES,
          framingPreference: FRAMING_PREFS,
        },
      },
      { status: 400, headers: CORS_HEADERS },
    );
  }
  if (!Array.isArray(body.offers) || body.offers.length === 0 || body.offers.length > 12) {
    return NextResponse.json(
      { error: "offers must be a non-empty array of up to 12 items" },
      { status: 400, headers: CORS_HEADERS },
    );
  }
  if (!body.offers.every(isValidOffer)) {
    return NextResponse.json(
      { error: "One or more offers failed validation" },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const intent = body.intent;
  const userStyle = body.userStyle;
  const offers = body.offers as OfferInput[];

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const widgets = offers.map((o, i) => fallbackWidget(o, intent, userStyle, i));
    return NextResponse.json(
      { widgets, source: "fallback.no-gemini-key" },
      { headers: CORS_HEADERS },
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash-lite",
      generationConfig: { responseMimeType: "application/json" },
    });
    const result = await model.generateContent(buildPrompt(intent, userStyle, offers));
    const text = result.response.text();
    const parsed = JSON.parse(text);
    const rawWidgets: unknown[] = Array.isArray(parsed?.widgets)
      ? parsed.widgets
      : Array.isArray(parsed)
        ? parsed
        : [];
    const byId = new Map<string, GenUIWidget>();
    for (const w of rawWidgets) {
      if (isValidWidget(w)) byId.set(w.offerId, w);
    }
    const widgets = offers.map((o, i) =>
      byId.get(o.id) ?? fallbackWidget(o, intent, userStyle, i),
    );
    const allFromGemini = offers.every((o) => byId.has(o.id));
    return NextResponse.json(
      {
        widgets,
        source: allFromGemini ? "gemini" : "gemini.partial-fallback",
      },
      { headers: CORS_HEADERS },
    );
  } catch (err) {
    const widgets = offers.map((o, i) => fallbackWidget(o, intent, userStyle, i));
    return NextResponse.json(
      {
        widgets,
        source: "fallback.gemini-error",
        details: err instanceof Error ? err.message : String(err),
      },
      { headers: CORS_HEADERS },
    );
  }
}
