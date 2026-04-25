"use client";

import { useState } from "react";
import { Check, Flame, MinusCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DemandSignal } from "@/lib/types";

type Mode = {
  id: DemandSignal;
  label: string;
  short: string;
  description: string;
  detail: string;
  ring: string;
  bg: string;
  text: string;
  dot: string;
  icon: typeof Users;
};

const MODES: Mode[] = [
  {
    id: "bring-them-in",
    label: "Bring them in",
    short: "Need more guests",
    description:
      "Tables empty. AI will generate aggressive offers to nearby walk-ins.",
    detail:
      "Up to your max discount · proactive push to people within 500 m matching warm-drink and lunch intents.",
    ring: "ring-emerald-500",
    bg: "bg-emerald-500",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    icon: Users,
  },
  {
    id: "steady",
    label: "Steady flow",
    short: "Balanced",
    description:
      "Healthy traffic. AI sends moderate, well-targeted offers only.",
    detail:
      "Up to half your max discount · only high-intent matches (browsing nearby, returning customers).",
    ring: "ring-amber-500",
    bg: "bg-amber-500",
    text: "text-amber-700",
    dot: "bg-amber-500",
    icon: MinusCircle,
  },
  {
    id: "we-are-full",
    label: "We're full",
    short: "Slow down",
    description:
      "Capacity reached. AI pauses acquisition offers and protects the queue.",
    detail:
      "No new offers · existing accepted offers stay valid until expiry.",
    ring: "ring-rose-500",
    bg: "bg-rose-500",
    text: "text-rose-700",
    dot: "bg-rose-500",
    icon: Flame,
  },
];

export default function TrafficLight({
  initial = "bring-them-in",
  compact = false,
}: {
  initial?: DemandSignal;
  compact?: boolean;
}) {
  const [active, setActive] = useState<DemandSignal>(initial);
  const current = MODES.find((m) => m.id === active)!;

  if (compact) {
    return (
      <div className="rounded-xl border border-ink-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-ink-500">Demand signal</div>
            <div className="font-semibold mt-0.5">{current.label}</div>
          </div>
          <div className="relative size-9 grid place-items-center">
            <span
              className={cn("size-3 rounded-full relative", current.dot, current.text)}
            >
              {active === "bring-them-in" && <span className="pulse-ring" />}
            </span>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setActive(m.id)}
              className={cn(
                "h-2 rounded-full transition",
                active === m.id ? m.bg : "bg-ink-200 hover:bg-ink-300"
              )}
              aria-label={m.label}
            />
          ))}
        </div>
        <div className="text-[11px] text-ink-500 mt-3 leading-relaxed">
          {current.description}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {MODES.map((m) => {
          const Icon = m.icon;
          const isActive = active === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActive(m.id)}
              className={cn(
                "relative text-left rounded-2xl border p-5 transition group",
                isActive
                  ? "border-transparent ring-2 " + m.ring + " bg-white shadow-sm"
                  : "border-ink-200 bg-white hover:border-ink-300"
              )}
            >
              {isActive && (
                <span className="absolute top-3 right-3 size-5 rounded-full bg-ink-900 grid place-items-center">
                  <Check className="size-3 text-white" />
                </span>
              )}
              <div className="relative inline-grid place-items-center">
                <span
                  className={cn(
                    "size-10 rounded-full grid place-items-center transition",
                    isActive ? m.bg : "bg-ink-100"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-5",
                      isActive ? "text-white" : "text-ink-500"
                    )}
                  />
                </span>
                {isActive && m.id === "bring-them-in" && (
                  <span className={cn("pulse-ring", m.text)} />
                )}
              </div>
              <div className="mt-4">
                <div className="text-[11px] uppercase tracking-wider text-ink-400">
                  {m.short}
                </div>
                <div className="font-semibold text-base mt-0.5">{m.label}</div>
                <div className="text-xs text-ink-500 mt-1.5 leading-relaxed">
                  {m.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-ink-200 bg-white p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={cn("size-2 rounded-full", current.dot)} />
          <div className="text-xs uppercase tracking-wider text-ink-500">
            What City Wallet AI is doing now
          </div>
        </div>
        <div className="text-sm text-ink-800 leading-relaxed">
          {current.detail}
        </div>
      </div>
    </div>
  );
}
