import { useSyncExternalStore } from "react";
import type { IntentPayload } from "./types";

type Snapshot = {
  lastIntent: IntentPayload | null;
  lastSentAt: number | null;
};

let snapshot: Snapshot = { lastIntent: null, lastSentAt: null };
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

function getSnapshot(): Snapshot {
  return snapshot;
}

export const privacyStore = {
  setLastIntent(intent: IntentPayload) {
    snapshot = { lastIntent: intent, lastSentAt: Date.now() };
    notify();
  },
  clear() {
    snapshot = { lastIntent: null, lastSentAt: null };
    notify();
  },
  getSnapshot,
};

export function useLastIntent(): Snapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
