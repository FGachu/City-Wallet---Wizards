"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Eye, Sparkles, X } from "lucide-react";
import { mockOfferActivity } from "@/lib/mock-data";
import { getCurrentVenueName } from "@/lib/current-venue";
import { cn } from "@/lib/utils";

type LiveStatus = "accepted" | "shown" | "dismissed";

type LiveOffer = {
  id: string;
  offer: string;
  context: string;
  status: LiveStatus;
  time: string;
};

const statusMeta: Record<
  LiveStatus,
  { label: string; className: string; icon: React.ComponentType<{ className?: string }> }
> = {
  accepted: {
    label: "Accepted",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: Check,
  },
  shown: {
    label: "Shown",
    className: "bg-ink-100 text-ink-700 border-ink-200",
    icon: Eye,
  },
  dismissed: {
    label: "Dismissed",
    className: "bg-rose-50 text-rose-700 border-rose-200",
    icon: X,
  },
};

const rotatingContexts = [
  "Cold weather · lunchtime dip · nearby foot traffic",
  "Sunny break · terrace seats open · 4 min walk",
  "Rain incoming · commuter wave · low queue",
  "Quiet window · low transaction density · warm drinks trending",
];

const rotatingOffers = [
  "Hot chocolate + croissant bundle",
  "15% off cappuccino duo",
  "Lunch menu saver combo",
  "Coffee + cake local pick",
];

export default function OffersPage() {
  const [venueName, setVenueName] = useState("your venue");
  const [offers, setOffers] = useState<LiveOffer[]>(() => [...mockOfferActivity]);
  const [statusFilter, setStatusFilter] = useState<"all" | LiveStatus>("all");

  useEffect(() => {
    const boot = async () => {
      const liveVenueName = getCurrentVenueName();
      if (liveVenueName) {
        setVenueName(liveVenueName);
        return;
      }

      const response = await fetch("/api/settings", { cache: "no-store" });
      if (!response.ok) return;
      const settings = (await response.json()) as { venueName?: string };
      if (settings.venueName?.trim()) {
        setVenueName(settings.venueName.trim());
      }
    };

    boot().catch(() => undefined);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setOffers((prev) => {
        const nextId = String(Date.now());
        const statusPool: LiveStatus[] = ["accepted", "shown", "dismissed"];
        const nextStatus = statusPool[Math.floor(Math.random() * statusPool.length)];
        const offer = rotatingOffers[Math.floor(Math.random() * rotatingOffers.length)];
        const context =
          rotatingContexts[Math.floor(Math.random() * rotatingContexts.length)];
        const next: LiveOffer = {
          id: nextId,
          offer,
          context,
          status: nextStatus,
          time: "just now",
        };
        return [next, ...prev].slice(0, 24);
      });
    }, 9000);

    return () => window.clearInterval(id);
  }, []);

  const visibleOffers = useMemo(() => {
    if (statusFilter === "all") return offers;
    return offers.filter((offer) => offer.status === statusFilter);
  }, [offers, statusFilter]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Live offers</h1>
          <p className="text-sm text-ink-500 mt-1">
            Real-time feed for {venueName}. Offers update continuously based on
            demand, weather, and nearby context.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live stream active
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {(["all", "accepted", "shown", "dismissed"] as const).map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setStatusFilter(filter)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition",
              statusFilter === filter
                ? "border-brand-200 bg-brand-50 text-brand-700"
                : "border-ink-200 bg-white text-ink-600 hover:bg-ink-50"
            )}
          >
            {filter === "all" ? "All" : statusMeta[filter].label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-ink-200 bg-white p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4 text-xs uppercase tracking-wider font-semibold text-ink-500">
          <Sparkles className="size-3.5 text-brand-600" />
          Generated offer events
        </div>
        <div className="space-y-2">
          {visibleOffers.map((offer) => {
            const meta = statusMeta[offer.status];
            const Icon = meta.icon;
            return (
              <div
                key={offer.id}
                className="rounded-xl border border-ink-100 p-3 flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-ink-900 truncate">
                    {offer.offer}
                  </div>
                  <div className="text-xs text-ink-500 mt-0.5 truncate">
                    {offer.context}
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium",
                      meta.className
                    )}
                  >
                    <Icon className="size-3.5" />
                    {meta.label}
                  </span>
                  <span className="text-[11px] text-ink-400">{offer.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
