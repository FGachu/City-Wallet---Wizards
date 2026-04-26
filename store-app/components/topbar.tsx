"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, Search } from "lucide-react";
import { useOnboarding } from "@/lib/onboarding-context";
import {
  CURRENT_VENUE_UPDATED_EVENT,
  getCurrentVenueAddress,
  getCurrentVenueName,
} from "@/lib/current-venue";

export default function Topbar() {
  const { completed, hydrated } = useOnboarding();
  const [venueName, setVenueName] = useState("Café Müller");
  const [venueAddress, setVenueAddress] = useState("Stuttgart Innenstadt");

  useEffect(() => {
    const updateFromCurrentVenue = () => {
      const liveName = getCurrentVenueName();
      const liveAddress = getCurrentVenueAddress();
      if (liveName) setVenueName(liveName);
      if (liveAddress) setVenueAddress(formatAddressForTopbar(liveAddress));
    };

    const loadFallbackSettings = async () => {
      const response = await fetch("/api/settings", { cache: "no-store" });
      if (!response.ok) return;
      const settings = (await response.json()) as {
        venueName?: string;
        address?: string;
      };
      if (settings.venueName?.trim()) setVenueName(settings.venueName.trim());
      if (settings.address?.trim()) {
        setVenueAddress(formatAddressForTopbar(settings.address));
      }
    };

    updateFromCurrentVenue();
    loadFallbackSettings().catch(() => undefined);

    window.addEventListener(CURRENT_VENUE_UPDATED_EVENT, updateFromCurrentVenue);
    window.addEventListener("storage", updateFromCurrentVenue);
    return () => {
      window.removeEventListener(
        CURRENT_VENUE_UPDATED_EVENT,
        updateFromCurrentVenue
      );
      window.removeEventListener("storage", updateFromCurrentVenue);
    };
  }, []);

  const initials = useMemo(() => {
    const words = venueName
      .split(/\s+/)
      .map((word) => word.trim())
      .filter(Boolean);
    return words
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("") || "CW";
  }, [venueName]);

  if (!hydrated || !completed) return null;

  return (
    <header className="h-16 border-b border-ink-200 bg-white px-8 flex items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-ink-400">
            Restaurant
          </div>
          <div className="text-sm font-semibold">
            {venueName} · {venueAddress}
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
          {initials}
        </div>
      </div>
    </header>
  );
}

function formatAddressForTopbar(address: string): string {
  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 3) return `${parts[1]} ${parts[2]}`;
  if (parts.length >= 2) return `${parts[0]} ${parts[1]}`;
  return parts[0] ?? "Your current area";
}
