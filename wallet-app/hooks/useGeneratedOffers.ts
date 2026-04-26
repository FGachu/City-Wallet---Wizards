import { useCallback, useEffect, useState } from "react";
import { api, type Coords } from "@/lib/api";
import { mockOffers, type Offer } from "@/lib/mockOffers";
import { offerStore } from "@/lib/offerStore";
import { distillIntent } from "@/lib/privacy/intentDistiller";
import { privacyStore, useLastIntent } from "@/lib/privacy/store";
import type { BudgetTier } from "@/lib/privacy/types";
import { userStyleStore } from "@/lib/genui/mockSlm";

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
  context: {
    city: string | null;
    temp: number | null;
    condition: string | null;
  } | null;
};

export function useGeneratedOffers(
  coords: Coords | null,
  opts: UseGeneratedOffersOptions = {},
): UseGeneratedOffersResult {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [mode, setMode] = useState<OffersMode>("loading");
  const [source, setSource] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<UseGeneratedOffersResult["context"]>(null);
  const { consentGivenAt } = useLastIntent();

  const run = useCallback(async () => {
    if (!coords || !consentGivenAt) {
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

      const userStyle = userStyleStore.get();
      let merged = res.offers;
      try {
        const rendered = await api.renderOffers(intent, userStyle, res.offers);
        const byId = new Map(rendered.widgets.map((w) => [w.offerId, w]));
        merged = res.offers.map((o) => ({ ...o, widget: byId.get(o.id) }));
      } catch (renderErr) {
        const msg = renderErr instanceof Error ? renderErr.message : String(renderErr);
        console.warn("[render] widget render failed, using legacy card:", msg);
      }

      setOffers(merged);
      offerStore.setOffers(merged);
      setSource(res.source);
      setMode(res.source === "gemini" ? "live" : "server-fallback");
      setContext({
        city: w?.location?.name ?? null,
        temp: w?.temperature?.current ?? null,
        condition: w?.conditions?.description ?? null,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn("[offers] request failed, using local mockOffers:", msg);
      setOffers(mockOffers);
      offerStore.setOffers(mockOffers);
      setError(msg);
      setSource(null);
      setMode("offline");
    }
  }, [coords?.lat, coords?.lon, opts.freeMinutes, opts.budgetTier, consentGivenAt]);

  useEffect(() => {
    run();
  }, [run]);

  return { offers, mode, source, error, context, regenerate: run };
}
