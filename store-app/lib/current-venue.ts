const CURRENT_VENUE_NAME_KEY = "city-wallet:current-venue-name";
const CURRENT_VENUE_ADDRESS_KEY = "city-wallet:current-venue-address";
export const CURRENT_VENUE_UPDATED_EVENT = "city-wallet:venue-updated";

export function setCurrentVenueSnapshot(name: string, address: string) {
  if (typeof window === "undefined") return;
  let changed = false;
  if (name.trim()) {
    window.localStorage.setItem(CURRENT_VENUE_NAME_KEY, name.trim());
    changed = true;
  }
  if (address.trim()) {
    window.localStorage.setItem(CURRENT_VENUE_ADDRESS_KEY, address.trim());
    changed = true;
  }
  if (changed) {
    window.dispatchEvent(new CustomEvent(CURRENT_VENUE_UPDATED_EVENT));
  }
}

export function getCurrentVenueName(): string | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(CURRENT_VENUE_NAME_KEY)?.trim();
  return value ? value : null;
}

export function getCurrentVenueAddress(): string | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(CURRENT_VENUE_ADDRESS_KEY)?.trim();
  return value ? value : null;
}
