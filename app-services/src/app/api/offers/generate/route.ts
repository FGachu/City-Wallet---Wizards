import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getMerchantById, listMerchants, type RegisteredMerchant } from "@/lib/merchants/catalog";

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
const ALLOWED_BUDGETS = ["thrifty", "standard", "treat"];
const ALLOWED_FREE_MINUTES = [15, 30, 60, 120];

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

type Offer = {
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
  if (i.freeMinutes !== undefined && !ALLOWED_FREE_MINUTES.includes(i.freeMinutes as number))
    return false;
  if (i.budgetTier !== undefined && !ALLOWED_BUDGETS.includes(i.budgetTier as string))
    return false;
  return true;
}

const FALLBACK_PRODUCT = {
  name: "Cappuccino",
  priceCents: 380,
  emoji: "☕️",
  accent: "#C97A4B",
};

const PRODUCT_VISUAL: Record<string, { emoji: string; accent: string }> = {
  Drinks: { emoji: "☕️", accent: "#C97A4B" },
  Pastries: { emoji: "🥐", accent: "#D9A93B" },
  Mains: { emoji: "🍝", accent: "#B85C3A" },
  Desserts: { emoji: "🍰", accent: "#D26B8A" },
  Other: { emoji: "🍽️", accent: "#7C8B9A" },
};

const CATEGORY_VISUAL: Record<string, { emoji: string; accent: string }> = {
  cafe: { emoji: "☕️", accent: "#C97A4B" },
  bakery: { emoji: "🥨", accent: "#D9A93B" },
  restaurant: { emoji: "🍽️", accent: "#B85C3A" },
  bar: { emoji: "🍷", accent: "#7B3F5E" },
  retail: { emoji: "🛍️", accent: "#5C7C9A" },
};

const HEADLINE_TEMPLATES: Record<string, string[]> = {
  "warm-comfort": [
    "Cold outside? Cozy break inside.",
    "Warm up with something nearby.",
    "A warm bite for a chilly hour.",
  ],
  "quick-bite": [
    "Twelve minutes? Perfect timing.",
    "Quick bite, just around the corner.",
    "Lunch on the move — sorted.",
  ],
  "cozy-treat": [
    "A small treat to slow down for.",
    "Pause. Treat yourself, briefly.",
    "Tiny indulgence, big lift.",
  ],
  "casual-browse": [
    "Something nice while you wander.",
    "Drop by — they're quiet right now.",
    "Worth a short detour today.",
  ],
  "post-work-unwind": [
    "Day's done — let's unwind.",
    "Soft landing after work.",
    "Trade the laptop for a glass.",
  ],
  "weekend-explore": [
    "Weekend find, steps from here.",
    "Local favourite, your turn.",
    "Wander in, stay a while.",
  ],
};

function visualFor(merchant: RegisteredMerchant, product: { category?: string } | null) {
  const fromProduct = product?.category ? PRODUCT_VISUAL[product.category] : null;
  return fromProduct ?? CATEGORY_VISUAL[merchant.category] ?? FALLBACK_PRODUCT;
}

function pickProduct(merchant: RegisteredMerchant, index: number) {
  const enabled = merchant.products.filter((p) => p.enabled);
  if (enabled.length === 0) return null;
  return enabled[index % enabled.length];
}

function pickHeadline(intent: IntentPayload, index: number): string {
  const pool = HEADLINE_TEMPLATES[intent.intentCategory] ?? HEADLINE_TEMPLATES["casual-browse"];
  return pool[index % pool.length];
}

function buildFallbackOffer(
  merchant: RegisteredMerchant,
  intent: IntentPayload,
  index: number,
): Offer {
  const product = pickProduct(merchant, index);
  const priceCents = product?.priceCents ?? FALLBACK_PRODUCT.priceCents;
  const productMaxPct = product?.maxDiscountPct ?? 20;
  const discountPct = Math.min(merchant.rules.maxDiscountPct, productMaxPct, 10 + (index % 3) * 5);
  const finalCents = Math.round(priceCents * (1 - discountPct / 100));
  const visual = visualFor(merchant, product);
  const productName = product?.name ?? FALLBACK_PRODUCT.name;
  return {
    id: `off_${merchant.id}_${Date.now().toString(36)}_${index}`,
    merchantId: merchant.id,
    merchantName: merchant.name,
    productName,
    emotionalHeadline: pickHeadline(intent, index),
    factualSummary: `${discountPct}% off ${productName} at ${merchant.name}.`,
    discountPct,
    originalCents: priceCents,
    finalCents,
    expiresAt: new Date(Date.now() + (8 + (index % 4) * 4) * 60_000).toISOString(),
    distanceM: 120 + (index % 5) * 95,
    contextSignals: [intent.weather.condition, intent.density, intent.intentCategory],
    imageEmoji: visual.emoji,
    accentColor: visual.accent,
  };
}

