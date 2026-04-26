import { NextRequest, NextResponse } from "next/server";
import {
  clearAllScenarioOverrides,
  clearScenarioOverride,
  getActiveOverrides,
  setScenarioOverride,
} from "@/lib/payone/simulator";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  return NextResponse.json(
    {
      activeOverrides: getActiveOverrides(),
      hint: "Merchant IDs are Google Place IDs. Discover them via /api/transactions/density?lat=&lon=&radiusKm=",
    },
    { headers: CORS_HEADERS },
  );
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { merchantId?: string; multiplier?: number }
    | { overrides?: Record<string, number> }
    | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers: CORS_HEADERS });
  }

  if ("overrides" in body && body.overrides) {
    for (const [id, mult] of Object.entries(body.overrides)) {
      if (!id || typeof id !== "string") {
        return NextResponse.json(
          { error: "Override keys must be non-empty merchant IDs" },
          { status: 400, headers: CORS_HEADERS },
        );
      }
      if (!Number.isFinite(mult) || mult < 0) {
        return NextResponse.json(
          { error: `Invalid multiplier for '${id}': must be a non-negative number` },
          { status: 400, headers: CORS_HEADERS },
        );
      }
      setScenarioOverride(id, mult);
    }
  } else if ("merchantId" in body && typeof body.merchantId === "string" && body.merchantId.length > 0) {
    if (typeof body.multiplier !== "number" || !Number.isFinite(body.multiplier) || body.multiplier < 0) {
      return NextResponse.json(
        { error: "multiplier must be a non-negative number" },
        { status: 400, headers: CORS_HEADERS },
      );
    }
    setScenarioOverride(body.merchantId, body.multiplier);
  } else {
    return NextResponse.json(
      { error: "Provide either { merchantId, multiplier } or { overrides: { id: multiplier, ... } }" },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  return NextResponse.json({ activeOverrides: getActiveOverrides() }, { headers: CORS_HEADERS });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const merchantId = searchParams.get("merchantId");
  if (merchantId) {
    const removed = clearScenarioOverride(merchantId);
    return NextResponse.json(
      { removed, activeOverrides: getActiveOverrides() },
      { headers: CORS_HEADERS },
    );
  }
  clearAllScenarioOverrides();
  return NextResponse.json({ activeOverrides: getActiveOverrides() }, { headers: CORS_HEADERS });
}
