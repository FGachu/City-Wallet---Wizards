"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { AGGRESSIVENESS, TIME_WINDOWS } from "./data";
import type { WindowId } from "./types";

export function AggressivenessSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const current = AGGRESSIVENESS[value];

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <div className="text-sm font-medium text-ink-800">
          Discount aggressiveness
        </div>
        <motion.div
          key={current.label}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-semibold text-brand-600"
        >
          {current.label} · up to {current.cap}%
        </motion.div>
      </div>

      <input
        type="range"
        min={0}
        max={3}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Discount aggressiveness"
        className="w-full appearance-none bg-transparent cursor-pointer
          [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full
          [&::-webkit-slider-runnable-track]:bg-gradient-to-r [&::-webkit-slider-runnable-track]:from-emerald-300 [&::-webkit-slider-runnable-track]:via-amber-300 [&::-webkit-slider-runnable-track]:to-brand-500
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
          [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand-500 [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:-mt-[6px]
          [&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-gradient-to-r [&::-moz-range-track]:from-emerald-300 [&::-moz-range-track]:via-amber-300 [&::-moz-range-track]:to-brand-500
          [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-brand-500"
      />

      <div className="flex justify-between mt-2 text-[11px] text-ink-400 font-medium">
        {AGGRESSIVENESS.map((a, i) => (
          <button
            key={a.label}
            type="button"
            onClick={() => onChange(i)}
            className={cn(
              "transition",
              value === i ? "text-brand-600" : "hover:text-ink-700"
            )}
          >
            {a.label}
          </button>
        ))}
      </div>

      <motion.div
        key={current.desc}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-3 text-xs text-ink-600 bg-ink-50 border border-ink-100 rounded-lg px-3 py-2"
      >
        {current.desc}
      </motion.div>
    </div>
  );
}

export function TimeWindowChips({
  value,
  onChange,
}: {
  value: WindowId[];
  onChange: (v: WindowId[]) => void;
}) {
  const toggle = (id: WindowId) =>
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id]
    );

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <div className="text-sm font-medium text-ink-800">
          When are you usually empty?
        </div>
        <span className="text-[11px] text-ink-500">
          {value.length} window{value.length === 1 ? "" : "s"} selected
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {TIME_WINDOWS.map((w) => {
          const active = value.includes(w.id);
          const Icon = w.icon;
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => toggle(w.id)}
              className={cn(
                "relative rounded-xl border px-3 py-3 text-left transition flex flex-col gap-1.5",
                active
                  ? "border-brand-500 bg-brand-50/60 text-brand-700 shadow-sm"
                  : "border-ink-200 hover:border-ink-300 text-ink-700"
              )}
            >
              <div className="flex items-center justify-between">
                <Icon
                  className={cn(
                    "size-4",
                    active ? "text-brand-500" : "text-ink-400"
                  )}
                />
                {active && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                    className="size-4 rounded-full bg-brand-500 grid place-items-center"
                  >
                    <Check className="size-2.5 text-white" strokeWidth={3} />
                  </motion.span>
                )}
              </div>
              <div className="text-sm font-semibold leading-tight">
                {w.label}
              </div>
              <div className="text-[11px] text-ink-500">{w.hint}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
