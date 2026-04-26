import { useSyncExternalStore } from "react";
import type { Offer } from "@/lib/mockOffers";

type OfferState = {
  offers: Offer[];
};

let snapshot: OfferState = { offers: [] };
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

function getSnapshot(): OfferState {
  return snapshot;
}

export const offerStore = {
  setOffers(offers: Offer[]) {
    snapshot = { offers };
    notify();
  },
  findById(id: string): Offer | undefined {
    return snapshot.offers.find((o) => o.id === id);
  },
  getSnapshot,
};

export function useOfferStore(): OfferState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
