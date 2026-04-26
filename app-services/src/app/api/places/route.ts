import { NextRequest, NextResponse } from "next/server";
import { upstreamFetchOptions } from "@/lib/upstreamCache";

const PLACES_URL = "https://places.googleapis.com/v1/places:searchNearby";

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.types",
  "places.primaryType",
  "places.primaryTypeDisplayName",
  "places.rating",
  "places.userRatingCount",
  "places.priceLevel",
  "places.businessStatus",
  "places.currentOpeningHours.openNow",
  "places.regularOpeningHours.weekdayDescriptions",
  "places.googleMapsUri",
  "places.websiteUri",
].join(",");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export type PlaceItem = {
  id: string;
  name: string;
  primaryType: string | null;
  primaryTypeLabel: string | null;
  types: string[];
  address: string | null;
  location: { lat: number; lon: number } | null;
  distanceKm: number | null;
  rating: number | null;
  userRatingCount: number | null;
  popularityProxy: number;
  priceLevel: string | null;
  businessStatus: string | null;
  openNow: boolean | null;
  hoursToday: string | null;
  googleMapsUri: string | null;
  websiteUri: string | null;
};

export type PlacesResponse = {
  query: { lat: number; lon: number; radius: number; types: string[] };
  count: number;
  places: PlaceItem[];
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
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const radiusParam = searchParams.get("radius") ?? "500";
  const typesParam = searchParams.get("types");
  const maxResults = Number(searchParams.get("maxResults") ?? "20");
  const languageCode = searchParams.get("language") ?? "en";
  const rankPreference = searchParams.get("rank") === "distance" ? "DISTANCE" : "POPULARITY";

  if (!lat || !lon) {
    return NextResponse.json(
      {
        error: "Missing required query parameters",
        details: "Provide both 'lat' and 'lon' as query parameters.",
        example: "/api/places?lat=48.7758&lon=9.1829&radius=500&types=cafe,restaurant",
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

  const radius = Number(radiusParam);
  if (!Number.isFinite(radius) || radius <= 0 || radius > 50000) {
    return NextResponse.json(
      { error: "Invalid radius", details: "radius must be in meters, > 0 and ≤ 50000." },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const includedTypes = typesParam
    ? typesParam.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const body: Record<string, unknown> = {
    locationRestriction: {
      circle: {
        center: { latitude: latNum, longitude: lonNum },
        radius,
      },
    },
    maxResultCount: Math.min(Math.max(1, Number.isFinite(maxResults) ? maxResults : 20), 20),
    languageCode,
    rankPreference,
  };
  if (includedTypes.length) body.includedTypes = includedTypes;

  try {
    const res = await fetch(PLACES_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify(body),
      ...upstreamFetchOptions(300),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Google Places request failed", status: res.status, body: safeJson(text) },
        { status: res.status, headers: CORS_HEADERS },
      );
    }

    const data = await res.json();
    const rawPlaces: unknown[] = Array.isArray(data?.places) ? data.places : [];

    const places: PlaceItem[] = rawPlaces.map((p) => {
      const pl = p as Record<string, unknown>;
      const displayName = pl.displayName as Record<string, unknown> | undefined;
      const primaryTypeDisplay = pl.primaryTypeDisplayName as Record<string, unknown> | undefined;
      const location = pl.location as Record<string, unknown> | undefined;
      const currentHours = pl.currentOpeningHours as Record<string, unknown> | undefined;
      const regularHours = pl.regularOpeningHours as Record<string, unknown> | undefined;
      const weekday = Array.isArray(regularHours?.weekdayDescriptions)
        ? (regularHours.weekdayDescriptions as string[])
        : [];

      const placeLat = location?.latitude != null ? Number(location.latitude) : null;
      const placeLon = location?.longitude != null ? Number(location.longitude) : null;
      const distanceKm =
        placeLat != null && placeLon != null ? haversineKm(latNum, lonNum, placeLat, placeLon) : null;

      const ratingCount = pl.userRatingCount != null ? Number(pl.userRatingCount) : null;

      return {
        id: String(pl.id ?? ""),
        name: (displayName?.text as string) ?? "",
        primaryType: (pl.primaryType as string) ?? null,
        primaryTypeLabel: (primaryTypeDisplay?.text as string) ?? null,
        types: Array.isArray(pl.types) ? (pl.types as string[]) : [],
        address: (pl.formattedAddress as string) ?? null,
        location: placeLat != null && placeLon != null ? { lat: placeLat, lon: placeLon } : null,
        distanceKm,
        rating: pl.rating != null ? Number(pl.rating) : null,
        userRatingCount: ratingCount,
        popularityProxy: ratingCount ?? 0,
        priceLevel: (pl.priceLevel as string) ?? null,
        businessStatus: (pl.businessStatus as string) ?? null,
        openNow: typeof currentHours?.openNow === "boolean" ? (currentHours.openNow as boolean) : null,
        hoursToday: dayLabelFor(weekday) ?? null,
        googleMapsUri: (pl.googleMapsUri as string) ?? null,
        websiteUri: (pl.websiteUri as string) ?? null,
      };
    });

    const payload: PlacesResponse = {
      query: { lat: latNum, lon: lonNum, radius, types: includedTypes },
      count: places.length,
      places,
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

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 100) / 100;
}

function safeJson(body: string): unknown {
  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}
