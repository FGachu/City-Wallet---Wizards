import { useSyncExternalStore } from "react";

export type DemoLocation = "live" | "stuttgart" | "dresden";

type DemoState = {
  locationMode: DemoLocation;
};

const COORDS = {
  stuttgart: { lat: 48.7758, lon: 9.1829 },
  dresden: { lat: 51.0519, lon: 13.7415 },
};

let snapshot: DemoState = { locationMode: "live" };
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

function getSnapshot(): DemoState {
  return snapshot;
}

export const demoStore = {
  setLocationMode(mode: DemoLocation) {
    snapshot = { ...snapshot, locationMode: mode };
    notify();
  },
  getCoords() {
    if (snapshot.locationMode === "live") return null;
    return COORDS[snapshot.locationMode];
  },
  getSnapshot,
};

export function useDemoState(): DemoState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
