"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Sparkles, Sliders, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDensityProvider } from "@/lib/transaction-density";
import {
  detectQuietWindows,
  formatQuietWindow,
  quietWindowsToConfiguredWindows,
} from "@/lib/transaction-density/detect-quiet";
import type {
  MerchantDensity,
  QuietWindow,
} from "@/lib/transaction-density/types";
import type { VerifyStatus, WindowId } from "./types";
import { TimeWindowChips } from "./rules-config";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

type Props = {
  merchantId: string;
  verifyStatus: VerifyStatus;
  windows: WindowId[];
  setWindows: (w: WindowId[]) => void;
};

export function QuietWindowsPanel({
  merchantId,
  verifyStatus,
  windows,
  setWindows,
}: Props) {
  const [density, setDensity] = useState<MerchantDensity | null>(null);
  const [loading, setLoading] = useState(false);
  const [overrideMode, setOverrideMode] = useState(false);
  const lastAppliedRef = useRef<string | null>(null);

  const verified = verifyStatus === "verified";

  useEffect(() => {
    if (!verified || !merchantId) {
      setDensity(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getDensityProvider()
      .getDensity(merchantId)
      .then((d) => {
        if (!cancelled) {
          setDensity(d);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [merchantId, verified]);

  const detected = useMemo<QuietWindow[]>(
    () => (density ? detectQuietWindows(density) : []),
    [density]
  );

  useEffect(() => {
    if (!density || overrideMode || detected.length === 0) return;
    const signature = `${density.merchantId}:${detected
      .map((w) => `${w.day}-${w.startHour}-${w.endHour}`)
      .join("|")}`;
    if (lastAppliedRef.current === signature) return;
    lastAppliedRef.current = signature;
    const auto = quietWindowsToConfiguredWindows(detected);
    if (auto.length) setWindows(auto);
  }, [density, detected, overrideMode, setWindows]);

  if (!verified) {
    return <PreVerifyState windows={windows} setWindows={setWindows} />;
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3 gap-3 flex-wrap">
        <div>
          <div className="text-sm font-medium text-ink-800 inline-flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-brand-500" />
            Quiet windows · auto-detected
          </div>
          <div className="text-[11px] text-ink-500 mt-0.5">
            From your last 30 days of Payone transactions
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setOverrideMode((v) => {
              if (v) lastAppliedRef.current = null;
              return !v;
            });
          }}
          className={cn(
            "inline-flex items-center gap-1.5 text-[11px] font-medium rounded-full px-2.5 py-1 border transition",
            overrideMode
              ? "bg-brand-50 border-brand-200 text-brand-700"
              : "bg-white border-ink-200 text-ink-600 hover:border-ink-300"
          )}
        >
          <Sliders className="size-3" />
          {overrideMode ? "Using manual override" : "Override manually"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {overrideMode ? (
          <motion.div
            key="manual"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            <TimeWindowChips value={windows} onChange={setWindows} />
          </motion.div>
        ) : loading || !density ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-ink-200 bg-ink-50/40 p-6 grid place-items-center text-xs text-ink-500"
          >
            <div className="inline-flex items-center gap-2">
              <Loader2 className="size-3.5 animate-spin" />
              Reading Payone transaction history…
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="auto"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            <Heatmap density={density} highlights={detected} />
            <DetectedList windows={detected} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PreVerifyState({
  windows,
  setWindows,
}: {
  windows: WindowId[];
  setWindows: (w: WindowId[]) => void;
}) {
  return (
    <div>
      <div className="rounded-xl border border-dashed border-ink-300 bg-ink-50/30 p-3 mb-4 flex items-start gap-2.5">
        <Lock className="size-4 text-ink-500 shrink-0 mt-0.5" />
        <div className="text-xs text-ink-600 leading-relaxed">
          Once you verify your Payone Merchant ID below, we&apos;ll detect your
          quiet windows automatically from real transaction density. For now,
          set them by hand — you can override anytime.
        </div>
      </div>
      <TimeWindowChips value={windows} onChange={setWindows} />
    </div>
  );
}

function Heatmap({
  density,
  highlights,
}: {
  density: MerchantDensity;
  highlights: QuietWindow[];
}) {
  const max = useMemo(() => {
    let m = 0;
    for (const row of density.matrix) for (const v of row) if (v > m) m = v;
    return m || 1;
  }, [density]);

  const isHighlighted = (day: number, hour: number) =>
    highlights.some(
      (w) => w.day === day && hour >= w.startHour && hour < w.endHour
    );

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-3 overflow-x-auto">
      <div className="min-w-[480px]">
        <div className="flex items-center gap-1 pl-8 mb-1">
          {HOURS.map((h) => (
            <div
              key={h}
              className="flex-1 text-[8px] text-ink-400 text-center font-mono"
            >
              {h % 6 === 0 ? h : ""}
            </div>
          ))}
        </div>
        {density.matrix.map((row, day) => (
          <div key={day} className="flex items-center gap-1 mb-0.5">
            <div className="w-7 text-[10px] text-ink-500 font-medium">
              {DAY_LABELS[day]}
            </div>
            {row.map((value, hour) => {
              const intensity = value / max;
              const quiet = isHighlighted(day, hour);
              return (
                <div
                  key={hour}
                  className={cn(
                    "flex-1 h-4 rounded-[3px] transition",
                    quiet
                      ? "ring-1 ring-brand-400 ring-offset-[1px] ring-offset-white"
                      : ""
                  )}
                  style={{
                    backgroundColor: quiet
                      ? "rgb(96 165 250 / 0.25)"
                      : intensity > 0.7
                      ? `rgba(244, 114, 91, ${0.25 + intensity * 0.55})`
                      : intensity > 0.35
                      ? `rgba(251, 191, 36, ${0.25 + intensity * 0.4})`
                      : `rgba(148, 163, 184, ${0.1 + intensity * 0.25})`,
                  }}
                  title={`${DAY_LABELS[day]} ${hour
                    .toString()
                    .padStart(2, "0")}:00 · density ${value.toFixed(2)}`}
                />
              );
            })}
          </div>
        ))}
        <div className="flex items-center justify-between mt-2 pl-8 text-[10px] text-ink-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-blue-400/30 ring-1 ring-brand-400" />
            Quiet (≥30% below baseline)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-amber-300" /> Steady
            <span className="size-2.5 rounded-sm bg-rose-400 ml-1" /> Peak
          </span>
        </div>
      </div>
    </div>
  );
}

function DetectedList({ windows }: { windows: QuietWindow[] }) {
  const top = windows.slice(0, 3);
  if (top.length === 0) {
    return (
      <div className="text-xs text-ink-500 rounded-lg bg-ink-50 border border-ink-100 px-3 py-2">
        No clear quiet pattern yet — your Payone activity is fairly even. Use
        manual override to seed your first windows.
      </div>
    );
  }
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-ink-500 mb-2 font-semibold">
        Top {top.length} quiet window{top.length === 1 ? "" : "s"}
      </div>
      <ul className="space-y-1.5">
        {top.map((w) => (
          <li
            key={`${w.day}-${w.startHour}`}
            className="flex items-center justify-between rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm"
          >
            <span className="font-medium text-ink-800">
              {formatQuietWindow(w)}
            </span>
            <span className="text-xs font-semibold text-brand-600 tabular-nums">
              {Math.round(w.deviationPct)}% vs avg
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
