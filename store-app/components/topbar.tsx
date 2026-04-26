"use client";

import { Bell, Search } from "lucide-react";
import { useOnboarding } from "@/lib/onboarding-context";

export default function Topbar() {
  const { completed, hydrated } = useOnboarding();

  if (!hydrated || !completed) return null;

  return (
    <header className="h-16 border-b border-ink-200 bg-white px-8 flex items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-ink-400">
            Restaurant
          </div>
          <div className="text-sm font-semibold">
            Café Müller · Stuttgart Innenstadt
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-ink-200 bg-ink-50/60 text-xs text-ink-500 w-72">
          <Search className="size-3.5" />
          <input
            placeholder="Search products, offers, customers…"
            className="bg-transparent outline-none flex-1 placeholder:text-ink-400"
          />
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live · accepting offers
        </div>

        <button className="size-9 rounded-full border border-ink-200 grid place-items-center hover:bg-ink-50 transition">
          <Bell className="size-4 text-ink-600" />
        </button>

        <div className="size-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 grid place-items-center text-white text-xs font-semibold shadow-sm">
          KM
        </div>
      </div>
    </header>
  );
}
