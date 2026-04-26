"use client";

import { useEffect, useState } from "react";
import { CloudOff, Loader2, MapPin, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatLocalDateTimeLabel } from "@/lib/runtime-context";
import { useConsoleStore } from "@/store/useConsoleStore";

const WEATHER_POLL_MS = 5 * 60 * 1000;

export function LiveContextBar() {
  const [nowLabel, setNowLabel] = useState(() => formatLocalDateTimeLabel());
  const location = useConsoleStore((s) => s.sharedMemory.location);
  const liveWeather = useConsoleStore((s) => s.liveWeather);
  const fetchLiveWeather = useConsoleStore((s) => s.fetchLiveWeather);

  useEffect(() => {
    const id = window.setInterval(() => setNowLabel(formatLocalDateTimeLabel()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    void fetchLiveWeather();
    const id = window.setInterval(() => void fetchLiveWeather(), WEATHER_POLL_MS);
    return () => window.clearInterval(id);
  }, [fetchLiveWeather, location]);

  const weatherLine =
    liveWeather?.ok === true
      ? `${liveWeather.city}: ${Math.round(liveWeather.tempC)}°C (feels ${Math.round(liveWeather.feelsLikeC)}°C), ${liveWeather.description}`
      : liveWeather?.ok === false
        ? liveWeather.reason === "missing_key"
          ? "Weather: add OPENWEATHERMAP_API_KEY to .env.local for live data."
          : `Weather unavailable (${liveWeather.message ?? liveWeather.reason}).`
        : "Weather: loading…";

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-muted/50 px-4 py-3 text-sm md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          Live context
        </div>
        <p className="truncate font-mono text-xs text-foreground/90 md:text-sm" title={nowLabel}>
          {nowLabel}
        </p>
        <p className="text-xs leading-snug text-muted-foreground md:text-sm">{weatherLine}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {!liveWeather && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden />}
        {liveWeather?.ok === false && liveWeather.reason !== "missing_key" ? (
          <CloudOff className="h-4 w-4 text-muted-foreground" aria-hidden />
        ) : null}
        <Button type="button" variant="outline" size="sm" className="h-8" onClick={() => void fetchLiveWeather()}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Refresh weather
        </Button>
      </div>
    </div>
  );
}
