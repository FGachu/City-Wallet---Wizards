"use client";

import { cn } from "@/lib/utils";
import type { Variant } from "../types";

export function ProgressDots({
  pool,
  activeIdx,
  onSelect,
  empty,
}: {
  pool: Variant[];
  activeIdx: number;
  onSelect: (i: number) => void;
  empty: boolean;
}) {
  if (empty || pool.length <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1.5 mt-4">
      {pool.map((v, i) => (
        <button
          key={v.id}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={`Show offer for ${v.persona.label}`}
          className={cn(
            "h-1.5 rounded-full transition-all duration-500",
            i === activeIdx
              ? "w-8 bg-ink-800"
              : "w-1.5 bg-ink-300 hover:bg-ink-500"
          )}
        />
      ))}
    </div>
  );
}
