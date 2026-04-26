import { EventItem, EventsProvider, EventsProviderError, EventsQuery, EventsResult } from "../types";
import { upstreamFetchOptions } from "@/lib/upstreamCache";

const TICKETMASTER_URL = "https://app.ticketmaster.com/discovery/v2/events.json";

export class TicketmasterProvider implements EventsProvider {
  readonly name = "ticketmaster";

  async fetchEvents(query: EventsQuery): Promise<EventsResult> {
    const apiKey = process.env.TICKETMASTER_API_KEY;
    if (!apiKey) {
      throw new EventsProviderError(500, "Missing TICKETMASTER_API_KEY environment variable");
    }

    const upstream = new URL(TICKETMASTER_URL);
    upstream.searchParams.set("apikey", apiKey);
    upstream.searchParams.set("latlong", `${query.lat},${query.lon}`);
    upstream.searchParams.set("radius", String(query.radius));
    upstream.searchParams.set("unit", query.unit);
    upstream.searchParams.set("size", String(query.size));
    upstream.searchParams.set("sort", "date,asc");
    upstream.searchParams.set("startDateTime", query.startDate);
    upstream.searchParams.set("locale", query.locale);
    if (query.classification) upstream.searchParams.set("classificationName", query.classification);

    const res = await fetch(upstream.toString(), upstreamFetchOptions(120));
    if (!res.ok) {
      const body = await res.text();
      throw new EventsProviderError(res.status, "Ticketmaster request failed", safeJson(body));
    }

    const data = await res.json();
    const rawEvents: unknown[] = Array.isArray(data?._embedded?.events) ? data._embedded.events : [];

    return { provider: this.name, events: rawEvents.map(normalize) };
  }
}

function normalize(e: unknown): EventItem {
  const ev = e as Record<string, unknown>;
  const dates = ev.dates as Record<string, unknown> | undefined;
  const startInfo = dates?.start as Record<string, unknown> | undefined;
  const endInfo = dates?.end as Record<string, unknown> | undefined;
  const status = dates?.status as Record<string, unknown> | undefined;

  const classifications = Array.isArray(ev.classifications) ? (ev.classifications as Record<string, unknown>[]) : [];
  const cls = classifications[0];
  const segment = (cls?.segment as Record<string, unknown> | undefined)?.name as string | undefined;
  const genre = (cls?.genre as Record<string, unknown> | undefined)?.name as string | undefined;

  const priceRanges = Array.isArray(ev.priceRanges) ? (ev.priceRanges as Record<string, unknown>[]) : [];
  const pr = priceRanges[0];

  const images = Array.isArray(ev.images) ? (ev.images as Record<string, unknown>[]) : [];
  const bestImage = pickBestImage(images);

  const venues = (ev._embedded as Record<string, unknown> | undefined)?.venues as Record<string, unknown>[] | undefined;
  const v = venues?.[0];
  const vAddress = v?.address as Record<string, unknown> | undefined;
  const vCity = v?.city as Record<string, unknown> | undefined;
  const vCountry = v?.country as Record<string, unknown> | undefined;
  const vLocation = v?.location as Record<string, unknown> | undefined;
  const vDistance = v?.distance as number | undefined;

  const venueLat = vLocation?.latitude ? Number(vLocation.latitude) : null;
  const venueLon = vLocation?.longitude ? Number(vLocation.longitude) : null;

  return {
    id: String(ev.id ?? ""),
    name: (ev.name as string) ?? "",
    url: (ev.url as string) ?? "",
    start: (startInfo?.dateTime as string) ?? null,
    startLocal: (startInfo?.localDate as string) ?? null,
    end: (endInfo?.dateTime as string) ?? null,
    status: (status?.code as string) ?? null,
    segment: segment ?? null,
    genre: genre ?? null,
    priceRange: pr
      ? { min: Number(pr.min ?? 0), max: Number(pr.max ?? 0), currency: String(pr.currency ?? "") }
      : null,
    image: bestImage,
    venue: v
      ? {
          name: (v.name as string) ?? null,
          address: (vAddress?.line1 as string) ?? null,
          city: (vCity?.name as string) ?? null,
          country: (vCountry?.name as string) ?? null,
          lat: venueLat,
          lon: venueLon,
          distanceKm: typeof vDistance === "number" ? vDistance : null,
        }
      : null,
    info: (ev.info as string) ?? null,
  };
}

function pickBestImage(images: Record<string, unknown>[]): string | null {
  if (!images.length) return null;
  const ratio16x9 = images.filter((i) => i.ratio === "16_9");
  const pool = ratio16x9.length ? ratio16x9 : images;
  const sorted = [...pool].sort((a, b) => Number(b.width ?? 0) - Number(a.width ?? 0));
  return (sorted[0]?.url as string) ?? null;
}

function safeJson(body: string): unknown {
  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}
