import { NextRequest, NextResponse } from "next/server";
import { computeDensity } from "@/lib/payone/simulator";
import type { Merchant } from "@/lib/payone/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const merchantName = searchParams.get("merchant") || "Local Merchant";
  
  // Current time for the window
  const now = new Date();
  const windowEnd = now.toISOString();
  const windowStart = new Date(now.getTime() - 15 * 60000).toISOString();

  // Create a mock Merchant object for the simulator
  const hash = merchantName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const merchant: Merchant = {
    id: `payone_sim_${hash}`,
    googlePlaceId: null,
    name: merchantName,
    category: "cafe", // default category for simulation shape
    mcc: "5812",
    lat: 48.7758,
    lon: 9.1829,
    rating: 4.5,
    userRatingCount: 100,
    priceLevel: "2",
    baselineDailyTx: 150 + (hash % 100), // Randomize baseline a bit
    avgTicketCents: 850 + (hash % 500),
  };

  // Run the official simulator logic
  const density = computeDensity(
    merchant,
    15, // 15 minute window
    now,
    undefined, // no override
    0.1 // 0.1 km distance (doesn't affect score, just needed for the return type)
  );

  // The agent-testing-console logic expects quietScore to be a positive value where higher means quieter.
  // The official simulator returns negative for quiet (e.g., -0.6 means 60% below baseline).
  // We invert it here to match the console's existing expectations.
  const mappedQuietScore = density.quietScore < 0 ? Math.abs(density.quietScore) : 0;

  const payoneData = {
    provider: "payone_transaction_feed_sim",
    merchantId: merchant.id,
    merchantName: merchant.name,
    windowStart,
    windowEnd,
    txPer15m: density.actualTx,
    baselineTxPer15m: density.expectedTx,
    quietScore: Number(mappedQuietScore.toFixed(2)),
    sourceNote: "Live simulated Payone tx density vs baseline using official DSV simulator."
  };

  return NextResponse.json(payoneData);
}
