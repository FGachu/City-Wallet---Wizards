import { NextRequest, NextResponse } from "next/server";
import { findMerchantsNearby } from "@/lib/merchants/catalog";
import { getActiveOverrides, queryDensity } from "@/lib/payone/simulator";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const radiusKm = Number(searchParams.get("radiusKm") ?? "0.5");
  const windowMinutes = Number(searchParams.get("windowMinutes") ?? "15");
  const atParam = searchParams.get("at");

  if (!lat || !lon) {
    return NextResponse.json(
      {
        error: "Missing required query parameters",
        details: "Provide both 'lat' and 'lon' as query parameters.",
        example: "/api/transactions/density?lat=48.7780&lon=9.1810&radiusKm=0.5&windowMinutes=15",
      },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const latNum = Number(lat);
  const lonNum = Number(lon);
  if (
    !Number.isFinite(latNum) ||
    !Number.isFinite(lonNum) ||
    latNum < -90 ||
    latNum > 90 ||
    lonNum < -180 ||
    lonNum > 180
  ) {
    return NextResponse.json(
      { error: "Invalid coordinates", details: "lat must be in [-90, 90] and lon in [-180, 180]." },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  if (!Number.isFinite(radiusKm) || radiusKm <= 0 || radiusKm > 50) {
    return NextResponse.json(
      { error: "Invalid radiusKm", details: "radiusKm must be > 0 and ≤ 50." },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  if (!Number.isFinite(windowMinutes) || windowMinutes < 1 || windowMinutes > 24 * 60) {
    return NextResponse.json(
      { error: "Invalid windowMinutes", details: "windowMinutes must be between 1 and 1440." },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const at = atParam ? new Date(atParam) : new Date();
  if (atParam && Number.isNaN(at.getTime())) {
    return NextResponse.json(
      { error: "Invalid 'at' timestamp", details: "Use an ISO 8601 string (e.g. 2026-04-26T12:30:00Z)." },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const merchants = (await findMerchantsNearby(latNum, lonNum, radiusKm)).map((n) => n.merchant);

  const densities = queryDensity(merchants, {
    lat: latNum,
    lon: lonNum,
    radiusKm,
    windowMinutes,
    at,
  });
  const quietCount = densities.filter((m) => m.isQuiet).length;

  return NextResponse.json(
    {
      query: {
        lat: latNum,
        lon: lonNum,
        radiusKm,
        windowMinutes,
        at: at.toISOString(),
      },
      catalog: {
        source: "registered.catalog",
        merchantsFetched: merchants.length,
      },
      summary: {
        merchantCount: densities.length,
        quietCount,
        activeOverrides: getActiveOverrides(),
      },
      merchants: densities.map((d) => ({
        id: d.merchant.id,
        name: d.merchant.name,
        category: d.merchant.category,
        mcc: d.merchant.mcc,
        location: { lat: d.merchant.lat, lon: d.merchant.lon },
        rating: d.merchant.rating,
        userRatingCount: d.merchant.userRatingCount,
        priceLevel: d.merchant.priceLevel,
        baselineDailyTx: d.merchant.baselineDailyTx,
        avgTicketCents: d.merchant.avgTicketCents,
        distanceKm: d.distanceKm,
        windowMinutes: d.windowMinutes,
        expectedTx: d.expectedTx,
        actualTx: d.actualTx,
        expectedRevenueCents: d.expectedRevenueCents,
        actualRevenueCents: d.actualRevenueCents,
        quietScore: d.quietScore,
        isQuiet: d.isQuiet,
        hasScenarioOverride: d.hasScenarioOverride,
      })),
    },
    { headers: CORS_HEADERS },
  );
}
