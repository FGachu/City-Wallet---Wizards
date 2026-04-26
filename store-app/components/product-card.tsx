"use client";

import { useState } from "react";
import { euro } from "@/lib/utils";
import type { Product } from "@/lib/types";
import PhotoUpload from "./photo-upload";

export default function ProductCard({ product }: { product: Product }) {
  const [discount, setDiscount] = useState(product.maxDiscount);
  const [enabled, setEnabled] = useState(product.enabled);
  const [photo, setPhoto] = useState<string | null>(product.photo);

  const discountedPrice = product.price * (1 - discount / 100);

  return (
    <div className="rounded-2xl border border-ink-200 bg-white overflow-hidden flex flex-col">
      <PhotoUpload initial={photo} onChange={setPhoto} />

      <div className="p-4 flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-ink-500">{product.category}</div>
            <div className="font-semibold text-base leading-tight">
              {product.name}
            </div>
          </div>
          <button
            onClick={() => setEnabled((v) => !v)}
            className={
              "relative h-5 w-9 rounded-full transition " +
              (enabled ? "bg-brand-500" : "bg-ink-200")
            }
            aria-label="Toggle in offers"
          >
            <span
              className={
                "absolute top-0.5 size-4 rounded-full bg-white shadow transition-all " +
                (enabled ? "left-[18px]" : "left-0.5")
              }
            />
          </button>
        </div>

        <div className="flex items-baseline gap-2">
          <div className="text-lg font-semibold">{euro(product.price)}</div>
          {discount > 0 && enabled && (
            <div className="text-xs text-ink-500">
              <span className="text-emerald-600 font-medium">
                {euro(discountedPrice)}
              </span>{" "}
              at max discount
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="text-ink-600">Max discount</label>
            <span className="font-semibold text-ink-900">{discount}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={50}
            step={5}
            value={discount}
            disabled={!enabled}
            onChange={(e) => setDiscount(Number(e.target.value))}
            className="w-full accent-brand-500 disabled:opacity-40"
          />
          <div className="flex justify-between text-[10px] text-ink-400">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
          </div>
        </div>

        <div className="text-[11px] text-ink-500 leading-relaxed mt-auto pt-2 border-t border-ink-100">
          AI may pick any value up to{" "}
          <span className="font-medium text-ink-700">{discount}%</span> based on
          live demand and weather.
        </div>
      </div>
    </div>
  );
}
