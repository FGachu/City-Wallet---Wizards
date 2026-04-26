import { NextRequest, NextResponse } from "next/server";
import { getEventsProvider, EventsProviderError, EventsQuery } from "@/lib/events";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export type EventsApiResponse = {
  provider: string;
  query: { lat: number; lon: number; within: string; startDate: string };
  count: number;
  events: import("@/lib/events").EventItem[];
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const within = searchParams.get("within") ?? "5km";
  const size = Number(searchParams.get("size") ?? "20");
  const classification = searchParams.get("classification");
  const locale = searchParams.get("locale") ?? "*";
  const startDate = searchParams.get("start") ?? new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

  if (!lat || !lon) {
    return NextResponse.json(
      {
        error: "Missing required query parameters",
        details: "Provide both 'lat' and 'lon' as query parameters.",
        example: "/api/events?lat=48.7758&lon=9.1829&within=10km",
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

  const radiusMatch = within.match(/^(\d+)(km|mi)?$/i);
  if (!radiusMatch) {
    return NextResponse.json(
      { error: "Invalid 'within' value", details: "Use formats like '5km' or '10mi'." },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const query: EventsQuery = {
    lat: latNum,
    lon: lonNum,
    within,
    radius: Number(radiusMatch[1]),
    unit: ((radiusMatch[2] ?? "km").toLowerCase()) as "km" | "mi",
    startDate,
    size: Number.isFinite(size) && size > 0 ? size : 20,
    classification,
    locale,
  };

  try {
    const provider = getEventsProvider();
    const result = await provider.fetchEvents(query);

    const payload: EventsApiResponse = {
      provider: result.provider,
      query: { lat: latNum, lon: lonNum, within, startDate },
      count: result.events.length,
      events: result.events,
    };

    return NextResponse.json(payload, { headers: CORS_HEADERS });
  } catch (err) {
    if (err instanceof EventsProviderError) {
      return NextResponse.json(
        { error: err.message, details: err.details ?? null },
        { status: err.status, headers: CORS_HEADERS },
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch events", details: err instanceof Error ? err.message : String(err) },
      { status: 502, headers: CORS_HEADERS },
    );
  }
}
