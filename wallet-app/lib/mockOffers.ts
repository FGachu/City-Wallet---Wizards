/* 

!! THIS IS ONLY A FALLBACK !!
If we don't have any generated offers, we'll use these mock offers.

*/


export type Offer = {
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

const inMinutes = (m: number) => new Date(Date.now() + m * 60_000).toISOString();

export const mockOffers: Offer[] = [
  {
    id: "off_cappuccino_mueller",
    merchantId: "mer_cafe_mueller",
    merchantName: "Café Müller",
    productName: "Cappuccino",
    emotionalHeadline: "Cold outside? Your cappuccino is waiting.",
    factualSummary: "20% off cappuccino at Café Müller, 250 m away.",
    discountPct: 20,
    originalCents: 380,
    finalCents: 304,
    expiresAt: inMinutes(12),
    distanceM: 250,
    contextSignals: ["10 °C drizzle", "Quiet right now (-58%)", "On your usual route"],
    imageEmoji: "☕️",
    accentColor: "#C97A4B",
  },
  {
    id: "off_brezel_konditorei",
    merchantId: "mer_konditorei",
    merchantName: "Striezelmarkt Konditorei",
    productName: "Brezel + coffee",
    emotionalHeadline: "Tuesday afternoon could use a brezel.",
    factualSummary: "15% off the bakery's brezel + coffee combo, 380 m away.",
    discountPct: 15,
    originalCents: 520,
    finalCents: 442,
    expiresAt: inMinutes(25),
    distanceM: 380,
    contextSignals: ["Bakery open until 18:00", "Below typical Tuesday traffic"],
    imageEmoji: "🥨",
    accentColor: "#D9A93B",
  },
];
