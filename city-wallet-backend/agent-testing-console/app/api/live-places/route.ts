import { NextResponse } from "next/server";

const PLACES_URL = "https://places.googleapis.com/v1/places:searchNearby";

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.types",
  "places.primaryType",
  "places.rating",
  "places.userRatingCount"
].join(",");

export type PlaceItem = {
  id: string;
  name: string;
  types: string[];
  rating: number | null;
};

export async function GET(request: Request) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing GOOGLE_MAPS_API_KEY" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const radius = 1000; // 1km radius
  
  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing lat/lon" }, { status: 400 });
  }

  const body = {
    locationRestriction: {
      circle: {
        center: { latitude: Number(lat), longitude: Number(lon) },
        radius,
      },
    },
    maxResultCount: 5,
    includedTypes: ["restaurant", "cafe", "bakery"],
    languageCode: "en",
    rankPreference: "POPULARITY",
  };

  try {
    const res = await fetch(PLACES_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Google Places failed", status: res.status }, { status: 502 });
    }

    const data = await res.json();
    const rawPlaces: any[] = Array.isArray(data?.places) ? data.places : [];

    const places: PlaceItem[] = rawPlaces.map((pl) => ({
      id: pl.id || "",
      name: pl.displayName?.text || "",
      types: Array.isArray(pl.types) ? pl.types : [],
      rating: pl.rating != null ? Number(pl.rating) : null,
    }));

    return NextResponse.json({ places }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Network error" }, { status: 500 });
  }
}
