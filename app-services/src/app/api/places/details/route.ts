import { NextRequest, NextResponse } from "next/server";
import { upstreamFetchOptions } from "@/lib/upstreamCache";

const FIELD_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "location",
  "types",
  "primaryType",
  "primaryTypeDisplayName",
  "rating",
  "userRatingCount",
  "priceLevel",
  "businessStatus",
  "currentOpeningHours.openNow",
  "regularOpeningHours.weekdayDescriptions",
  "googleMapsUri",
  "websiteUri",
].join(",");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export type PlaceDetailsResponse = {
  query: { placeId: string; languageCode: string };
  place: {
    id: string;
    name: string;
    primaryType: string | null;
    primaryTypeLabel: string | null;
    types: string[];
    address: string | null;
    location: { lat: number; lon: number } | null;
    rating: number | null;
    userRatingCount: number | null;
    priceLevel: string | null;
    businessStatus: string | null;
    openNow: boolean | null;
    hoursToday: string | null;
    weekdayDescriptions: string[];
    googleMapsUri: string | null;
    websiteUri: string | null;
  };
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing GOOGLE_MAPS_API_KEY environment variable" },
      { status: 500, headers: CORS_HEADERS },
    );
  }

  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get("placeId")?.trim();
  const languageCode = searchParams.get("language") ?? "en";

  if (!placeId) {
    return NextResponse.json(
      {
        error: "Missing required query parameter",
        details: "Provide 'placeId' as a query parameter.",
        example: "/api/places/details?placeId=ChIJN1t_tDeuEmsRUsoyG83frY4",
      },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  if (!/^[A-Za-z0-9_-]+$/.test(placeId)) {
    return NextResponse.json(
      { error: "Invalid placeId", details: "placeId contains unexpected characters." },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const url = new URL(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`);
  url.searchParams.set("languageCode", languageCode);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      ...upstreamFetchOptions(300),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Google Places request failed", status: res.status, body: safeJson(text) },
        { status: res.status, headers: CORS_HEADERS },
      );
    }

    const p = (await res.json()) as Record<string, unknown>;
    const displayName = p.displayName as Record<string, unknown> | undefined;
    const primaryTypeDisplay = p.primaryTypeDisplayName as Record<string, unknown> | undefined;
    const location = p.location as Record<string, unknown> | undefined;
    const currentHours = p.currentOpeningHours as Record<string, unknown> | undefined;
    const regularHours = p.regularOpeningHours as Record<string, unknown> | undefined;
    const weekday = Array.isArray(regularHours?.weekdayDescriptions)
      ? (regularHours.weekdayDescriptions as string[])
      : [];

    const placeLat = location?.latitude != null ? Number(location.latitude) : null;
    const placeLon = location?.longitude != null ? Number(location.longitude) : null;

    const payload: PlaceDetailsResponse = {
      query: { placeId, languageCode },
      place: {
        id: String(p.id ?? placeId),
        name: (displayName?.text as string) ?? "",
        primaryType: (p.primaryType as string) ?? null,
        primaryTypeLabel: (primaryTypeDisplay?.text as string) ?? null,
        types: Array.isArray(p.types) ? (p.types as string[]) : [],
        address: (p.formattedAddress as string) ?? null,
        location: placeLat != null && placeLon != null ? { lat: placeLat, lon: placeLon } : null,
        rating: p.rating != null ? Number(p.rating) : null,
        userRatingCount: p.userRatingCount != null ? Number(p.userRatingCount) : null,
        priceLevel: (p.priceLevel as string) ?? null,
        businessStatus: (p.businessStatus as string) ?? null,
        openNow: typeof currentHours?.openNow === "boolean" ? (currentHours.openNow as boolean) : null,
        hoursToday: dayLabelFor(weekday),
        weekdayDescriptions: weekday,
        googleMapsUri: (p.googleMapsUri as string) ?? null,
        websiteUri: (p.websiteUri as string) ?? null,
      },
    };

    return NextResponse.json(payload, { headers: CORS_HEADERS });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to reach Google Places", details: err instanceof Error ? err.message : String(err) },
      { status: 502, headers: CORS_HEADERS },
    );
  }
}

function dayLabelFor(weekdayDescriptions: string[]): string | null {
  if (!weekdayDescriptions.length) return null;
  const dayIndex = (new Date().getDay() + 6) % 7;
  return weekdayDescriptions[dayIndex] ?? null;
}

function safeJson(body: string): unknown {
  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}
