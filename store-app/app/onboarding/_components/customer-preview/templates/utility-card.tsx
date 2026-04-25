import { ArrowRight, CloudRain, Umbrella } from "lucide-react";
import { euro } from "@/lib/utils";
import type { Offer, Variant } from "../../types";

export function UtilityCard({
  offer,
}: {
  variant: Variant;
  offer: Offer;
}) {
  const finalPrice = offer.price * (1 - offer.discount / 100);
  return (
    <div className="rounded-2xl bg-ink-800 text-white shadow-2xl overflow-hidden border border-ink-700">
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-ink-900 border-b border-ink-700">
        <CloudRain className="size-3 text-sky-400" />
        <div className="text-[9px] font-bold tracking-[0.2em] uppercase text-sky-400">
          Route alert
        </div>
        <div className="ml-auto flex items-center gap-1 text-[9px] text-ink-400 font-mono">
          <span className="size-1 rounded-full bg-sky-400 animate-pulse" />
          live
        </div>
      </div>

      <div className="px-3 py-2.5 space-y-2">
        <div className="flex items-start gap-2">
          <Umbrella className="size-4 text-sky-300 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <div className="text-[13px] font-bold leading-tight text-white uppercase tracking-tight">
              Raining at your stop
            </div>
            <div className="text-[10px] text-ink-300 mt-0.5">
              U6 · Hauptbahnhof · 4 min
            </div>
          </div>
        </div>

        <div className="rounded-md bg-ink-900/60 border border-ink-700 p-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-ink-400 uppercase tracking-wider">
              {offer.item}
            </span>
            <span className="text-[10px] text-sky-300 font-mono">~90s</span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold tabular-nums text-white">
                {euro(finalPrice)}
              </span>
              <span className="text-[10px] text-ink-500 line-through tabular-nums">
                {euro(offer.price)}
              </span>
            </div>
            <span className="text-[10px] font-mono text-sky-400 px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/30">
              −{offer.discount}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1 text-[9px] font-mono text-ink-400">
          <div className="rounded bg-ink-900/40 px-1.5 py-1 border border-ink-700/60">
            40m
          </div>
          <div className="rounded bg-ink-900/40 px-1.5 py-1 border border-ink-700/60">
            no queue
          </div>
          <div className="rounded bg-ink-900/40 px-1.5 py-1 border border-ink-700/60">
            tap-pay
          </div>
        </div>

        <button
          type="button"
          className="w-full bg-sky-500 hover:bg-sky-400 text-ink-900 text-[11px] font-bold rounded-md py-2 mt-1 flex items-center justify-center gap-1.5"
        >
          Order ahead
          <ArrowRight className="size-3" />
        </button>
      </div>
    </div>
  );
}
