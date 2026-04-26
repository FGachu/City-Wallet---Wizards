import { useSyncExternalStore } from "react";
import type {
  AestheticBias,
  FramingPreference,
  TextDensity,
  UserStyle,
} from "./types";

// MOCK on-device SLM — pretends to fuse local-only signals (transaction history,
// movement habits, ambient time-of-day) into stable user-style axes. Nothing
// here leaves the device; only the resulting UserStyle is sent upstream.
//
// In production this would be a Phi-3 / Gemma SLM running locally. Here we
// derive a deterministic-but-pleasantly-varied profile from a per-launch seed
// plus the current hour, so each demo session looks distinct while the same
// session stays consistent across re-renders.

const AESTHETIC_POOL: AestheticBias[] = ["minimal", "warm", "playful", "bold"];

function seededProfile(seed: number, hour: number): UserStyle {
  const aestheticBias = AESTHETIC_POOL[Math.abs(seed) % AESTHETIC_POOL.length];
  // Mid-day is busier → factual / low density. Evenings → emotional / high.
  const eveningish = hour >= 17 || hour < 6;
  const framingPreference: FramingPreference = eveningish ? "emotional" : "factual";
  const textDensity: TextDensity =
    aestheticBias === "minimal"
      ? "low"
      : aestheticBias === "bold"
        ? "high"
        : eveningish
          ? "high"
          : "medium";
  return { aestheticBias, framingPreference, textDensity };
}

type Snapshot = {
  style: UserStyle;
  derivedAt: number;
};

const sessionSeed = Math.floor(Math.random() * 1_000_000);

let snapshot: Snapshot = {
  style: seededProfile(sessionSeed, new Date().getHours()),
  derivedAt: Date.now(),
};

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

export const userStyleStore = {
  get(): UserStyle {
    return snapshot.style;
  },
  override(partial: Partial<UserStyle>) {
    snapshot = {
      style: { ...snapshot.style, ...partial },
      derivedAt: Date.now(),
    };
    notify();
  },
  reroll() {
    const seed = Math.floor(Math.random() * 1_000_000);
    snapshot = {
      style: seededProfile(seed, new Date().getHours()),
      derivedAt: Date.now(),
    };
    notify();
  },
  getSnapshot,
};

export function useUserStyle(): Snapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
