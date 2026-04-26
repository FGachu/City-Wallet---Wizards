import { NextRequest, NextResponse } from "next/server";
import { findMerchantsNearby } from "@/lib/merchants/catalog";
import type { MerchantCategory } from "@/lib/payone/types";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const VALID_CATEGORIES: MerchantCategory[] = [
  "cafe",
  "restaurant",
  "bakery",
  "bar",
  "retail",
];

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const radiusKm = Number(searchParams.get("radiusKm") ?? "1");
  const categoryParam = searchParams.get("category");

  if (!lat || !lon) {
    return NextResponse.json(
      {
        error: "Missing required query parameters",
        details: "Provide both 'lat' and 'lon' as query parameters.",
        example: "/api/merchants/nearby?lat=48.7780&lon=9.1810&radiusKm=1",
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

  let category: MerchantCategory | undefined;
  if (categoryParam) {
    if (!VALID_CATEGORIES.includes(categoryParam as MerchantCategory)) {
      return NextResponse.json(
        {
          error: "Invalid category",
          details: `category must be one of: ${VALID_CATEGORIES.join(", ")}.`,
        },
        { status: 400, headers: CORS_HEADERS },
      );
    }
    category = categoryParam as MerchantCategory;
  }

  const results = findMerchantsNearby(latNum, lonNum, radiusKm, category);

  return NextResponse.json(
    {
      query: { lat: latNum, lon: lonNum, radiusKm, category: category ?? null },
      source: "registered.catalog",
      count: results.length,
      merchants: results.map(({ merchant, distanceKm }) => ({
        id: merchant.id,
        name: merchant.name,
        category: merchant.category,
        address: merchant.address,
        location: { lat: merchant.lat, lon: merchant.lon },
        distanceKm,
        rating: merchant.rating,
        userRatingCount: merchant.userRatingCount,
        priceLevel: merchant.priceLevel,
        quietWindows: merchant.quietWindows,
        productCount: merchant.products.filter((p) => p.enabled).length,
        rules: {
          maxDiscountPct: merchant.rules.maxDiscountPct,
          goalSummary: merchant.rules.goalSummary,
        },
      })),
    },
    { headers: CORS_HEADERS },
  );
}
