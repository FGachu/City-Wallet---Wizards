import { ArrowRight, Clock, Flame } from "lucide-react";
import { euro } from "@/lib/utils";
import type { Offer, Variant } from "../../types";

export function ScarcityCard({
  variant,
  offer,
}: {
  variant: Variant;
  offer: Offer;
}) {
  const finalPrice = offer.price * (1 - offer.discount / 100);
  return (
    <div className="rounded-2xl bg-ink-900 text-white shadow-2xl overflow-hidden border border-ink-800 relative">
      <div className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
        <Flame className="size-3.5" />
        <div className="text-[10px] font-bold tracking-[0.18em] uppercase">
          {variant.ribbon.label}
        </div>
        <span className="ml-auto text-[10px] font-mono opacity-90">
          19:30 · close
        </span>
      </div>

      <div className="px-3 pt-3 pb-2 flex items-stretch gap-3 border-b border-dashed border-ink-700">
        <div className="flex flex-col items-center justify-center px-2">
          <div className="text-[42px] font-black leading-none text-orange-400 tabular-nums">
            3
          </div>
          <div className="text-[9px] tracking-[0.2em] uppercase text-ink-400 mt-0.5">
            left
          </div>
        </div>
        <div className="w-px bg-ink-700/60" />
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="text-[9px] tracking-[0.18em] uppercase text-ink-400">
            tonight only
          </div>
          <div className="text-base font-bold leading-tight text-white mt-0.5">
            {offer.item}
          </div>
          <div className="text-[10px] text-ink-300 leading-snug mt-1">
            half-off · first come, first served
          </div>
        </div>
      </div>

      <div className="px-3 py-2.5 flex items-center justify-between bg-ink-900">
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] text-ink-500 line-through tabular-nums">
            {euro(offer.price)}
          </span>
          <span className="text-lg font-extrabold tabular-nums text-orange-400 leading-none">
            {euro(finalPrice)}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-orange-300 font-mono">
          <Clock className="size-3" />
          32:14
        </div>
      </div>

      <button
        type="button"
        className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold tracking-wide py-2.5 flex items-center justify-center gap-1.5"
      >
        Reserve mine
        <ArrowRight className="size-3.5" />
      </button>

      <div className="absolute left-0 right-0 top-[calc(50%+18px)] flex justify-between px-1 pointer-events-none">
        <div className="size-3 rounded-full bg-ink-100" />
        <div className="size-3 rounded-full bg-ink-100" />
      </div>
    </div>
  );
}
