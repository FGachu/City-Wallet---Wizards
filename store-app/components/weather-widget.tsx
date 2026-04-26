"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CURRENT_VENUE_UPDATED_EVENT,
  getCurrentVenueAddress,
} from "@/lib/current-venue";

export default function WeatherWidget() {
  const [locationLabel, setLocationLabel] = useState("Your current city");
  const [currentTime, setCurrentTime] = useState(() => formatCurrentTime(new Date()));

  useEffect(() => {
    const updateFromLiveVenue = () => {
      const address = getCurrentVenueAddress();
      if (!address) return;
      setLocationLabel(formatLocationLabel(address));
    };

    const loadSettingsFallback = async () => {
      const response = await fetch("/api/settings", { cache: "no-store" });
      if (!response.ok) return;
      const settings = (await response.json()) as { address?: string };
      if (settings.address?.trim()) {
        setLocationLabel(formatLocationLabel(settings.address));
      }
    };

    updateFromLiveVenue();
    loadSettingsFallback().catch(() => undefined);
    window.addEventListener(CURRENT_VENUE_UPDATED_EVENT, updateFromLiveVenue);
    window.addEventListener("storage", updateFromLiveVenue);
    return () => {
      window.removeEventListener(CURRENT_VENUE_UPDATED_EVENT, updateFromLiveVenue);
      window.removeEventListener("storage", updateFromLiveVenue);
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setCurrentTime(formatCurrentTime(new Date()));
    }, 30000);
    return () => window.clearInterval(id);
  }, []);

  const insight = useMemo(() => {
    return `Slightly cold today in ${locationLabel}. Warm drinks are highly relevant for walk-ins.`;
  }, [locationLabel]);

  return (
    <div className="rounded-2xl relative overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-600 p-5 text-white shadow-sm mb-4">
      <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-30 pointer-events-none">
        <svg width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.5 19a5.5 5.5 0 0 0-1-10.9A7 7 0 0 0 3.5 12.5 5.5 5.5 0 0 0 9 18z"/>
        </svg>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-blue-50">{locationLabel}</div>
          <div className="text-xs text-blue-100">{currentTime}</div>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <div className="text-4xl font-light tracking-tighter">11°</div>
          <div className="text-blue-100 flex flex-col justify-center">
            <span className="text-sm font-semibold leading-none">Overcast</span>
            <span className="text-xs mt-1">H:13° L:7°</span>
          </div>
        </div>
        <div className="mt-4 text-xs bg-white/20 backdrop-blur-md rounded-lg p-2.5 text-blue-50 border border-white/20 shadow-inner">
          {insight}
        </div>
      </div>
    </div>
  );
}

function formatLocationLabel(address: string): string {
  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return "Your current city";

  // 70173 Stuttgart -> Stuttgart
  const postalAndCity = parts.find((part) => /\b\d{4,6}\b/.test(part));
  if (postalAndCity) {
    const city = postalAndCity.replace(/\b\d{4,6}\b/g, "").trim();
    if (city) return city.slice(0, 42);
  }

  const postalIndex = parts.findIndex((part) => /\b\d{4,6}\b/.test(part));
  if (postalIndex >= 2) {
    const candidate = parts[postalIndex - 2];
    if (candidate && !/^[A-Z]$/.test(candidate)) return candidate.slice(0, 42);
  }

  if (parts.length >= 2) {
    return parts[parts.length - 2].slice(0, 42);
  }

  return parts[0].slice(0, 42);
}

function formatCurrentTime(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}