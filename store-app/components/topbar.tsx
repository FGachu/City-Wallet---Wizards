"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, Check, Search } from "lucide-react";
import { useOnboarding } from "@/lib/onboarding-context";
import {
  CURRENT_VENUE_UPDATED_EVENT,
  getCurrentVenueAddress,
  getCurrentVenueName,
} from "@/lib/current-venue";
import { cn } from "@/lib/utils";

type NotificationItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
  unread: boolean;
};

export default function Topbar() {
  const { completed, hydrated } = useOnboarding();
  const [venueName, setVenueName] = useState("Café Müller");
  const [venueAddress, setVenueAddress] = useState("Stuttgart Innenstadt");
  const [openNotifications, setOpenNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "n1",
      title: "Offer accepted",
      detail: "A nearby customer accepted your hot drink bundle.",
      time: "1 min ago",
      unread: true,
    },
    {
      id: "n2",
      title: "Quiet window detected",
      detail: "Low transaction density in the last 10 minutes.",
      time: "5 min ago",
      unread: true,
    },
    {
      id: "n3",
      title: "Campaign healthy",
      detail: "Acceptance rate is up by 4pp vs. yesterday.",
      time: "12 min ago",
      unread: false,
    },
  ]);

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

  const unreadCount = notifications.filter((item) => item.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
  };

  const toggleNotifications = () => {
    setOpenNotifications((prev) => !prev);
  };

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

        <div className="relative">
          <button
            type="button"
            onClick={toggleNotifications}
            className={cn(
              "size-9 rounded-full border grid place-items-center transition relative",
              openNotifications
                ? "border-brand-300 bg-brand-50"
                : "border-ink-200 hover:bg-ink-50"
            )}
          >
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-brand-600 text-white text-[10px] leading-4 font-semibold">
                {Math.min(unreadCount, 9)}
              </span>
            )}
            <Bell className="size-4 text-ink-600" />
          </button>

          {openNotifications && (
            <div className="absolute right-0 top-11 w-80 rounded-xl border border-ink-200 bg-white shadow-xl shadow-ink-900/10 z-40">
              <div className="px-3 py-2.5 border-b border-ink-100 flex items-center justify-between">
                <div className="text-sm font-semibold text-ink-800">
                  Notifications
                </div>
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1"
                >
                  <Check className="size-3.5" />
                  Mark all read
                </button>
              </div>
              <div className="max-h-80 overflow-auto py-1">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className="px-3 py-2.5 border-b border-ink-100/80 last:border-b-0"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          {item.unread && (
                            <span className="size-1.5 rounded-full bg-brand-500 shrink-0 mt-1" />
                          )}
                          <div className="text-xs font-semibold text-ink-800">
                            {item.title}
                          </div>
                        </div>
                        <div className="text-xs text-ink-500 mt-1 leading-relaxed">
                          {item.detail.replace("your", venueName)}
                        </div>
                      </div>
                      <div className="text-[11px] text-ink-400 shrink-0">
                        {item.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

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
