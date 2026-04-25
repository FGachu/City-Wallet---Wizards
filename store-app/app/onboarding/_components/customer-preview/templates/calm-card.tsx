import { Heart } from "lucide-react";
import { euro } from "@/lib/utils";
import type { Offer, Variant } from "../../types";

export function CalmCard({
  variant,
  offer,
}: {
  variant: Variant;
  offer: Offer;
}) {
  const finalPrice = offer.price * (1 - offer.discount / 100);
  return (
    <div className="rounded-3xl bg-white/95 backdrop-blur shadow-lg overflow-hidden border border-purple-100 w-full">
      <div className="px-4 pt-5 pb-1 flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] text-purple-700 font-semibold">
          <Heart className="size-2.5 fill-purple-500 text-purple-500" />
          {variant.ribbon.label}
        </div>
        <span className="text-[9px] text-slate-500">{variant.timestamp}</span>
      </div>

      <div className="px-4 pt-3 pb-4 space-y-3">
        <div
          className="text-[18px] leading-snug text-ink-900 font-light tracking-tight"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {variant.headline}
        </div>
        <div className="text-[12px] text-slate-600 leading-relaxed font-light">
          {variant.sub(offer.item)}
        </div>
      </div>

      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent" />

      <div className="px-4 py-3 flex items-end justify-between">
        <div className="flex flex-col">
          <div className="text-[9px] text-slate-500 uppercase tracking-wider font-medium">
            today
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold tabular-nums text-purple-700 leading-none">
              {euro(finalPrice)}
            </span>
            <span className="text-[10px] text-slate-400/80 line-through tabular-nums leading-none">
              {euro(offer.price)}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-[9px] text-slate-500 uppercase tracking-wider font-medium">
            seats
          </div>
          <div className="text-base font-semibold text-purple-700 mt-1 leading-none tabular-nums">
            2 · window
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <button
          type="button"
          className="w-full bg-purple-100 hover:bg-purple-200 text-purple-900 text-[12px] font-semibold rounded-full py-2.5 transition-colors"
        >
          {variant.cta}
        </button>
        <div className="text-[9px] text-slate-500 text-center mt-2 font-light">
          {variant.context}
        </div>
      </div>
    </div>
  );
}