function pickMerchants(merchantIds: string[]): RegisteredMerchant[] {
  if (merchantIds.length > 0) {
    return merchantIds
      .map((id) => getMerchantById(id))
      .filter((m): m is RegisteredMerchant => m !== null);
  }
  return listMerchants().slice(0, 3);
}

function buildPrompt(intent: IntentPayload, merchants: RegisteredMerchant[]): string {
  const merchantSummaries = merchants.map((m) => ({
    merchantId: m.id,
    merchantName: m.name,
    category: m.category,
    cuisine: m.cuisine ?? null,
    products: m.products
      .filter((p) => p.enabled)
      .map((p) => ({
        name: p.name,
        priceCents: p.priceCents,
        maxDiscountPct: p.maxDiscountPct,
      })),
    rules: { maxDiscountPct: m.rules.maxDiscountPct, goalSummary: m.rules.goalSummary },
  }));

  return `You are an offer generator for a city wallet. Generate ${merchants.length} offer(s), one per merchant.

ABSTRACT USER INTENT (no PII, no GPS, no identity):
${JSON.stringify(intent, null, 2)}

MERCHANT CANDIDATES (with rules and products):
${JSON.stringify(merchantSummaries, null, 2)}

Rules:
- IMPORTANT: pick a productName ONLY from the merchant's products[] list. Do not invent dishes that don't fit the cuisine — e.g. never suggest pizza at an Indian restaurant.
- The productName, originalCents and maxDiscountPct in your output MUST match one of the products provided for that merchant.
- discountPct must be > 0 and <= the chosen product's maxDiscountPct AND <= rules.maxDiscountPct.
- emotionalHeadline: short (max 60 chars), addresses the intent emotionally — e.g. "Cold outside? Your cappuccino is waiting."
- factualSummary: short (max 80 chars), states product + % off + merchant — e.g. "20% off cappuccino at Café Müller."
- contextSignals: array of 2-3 short strings explaining the timing — e.g. ["10 °C drizzle", "Quiet right now"].
- finalCents = round(originalCents * (1 - discountPct/100)).
- expiresAt: ISO string, 12 minutes from now.
- imageEmoji: one emoji matching the product.
- accentColor: hex color matching the product theme.
- distanceM: integer in [50, 600].

Respond with a JSON object with key "offers" — array of offer objects matching this exact shape:
{
  "id": "off_<merchantId>_<timestamp>",
  "merchantId": "<merchantId>",
  "merchantName": "<merchantName>",
  "productName": "<productName>",
  "emotionalHeadline": "...",
  "factualSummary": "...",
  "discountPct": <number>,
  "originalCents": <number>,
  "finalCents": <number>,
  "expiresAt": "<ISO>",
  "distanceM": <number>,
  "contextSignals": ["...", "..."],
  "imageEmoji": "☕️",
  "accentColor": "#C97A4B"
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
        error: "PII detected — this endpoint accepts only abstract intent",
        offendingKey: pii.key,
        path: pii.path,
        hint: "Strip identity and precise location before sending. See lib/privacy/intentDistiller.ts",
      },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const body = raw as { intent?: unknown; merchantIds?: unknown };
  if (!isValidIntent(body.intent)) {
    return NextResponse.json(
      { error: "Invalid intent payload — see IntentPayload shape" },
      { status: 400, headers: CORS_HEADERS },
    );
  }
  const intent = body.intent;

  const merchantIds = Array.isArray(body.merchantIds)
    ? body.merchantIds.filter((x): x is string => typeof x === "string").slice(0, 5)
    : [];

  const merchants = pickMerchants(merchantIds);
  if (merchants.length === 0) {
    return NextResponse.json(
      { error: "No merchants available for the given context" },
      { status: 404, headers: CORS_HEADERS },
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const offers = merchants.map((m, i) => buildFallbackOffer(m, intent, i));
    return NextResponse.json(
      { offers, source: "fallback.no-gemini-key" },
      { headers: CORS_HEADERS },
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL ?? "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });
    const result = await model.generateContent(buildPrompt(intent, merchants));
    const text = result.response.text();
    const parsed = JSON.parse(text);
    const offers: Offer[] = Array.isArray(parsed?.offers)
      ? parsed.offers
      : Array.isArray(parsed)
        ? parsed
        : [];
    if (offers.length === 0) throw new Error("Gemini returned no offers");
    return NextResponse.json({ offers, source: "gemini" }, { headers: CORS_HEADERS });
  } catch (err) {
    const fallback = merchants.map((m, i) => buildFallbackOffer(m, intent, i));
    return NextResponse.json(
      {
        offers: fallback,
        source: "fallback.gemini-error",
        details: err instanceof Error ? err.message : String(err),
      },
      { headers: CORS_HEADERS },
    );
  }
}
