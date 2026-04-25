import { Bookmark, MapPin, Sparkles, Star } from "lucide-react";
import { euro } from "@/lib/utils";
import type { Offer, Variant } from "../../types";

export function DiscoveryCard({
  variant,
  offer,
}: {
  variant: Variant;
  offer: Offer;
}) {
  const finalPrice = offer.price * (1 - offer.discount / 100);
  const saving = offer.price - finalPrice;
  return (
    <div className="rounded-2xl bg-[#fdfaf3] shadow-lg overflow-hidden border border-emerald-200/70 relative">
      <div className="aspect-[16/7] bg-gradient-to-br from-emerald-200 via-teal-200 to-sky-200 relative overflow-hidden">
        <div className="absolute inset-0 opacity-60 mix-blend-multiply bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.6),transparent_60%)]" />
        <div className="absolute top-2 left-2 inline-flex items-center gap-1 bg-white/90 backdrop-blur rounded-full px-2 py-0.5 text-[9px] font-semibold text-emerald-800 shadow-sm">
          <MapPin className="size-2.5" />
          Stuttgart · Mitte
        </div>
        <div className="absolute bottom-2 right-2 size-9 grid place-items-center rounded-md border-2 border-emerald-700/70 bg-white/80 rotate-[-6deg] shadow">
          <div className="text-[7px] font-bold text-emerald-800 leading-tight text-center">
            LOCAL
            <br />
            PICK
          </div>
        </div>
      </div>

      <div className="px-3 pt-2.5 pb-3 space-y-2">
        <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
          {Array.from({ length: 4 }).map((_, i) => (
            <Star
              key={i}
              className="size-2.5 fill-emerald-600 text-emerald-600"
            />
          ))}
          <span className="text-ink-500">· locals love</span>
        </div>
        <div
          className="text-[17px] leading-tight text-ink-900 font-semibold"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {variant.headline}
        </div>
        <div className="text-[11px] text-ink-600 leading-snug">
          {variant.sub(offer.item)}
        </div>
        <div className="flex items-center gap-2 pt-1 text-[10px] text-ink-500">
          <Sparkles className="size-3 text-emerald-600" />
          Terrace seat saved · 3 min walk
        </div>
        <div className="flex items-end justify-between pt-2 mt-1 border-t border-dashed border-emerald-200">
          <div>
            <div className="text-base font-bold tabular-nums text-emerald-800 leading-none">
              {euro(finalPrice)}
            </div>
            <div className="text-[9px] text-emerald-700 mt-0.5">
              save {euro(saving)}
            </div>
          </div>
          <button
            type="button"
            className="rounded-full bg-emerald-700 text-white text-[11px] font-semibold px-3 py-1.5 inline-flex items-center gap-1 shadow"
          >
            <Bookmark className="size-3" />
            Save the seat
          </button>
        </div>
      </div>
    </div>
  );
}
