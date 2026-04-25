"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  Check,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  ScanLine,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { cn, euro } from "@/lib/utils";
import type { MenuItem } from "./types";

export const MENU_AI_SCAN_ENABLED = false;

const CATEGORY_SUGGESTIONS = [
  "Drinks",
  "Pastries",
  "Mains",
  "Desserts",
  "Snacks",
  "Sides",
];

export function ComingSoonUpload({ onManual }: { onManual: () => void }) {
  return (
    <div className="space-y-4">
      <div className="relative rounded-xl border-2 border-dashed border-ink-200 bg-ink-50/40 px-5 py-8 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 opacity-45 pointer-events-none select-none">
          <div className="flex flex-col items-center justify-center gap-1.5 text-ink-500 py-2">
            <Upload className="size-6" />
            <span className="text-sm font-semibold mt-1">
              Drop or click to upload
            </span>
            <span className="text-[11px]">PDF, JPG, PNG · 5 MB max</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 text-ink-500 py-2">
            <Camera className="size-6" />
            <span className="text-sm font-semibold mt-1">Take a photo</span>
            <span className="text-[11px]">Use the back camera</span>
          </div>
        </div>
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-white border border-ink-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-700 shadow-sm">
            <Sparkles className="size-3 text-brand-500" />
            Coming soon
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-ink-400">
        <span className="h-px flex-1 bg-ink-100" />
        For now, add items manually
        <span className="h-px flex-1 bg-ink-100" />
      </div>

      <button
        type="button"
        onClick={onManual}
        className="w-full rounded-xl bg-ink-900 text-white py-3 text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-ink-800 transition"
      >
        <Pencil className="size-4" />
        Start manual entry
      </button>
    </div>
  );
}

export function UploadArea({
  dragging,
  setDragging,
  onCapture,
  inputRef,
}: {
  dragging: boolean;
  setDragging: (v: boolean) => void;
  onCapture: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files?.[0]) onCapture();
        }}
      >
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "w-full rounded-xl border-2 border-dashed py-10 px-5 transition flex flex-col items-center justify-center gap-1.5",
            dragging
              ? "border-brand-500 bg-brand-50/50 text-brand-700"
              : "border-ink-200 text-ink-500 hover:border-brand-400 hover:bg-brand-50/30 hover:text-brand-700"
          )}
        >
          <Upload className="size-6" />
          <span className="text-sm font-semibold mt-1">
            Drop or click to upload
          </span>
          <span className="text-[11px]">PDF, JPG, PNG · 5 MB max</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) onCapture();
          }}
        />
      </div>
      <button
        type="button"
        onClick={onCapture}
        className="w-full rounded-xl border-2 border-dashed border-ink-200 py-10 px-5 transition flex flex-col items-center justify-center gap-1.5 text-ink-500 hover:border-brand-400 hover:bg-brand-50/30 hover:text-brand-700"
      >
        <Camera className="size-6" />
        <span className="text-sm font-semibold mt-1">Take a photo</span>
        <span className="text-[11px]">Use the back camera</span>
      </button>
    </div>
  );
}

