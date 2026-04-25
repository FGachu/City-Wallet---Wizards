import { cn, euro } from "@/lib/utils";
import type { Offer, Variant } from "../../types";

export function IntimateCard({
  variant,
  offer,
}: {
  variant: Variant;
  offer: Offer;
}) {
  const Icon = variant.ribbon.icon;
  const finalPrice = offer.price * (1 - offer.discount / 100);
  return (
    <div className="rounded-2xl bg-white shadow-lg overflow-hidden border border-white/60">
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-white bg-gradient-to-r",
          variant.ribbon.gradient
        )}
      >
        <Icon className="size-3.5" />
        <div className="text-[10px] font-semibold tracking-wider uppercase">
          {variant.ribbon.label}
        </div>
        <span className="ml-auto text-[10px] opacity-80">
          {variant.timestamp}
        </span>
      </div>
      <div className="p-3 space-y-2">
        <div className="text-base font-semibold leading-tight text-ink-900">
          {variant.headline}
        </div>
        <div className="text-xs text-ink-600 leading-snug">
          {variant.sub(offer.item)}
        </div>
        <div className="flex items-end justify-between mt-2 pt-2 border-t border-ink-100">
          <div>
            <div className="text-[10px] text-ink-500 line-through tabular-nums">
              {euro(offer.price)}
            </div>
            <div
              className={cn(
                "text-lg font-bold tabular-nums leading-none",
                variant.accent.fg
              )}
            >
              {euro(finalPrice)}
            </div>
          </div>
          <span
            className={cn(
              "rounded-full text-[10px] font-bold px-2 py-1 border",
              variant.accent.bg,
              variant.accent.fg,
              variant.accent.border
            )}
          >
            −{offer.discount}%
          </span>
        </div>
        <div className="text-[10px] text-ink-400 leading-snug pt-1">
          {variant.context}
        </div>
        <button
          type="button"
          className={cn(
            "w-full text-white text-xs font-semibold rounded-lg py-2 mt-1 bg-gradient-to-r shadow-sm",
            variant.ribbon.gradient
          )}
        >
          {variant.cta}
        </button>
      </div>
    </div>
  );
}
