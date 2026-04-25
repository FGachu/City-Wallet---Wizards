"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Variant } from "../types";
import { EASE } from "./constants";

export function PersonaStrip({
  variant,
  empty,
}: {
  variant: Variant | null;
  empty: boolean;
}) {
  if (empty || !variant) return <div className="h-12 mb-3" />;

  return (
    <div className="h-12 mb-3 relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={variant.id}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="absolute inset-0 flex items-center gap-2.5"
        >
          <span
            className={cn(
              "size-9 rounded-full grid place-items-center text-sm font-bold text-white shrink-0 shadow-sm bg-gradient-to-br",
              variant.ribbon.gradient
            )}
          >
            {variant.persona.initial}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-ink-900 truncate">
              {variant.persona.label}
            </div>
            <div className="text-[10px] text-ink-500 truncate">
              {variant.persona.subtitle}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
