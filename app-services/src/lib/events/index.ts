import { EventbriteProvider } from "./providers/eventbrite";
import { TicketmasterProvider } from "./providers/ticketmaster";
import { EventsProvider, EventsProviderError } from "./types";

const REGISTRY: Record<string, () => EventsProvider> = {
  ticketmaster: () => new TicketmasterProvider(),
  eventbrite: () => new EventbriteProvider(),
};

export function getEventsProvider(): EventsProvider {
  const name = (process.env.EVENTS_PROVIDER ?? "ticketmaster").toLowerCase();
  const factory = REGISTRY[name];
  if (!factory) {
    throw new EventsProviderError(
      500,
      `Unknown EVENTS_PROVIDER: '${name}'`,
      { available: Object.keys(REGISTRY) },
    );
  }
  return factory();
}

export * from "./types";
