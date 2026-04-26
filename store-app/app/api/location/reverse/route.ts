import { NextResponse } from "next/server";

type ReverseResponse = {
  address: string | null;
  nearestRestaurantName: string | null;
  latitude: number;
  longitude: number;
};

function parseCoordinate(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latitude = parseCoordinate(searchParams.get("lat"));
  const longitude = parseCoordinate(searchParams.get("lng"));

  if (latitude === null || longitude === null) {
    return NextResponse.json(
      { error: "lat and lng query params are required" },
      { status: 400 }
    );
  }

  try {
    const reverseUrl = new URL("https://nominatim.openstreetmap.org/reverse");
    reverseUrl.searchParams.set("format", "jsonv2");
    reverseUrl.searchParams.set("lat", String(latitude));
    reverseUrl.searchParams.set("lon", String(longitude));
    reverseUrl.searchParams.set("zoom", "18");
    reverseUrl.searchParams.set("addressdetails", "1");

    const response = await fetch(reverseUrl, {
      headers: {
        "User-Agent": "city-wallet-store-app/1.0",
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          address: null,
          nearestRestaurantName: null,
          latitude,
          longitude,
        } satisfies ReverseResponse,
        { status: 200 }
      );
    }

    const data = (await response.json()) as { display_name?: string };
    const nearestRestaurantName = await fetchNearestRestaurantName(
      latitude,
      longitude
    );
    return NextResponse.json({
      address: data.display_name ?? null,
      nearestRestaurantName,
      latitude,
      longitude,
    } satisfies ReverseResponse);
  } catch {
    return NextResponse.json(
      {
        address: null,
        nearestRestaurantName: null,
        latitude,
        longitude,
      } satisfies ReverseResponse,
      { status: 200 }
    );
  }
}

async function fetchNearestRestaurantName(
  latitude: number,
  longitude: number
): Promise<string | null> {
  const query = `
[out:json][timeout:10];
(
  node(around:1200,${latitude},${longitude})[amenity~"restaurant|cafe|fast_food|bar|pub"][name];
  way(around:1200,${latitude},${longitude})[amenity~"restaurant|cafe|fast_food|bar|pub"][name];
  relation(around:1200,${latitude},${longitude})[amenity~"restaurant|cafe|fast_food|bar|pub"][name];
);
out center tags;
`;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        "User-Agent": "city-wallet-store-app/1.0",
      },
      body: `data=${encodeURIComponent(query)}`,
      next: { revalidate: 0 },
    });

    if (!response.ok) return null;
    const data = (await response.json()) as {
      elements?: Array<{
        lat?: number;
        lon?: number;
        center?: { lat?: number; lon?: number };
        tags?: { name?: string; opening_hours?: string };
      }>;
    };
    const candidates = (data.elements ?? [])
      .map((element) => {
        const name = element.tags?.name?.trim();
        const lat = element.lat ?? element.center?.lat;
        const lon = element.lon ?? element.center?.lon;
        if (!name || lat === undefined || lon === undefined) return null;
        const openNow = isOpenNowFromOpeningHours(element.tags?.opening_hours);
        return {
          name,
          openNow,
          distance: haversineDistanceMeters(latitude, longitude, lat, lon),
        };
      })
      .filter(
        (
          item
        ): item is { name: string; openNow: boolean | null; distance: number } =>
          item !== null
      )
      .sort((a, b) => a.distance - b.distance);

    const openCandidate = candidates.find((candidate) => candidate.openNow === true);
    if (openCandidate) return openCandidate.name;

    // If opening hours are unknown, still allow a near venue name.
    const unknownCandidate = candidates.find(
      (candidate) => candidate.openNow === null
    );
    return unknownCandidate?.name ?? null;
  } catch {
    return null;
  }
}

function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

function isOpenNowFromOpeningHours(value?: string): boolean | null {
  if (!value || value.trim().length === 0) return null;
  const openingHours = value.trim();
  if (openingHours.includes("24/7")) return true;

  const now = new Date();
  const currentDay = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][now.getDay()];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let matchedAnyToday = false;
  const rules = openingHours.split(";").map((rule) => rule.trim());

  for (const rule of rules) {
    if (!rule) continue;
    const timeRanges = [...rule.matchAll(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/g)];
    if (timeRanges.length === 0) continue;

    const dayPrefixMatch = rule.match(
      /^((?:Mo|Tu|We|Th|Fr|Sa|Su)(?:\s*-\s*(?:Mo|Tu|We|Th|Fr|Sa|Su))?(?:\s*,\s*(?:Mo|Tu|We|Th|Fr|Sa|Su)(?:\s*-\s*(?:Mo|Tu|We|Th|Fr|Sa|Su))?)*)/
    );
    const dayExpr = dayPrefixMatch?.[1] ?? null;
    if (dayExpr && !dayExpressionIncludes(dayExpr, currentDay)) continue;

    matchedAnyToday = true;
    for (const match of timeRanges) {
      const start = Number(match[1]) * 60 + Number(match[2]);
      const end = Number(match[3]) * 60 + Number(match[4]);
      if (isMinuteInRange(currentMinutes, start, end)) {
        return true;
      }
    }
  }

  if (matchedAnyToday) return false;
  return null;
}

function dayExpressionIncludes(dayExpression: string, targetDay: string): boolean {
  const dayOrder = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const targetIndex = dayOrder.indexOf(targetDay);
  if (targetIndex < 0) return false;

  const segments = dayExpression.split(",").map((segment) => segment.trim());
  for (const segment of segments) {
    if (!segment) continue;
    const range = segment.split("-").map((part) => part.trim());
    if (range.length === 1) {
      if (range[0] === targetDay) return true;
      continue;
    }

    const start = dayOrder.indexOf(range[0]);
    const end = dayOrder.indexOf(range[1]);
    if (start < 0 || end < 0) continue;
    if (start <= end && targetIndex >= start && targetIndex <= end) return true;
    if (start > end && (targetIndex >= start || targetIndex <= end)) return true;
  }

  return false;
}

function isMinuteInRange(current: number, start: number, end: number): boolean {
  if (start === end) return true;
  if (start < end) return current >= start && current <= end;
  return current >= start || current <= end;
}
