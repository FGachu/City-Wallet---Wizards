"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Offer, Variant } from "../types";
import { EASE } from "./constants";
import { PersonaStrip } from "./persona-strip";
import { Phone } from "./phone";
import { ProgressDots } from "./progress-dots";

export function CustomerPreview({
  offer,
  variant,
  pool,
  index,
  onSelect,
  live,
  empty,
}: {
  offer: Offer | null;
  variant: Variant | null;
  pool: Variant[];
  index: number;
  onSelect: (i: number) => void;
  live: boolean;
  empty: boolean;
}) {
  const activeIdx = pool.length
    ? ((index % pool.length) + pool.length) % pool.length
    : 0;

  return (
    <div className="rounded-2xl border border-ink-200 bg-gradient-to-br from-ink-100 to-ink-50 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[11px] uppercase tracking-wider font-semibold text-ink-700">
          Customer preview
        </div>
        <div
          className={cn(
            "inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-full",
            live
              ? "bg-emerald-100 text-emerald-700"
              : "bg-ink-200 text-ink-600"
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              live ? "bg-emerald-500 animate-pulse" : "bg-ink-400"
            )}
          />
          {live ? "Pushing live" : "Preview"}
        </div>
      </div>

      <PersonaStrip variant={variant} empty={empty} />

      <Phone variant={variant} offer={offer} empty={empty} />

      <ProgressDots
        pool={pool}
        activeIdx={activeIdx}
        onSelect={onSelect}
        empty={empty}
      />

      <AnimatePresence mode="wait">
        <motion.p
          key={variant?.id ?? "empty"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="text-[11px] text-ink-500 mt-3 text-center leading-relaxed px-2"
        >
          {variant
            ? `Generated at runtime for ${variant.persona.label.split("·")[0].trim()} — different person, weather, demand → different layout.`
            : "Capture your menu — we'll generate offers for the people walking past your venue right now."}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
