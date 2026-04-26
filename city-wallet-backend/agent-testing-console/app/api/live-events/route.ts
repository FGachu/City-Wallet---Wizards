import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing TICKETMASTER_API_KEY" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  
  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing lat/lon" }, { status: 400 });
  }

  // Fetch events within 10km, sorted by date (upcoming first)
  const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&latlong=${lat},${lon}&radius=10&unit=km&sort=date,asc&size=5`;

  try {
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      return NextResponse.json({ error: "Ticketmaster failed", status: res.status }, { status: 502 });
    }

    const data = await res.json();
    const rawEvents = data?._embedded?.events || [];

    const events = rawEvents.map((ev: any) => ({
      id: ev.id,
      name: ev.name,
      category: ev.classifications?.[0]?.segment?.name || "Event",
      venueName: ev._embedded?.venues?.[0]?.name || "Local Venue",
      distanceM: ev.distance ? Math.round(parseFloat(ev.distance) * 1000) : 1000,
      startLocal: ev.dates?.start?.dateTime || ev.dates?.start?.localDate || new Date().toISOString(),
    }));

    return NextResponse.json({ events }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Network error" }, { status: 500 });
  }
}
