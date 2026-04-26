export type EventItem = {
  id: string;
  name: string;
  url: string;
  start: string | null;
  startLocal: string | null;
  end: string | null;
  status: string | null;
  segment: string | null;
  genre: string | null;
  priceRange: { min: number; max: number; currency: string } | null;
  image: string | null;
  venue: {
    name: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    lat: number | null;
    lon: number | null;
    distanceKm: number | null;
  } | null;
  info: string | null;
};

export type EventsQuery = {
  lat: number;
  lon: number;
  within: string;
  radius: number;
  unit: "km" | "mi";
  startDate: string;
  size: number;
  classification: string | null;
  locale: string;
};

export type EventsResult = {
  provider: string;
  events: EventItem[];
};

export interface EventsProvider {
  readonly name: string;
  fetchEvents(query: EventsQuery): Promise<EventsResult>;
}

export class EventsProviderError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "EventsProviderError";
  }
}
