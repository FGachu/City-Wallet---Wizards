import { useCallback, useEffect, useState } from "react";
import { api, type Coords } from "@/lib/api";
import { mockOffers, type Offer } from "@/lib/mockOffers";
import { distillIntent } from "@/lib/privacy/intentDistiller";
import { privacyStore } from "@/lib/privacy/store";
import type { BudgetTier } from "@/lib/privacy/types";

export type OffersMode = "loading" | "live" | "server-fallback" | "offline";

export type UseGeneratedOffersOptions = {
  freeMinutes?: 15 | 30 | 60 | 120;
  budgetTier?: BudgetTier;
};

export type UseGeneratedOffersResult = {
  offers: Offer[];
  mode: OffersMode;
  source: string | null;
  error: string | null;
  regenerate: () => Promise<void>;
};

export function useGeneratedOffers(
  coords: Coords | null,
  opts: UseGeneratedOffersOptions = {},
): UseGeneratedOffersResult {
  const [offers, setOffers] = useState<Offer[]>(mockOffers);
  const [mode, setMode] = useState<OffersMode>("loading");
  const [source, setSource] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    if (!coords) {
      setMode("loading");
      return;
    }
    setMode("loading");
    setError(null);
    try {
      const [w, d, e] = await Promise.all([
        api.weather(coords).catch(() => null),
        api.density(coords, 1, 30).catch(() => null),
        api.events(coords, 5, 20).catch(() => null),
      ]);
      const intent = distillIntent({
        coords,
        weather: w,
        density: d,
        events: e?.events ?? null,
        now: new Date(),
        freeMinutes: opts.freeMinutes,
        budgetTier: opts.budgetTier,
      });
      privacyStore.setLastIntent(intent);
      const merchantIds = (d?.merchants ?? []).slice(0, 5).map((m) => m.id);
      const res = await api.generateOffer(intent, merchantIds);
      if (res.offers.length === 0) throw new Error("Empty offers from server");
      setOffers(res.offers);
      setSource(res.source);
      setMode(res.source === "gemini" ? "live" : "server-fallback");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("[offers] request failed, using local mockOffers:", msg);
      setOffers(mockOffers);
      setError(msg);
      setSource(null);
      setMode("offline");
    }
  }, [coords?.lat, coords?.lon, opts.freeMinutes, opts.budgetTier]);

  useEffect(() => {
    run();
  }, [run]);

  return { offers, mode, source, error, regenerate: run };
}