export function ScanningView({ progress }: { progress: number }) {
  return (
    <div className="rounded-xl border border-ink-200 overflow-hidden">
      <div className="relative aspect-[16/8] sm:aspect-[16/6] bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900 overflow-hidden">
        <motion.div
          className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-400 to-transparent shadow-[0_0_24px_4px] shadow-brand-400/60"
          animate={{ y: ["10%", "90%", "10%"] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        />
        {[
          "top-3 left-3 border-t-2 border-l-2 rounded-tl-md",
          "top-3 right-3 border-t-2 border-r-2 rounded-tr-md",
          "bottom-3 left-3 border-b-2 border-l-2 rounded-bl-md",
          "bottom-3 right-3 border-b-2 border-r-2 rounded-br-md",
        ].map((c, i) => (
          <span key={i} className={cn("absolute size-6 border-brand-400", c)} />
        ))}
        <div className="absolute inset-0 grid place-items-center">
          <div className="flex flex-col items-center gap-2 text-white">
            <ScanLine className="size-7 text-brand-400" />
            <div className="text-sm font-medium">Reading menu…</div>
            <div className="text-[11px] text-ink-300">
              Detecting items, prices and categories
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-2 bg-white">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-ink-700 inline-flex items-center gap-1.5">
            <Loader2 className="size-3.5 animate-spin text-brand-500" />
            AI processing
          </span>
          <span className="font-mono text-ink-500 tabular-nums">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-brand-500 to-brand-400"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>
    </div>
  );
}

export function InventoryPreview({
  items,
  setItems,
  onRescan,
  avgPrice,
  manualMode = false,
}: {
  items: MenuItem[];
  setItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  onRescan: () => void;
  avgPrice: number;
  manualMode?: boolean;
}) {
  const [draftName, setDraftName] = useState("");
  const [draftPrice, setDraftPrice] = useState("");
  const [draftCategory, setDraftCategory] = useState("");

  const remove = (id: string) =>
    setItems((arr) => arr.filter((i) => i.id !== id));

  const add = () => {
    const price = parseFloat(draftPrice.replace(",", "."));
    if (!draftName.trim() || !Number.isFinite(price) || price <= 0) return;
    setItems((arr) => [
      ...arr,
      {
        id: `m-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        name: draftName.trim(),
        price,
        category: draftCategory.trim() || "Other",
      },
    ]);
    setDraftName("");
    setDraftPrice("");
  };

  const canAdd =
    draftName.trim().length > 0 &&
    Number.isFinite(parseFloat(draftPrice.replace(",", "."))) &&
    parseFloat(draftPrice.replace(",", ".")) > 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
            items.length > 0
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-amber-50 border-amber-200 text-amber-700"
          )}
        >
          {items.length > 0 ? (
            <>
              <Check className="size-3" />
              {items.length} items · avg {euro(avgPrice)}
            </>
          ) : (
            <>
              <Pencil className="size-3" />
              Add at least one item to go live
            </>
          )}
        </div>
        {!manualMode && (
          <button
            type="button"
            onClick={onRescan}
            className="text-xs text-ink-500 hover:text-ink-900 inline-flex items-center gap-1.5"
          >
            <RefreshCw className="size-3.5" />
            Rescan
          </button>
        )}
      </div>

      <div className="rounded-xl border border-ink-200 overflow-hidden">
        {items.length > 0 && (
          <>
            <div className="grid grid-cols-[1fr_auto_28px] gap-3 px-4 py-2 bg-ink-50 text-[11px] uppercase tracking-wider text-ink-500 font-medium">
              <span>Item</span>
              <span className="text-right">Price</span>
              <span />
            </div>
            <ul className="divide-y divide-ink-100 max-h-[360px] overflow-y-auto">
              <AnimatePresence initial={true}>
                {items.map((item, i) => (
                  <motion.li
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ delay: i * 0.04, duration: 0.2 }}
                    className="grid grid-cols-[1fr_auto_28px] items-center gap-3 px-4 py-2.5 hover:bg-ink-50/60 group"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-ink-500">
                        {item.category}
                      </div>
                    </div>
                    <div className="text-sm font-semibold tabular-nums">
                      {euro(item.price)}
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      className="size-7 rounded-md grid place-items-center text-ink-300 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            add();
          }}
          className={cn(
            "p-3 bg-ink-50/30 grid grid-cols-1 sm:grid-cols-[1fr_120px_auto] gap-2",
            items.length > 0 && "border-t border-ink-100"
          )}
        >
          <input
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            placeholder="Item name"
            className="rounded-md border border-ink-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
          <input
            value={draftPrice}
            onChange={(e) => setDraftPrice(e.target.value)}
            placeholder="€ 0.00"
            inputMode="decimal"
            className="rounded-md border border-ink-200 bg-white px-3 py-2 text-sm tabular-nums focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
          <button
            type="submit"
            disabled={!canAdd}
            className={cn(
              "rounded-md px-4 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition",
              canAdd
                ? "bg-ink-900 text-white hover:bg-ink-800"
                : "bg-ink-100 text-ink-400 cursor-not-allowed"
            )}
          >
            <Plus className="size-3.5" />
            Add
          </button>
          <input
            list="menu-categories"
            value={draftCategory}
            onChange={(e) => setDraftCategory(e.target.value)}
            placeholder="Category (optional)"
            className="sm:col-span-3 rounded-md border border-ink-200 bg-white px-3 py-1.5 text-xs text-ink-700 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
          <datalist id="menu-categories">
            {CATEGORY_SUGGESTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </form>
      </div>
    </div>
  );
}
