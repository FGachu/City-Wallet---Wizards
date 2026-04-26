"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Offer, Variant } from "../types";
import { TemplatedCard } from "./templated-card";

export function Phone({
  variant,
  offer,
  empty,
}: {
  variant: Variant | null;
  offer: Offer | null;
  empty: boolean;
}) {
  return (
    <div className="relative mx-auto w-full max-w-[280px] aspect-[9/18] bg-ink-900 rounded-[36px] p-2 shadow-xl">
      <div className="size-full rounded-[28px] overflow-hidden relative isolate">
        <AnimatePresence>
          <motion.div
            key={variant?.id ?? "empty-bg"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: "easeInOut" }}
            className={cn(
              "absolute inset-0 bg-gradient-to-b -z-10",
              variant?.bg ?? "from-sky-200 via-rose-100 to-amber-50"
            )}
          />
        </AnimatePresence>

        <div className="relative h-6 mt-2 z-20">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-3.5 rounded-full bg-ink-900 shadow-[inset_0_-1px_1px_rgba(255,255,255,0.15)]" />
          <div
            className={cn(
              "relative flex items-center justify-between h-full px-4 text-[10px] font-semibold",
              variant?.template === "utility"
                ? "text-ink-800"
                : "text-ink-700"
            )}
          >
            <span>9:41</span>
            <span>City Wallet</span>
          </div>
        </div>

        <div className="absolute inset-x-3 top-14 z-10">
          <AnimatePresence mode="wait">
            {empty || !offer || !variant ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl bg-white/70 backdrop-blur p-4 text-center text-xs text-ink-500 border border-white/80"
              >
                Capture your menu to preview the offer.
              </motion.div>
            ) : (
              <TemplatedCard
                key={`${variant.id}-${offer.item}-${offer.discount}`}
                variant={variant}
                offer={offer}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
