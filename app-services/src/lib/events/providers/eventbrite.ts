import { EventItem, EventsProvider, EventsProviderError, EventsQuery, EventsResult } from "../types";
import { upstreamFetchOptions } from "@/lib/upstreamCache";

const EVENTBRITE_BASE = "https://www.eventbriteapi.com/v3";

export class EventbriteProvider implements EventsProvider {
  readonly name = "eventbrite";

  async fetchEvents(query: EventsQuery): Promise<EventsResult> {
    const apiKey = process.env.EVENTBRITE_API_KEY;
    if (!apiKey) {
      throw new EventsProviderError(500, "Missing EVENTBRITE_API_KEY environment variable");
    }

    const venueIds = (process.env.EVENTBRITE_VENUE_IDS ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (venueIds.length === 0) {
      throw new EventsProviderError(
        501,
        "Eventbrite provider not configured",
        {
          reason:
            "Eventbrite deprecated /v3/events/search/ in 2019. To enable this provider, populate EVENTBRITE_VENUE_IDS with a comma-separated list of curated venue IDs to query via /v3/venues/:venue_id/events/, then filter by distance against the request coords.",
          docs: "https://www.eventbrite.com/platform/api#/reference/event-search",
        },
      );
    }

    const headers = { Authorization: `Bearer ${apiKey}` };
    const responses = await Promise.all(
      venueIds.map(async (venueId) => {
        const url = new URL(`${EVENTBRITE_BASE}/venues/${venueId}/events/`);
        url.searchParams.set("status", "live");
        url.searchParams.set("expand", "venue,category");
        url.searchParams.set("start_date.range_start", query.startDate);
        const res = await fetch(url.toString(), { headers, ...upstreamFetchOptions(120) });
        if (!res.ok) return [] as unknown[];
        const data = await res.json();
        return Array.isArray(data?.events) ? (data.events as unknown[]) : [];
      }),
    );

    const radiusKm = query.unit === "mi" ? query.radius * 1.60934 : query.radius;

    const events: EventItem[] = responses
      .flat()
      .map((e) => normalize(e, query.lat, query.lon))
      .filter((e) => e.venue?.distanceKm == null || e.venue.distanceKm <= radiusKm)
      .sort((a, b) => (a.start ?? "").localeCompare(b.start ?? ""))
      .slice(0, query.size);

    return { provider: this.name, events };
  }
}

function normalize(e: unknown, originLat: number, originLon: number): EventItem {
  const ev = e as Record<string, unknown>;
  const venue = ev.venue as Record<string, unknown> | null;
  const venueAddr = venue?.address as Record<string, unknown> | undefined;
  const name = ev.name as Record<string, unknown> | undefined;
  const start = ev.start as Record<string, unknown> | undefined;
  const end = ev.end as Record<string, unknown> | undefined;
  const logo = ev.logo as Record<string, unknown> | undefined;
  const category = ev.category as Record<string, unknown> | undefined;

  const venueLat = venue?.latitude ? Number(venue.latitude) : null;
  const venueLon = venue?.longitude ? Number(venue.longitude) : null;
  const distanceKm =
    venueLat != null && venueLon != null ? haversineKm(originLat, originLon, venueLat, venueLon) : null;

  return {
    id: String(ev.id ?? ""),
    name: (name?.text as string) ?? "",
    url: (ev.url as string) ?? "",
    start: (start?.utc as string) ?? null,
    startLocal: (start?.local as string) ?? null,
    end: (end?.utc as string) ?? null,
    status: (ev.status as string) ?? null,
    segment: (category?.name as string) ?? null,
    genre: null,
    priceRange: null,
    image: (logo?.url as string) ?? null,
    venue: venue
      ? {
          name: (venue.name as string) ?? null,
          address: (venueAddr?.localized_address_display as string) ?? null,
          city: (venueAddr?.city as string) ?? null,
          country: (venueAddr?.country as string) ?? null,
          lat: venueLat,
          lon: venueLon,
          distanceKm,
        }
      : null,
    info: null,
  };
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
