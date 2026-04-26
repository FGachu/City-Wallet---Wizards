"use client";

import { useCallback, useMemo, useState } from "react";
import { ApiPanel } from "./ApiPanel";
import { MapView } from "./MapView";
import { ResponsePanel } from "./ResponsePanel";
import type { ApiId, ApiResult, Coords, Marker, MarkerColor } from "./types";

const PRESETS: { id: string; label: string; coords: Coords; zoom: number }[] = [
  { id: "dresden", label: "Dresden", coords: { lat: 51.0504, lon: 13.7373 }, zoom: 15 },
  { id: "stuttgart", label: "Stuttgart", coords: { lat: 48.7758, lon: 9.1829 }, zoom: 15 },
  { id: "berlin", label: "Berlin", coords: { lat: 52.52, lon: 13.405 }, zoom: 13 },
  { id: "munich", label: "Munich", coords: { lat: 48.1372, lon: 11.5755 }, zoom: 13 },
];

export function PlaygroundClient() {
  const [coords, setCoords] = useState<Coords>(PRESETS[0].coords);
  const [zoom, setZoom] = useState<number>(PRESETS[0].zoom);
  const [radiusKm, setRadiusKm] = useState<number>(0.5);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [activeApi, setActiveApi] = useState<ApiId | null>(null);
  const [lastResult, setLastResult] = useState<ApiResult | null>(null);

  const handleResult = useCallback((apiId: ApiId, result: ApiResult) => {
    setActiveApi(apiId);
    setLastResult(result);
    setMarkers(extractMarkers(apiId, result));
  }, []);

  const stats = useMemo(() => {
    const byColor = markers.reduce<Record<MarkerColor, number>>(
      (acc, m) => {
        acc[m.color] = (acc[m.color] ?? 0) + 1;
        return acc;
      },
      { blue: 0, green: 0, orange: 0, red: 0, purple: 0, gray: 0 },
    );
    return byColor;
  }, [markers]);

  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100">
      <header className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div>
          <h1 className="text-base font-semibold tracking-tight">City Wallet · API Playground</h1>
          <p className="text-[11px] text-zinc-500">Click on the map to move the center. Each API is tested against those coords.</p>
        </div>
        <div className="flex gap-1 ml-auto">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setCoords(p.coords);
                setZoom(p.zoom);
              }}
              className="text-xs px-2.5 py-1 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 font-mono ml-2">
          <span>{coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}</span>
          <label className="flex items-center gap-1.5">
            radius
            <input
              type="number"
              step="0.1"
              min="0"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-16 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-1.5 py-0.5 text-xs"
            />
            km
          </label>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative bg-zinc-100 dark:bg-zinc-900 min-w-0">
          <MapView
            center={coords}
            zoom={zoom}
            radiusKm={radiusKm}
            markers={markers}
            onMapClick={(lat, lon) => setCoords({ lat, lon })}
          />
          <Legend stats={stats} activeApi={activeApi} markerCount={markers.length} />
        </div>
        <aside className="w-[340px] flex-shrink-0 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden flex flex-col">
          <ApiPanel coords={coords} onCoordsChange={setCoords} onResult={handleResult} />
        </aside>
        <aside className="w-[480px] flex-shrink-0 border-l border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <ResponsePanel result={lastResult} apiId={activeApi} />
        </aside>
      </div>
    </div>
  );
}

function Legend({
  stats,
  activeApi,
  markerCount,
}: {
  stats: Record<MarkerColor, number>;
  activeApi: ApiId | null;
  markerCount: number;
}) {
  if (!activeApi || markerCount === 0) return null;
  const items = (
    [
      { color: "blue", label: "Places (Google)", count: stats.blue },
      { color: "green", label: "Merchants OK", count: stats.green },
      { color: "red", label: "Quiet merchants", count: stats.red },
      { color: "orange", label: "Events", count: stats.orange },
      { color: "purple", label: "Selection", count: stats.purple },
    ] as { color: MarkerColor; label: string; count: number }[]
  ).filter((i) => i.count > 0);
  if (!items.length) return null;
  return (
    <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-zinc-950/95 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm px-3 py-2 text-xs space-y-1">
      <div className="font-semibold text-zinc-500 uppercase tracking-wide text-[10px]">{activeApi}</div>
      {items.map((i) => (
        <div key={i.color} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLOR_HEX[i.color] }} />
          <span>{i.label}</span>
          <span className="ml-auto font-mono text-zinc-500">{i.count}</span>
        </div>
      ))}
    </div>
  );
}

const COLOR_HEX: Record<MarkerColor, string> = {
  blue: "#2563eb",
  green: "#16a34a",
  orange: "#ea580c",
  red: "#dc2626",
  purple: "#9333ea",
  gray: "#64748b",
};

function extractMarkers(apiId: ApiId, result: ApiResult): Marker[] {
  if (!result.ok) return [];
  const body = result.body as Record<string, unknown>;
  if (!body || typeof body !== "object") return [];

  switch (apiId) {
    case "places": {
      const places = (body.places ?? []) as Array<{
        id: string;
        name: string;
        location?: { lat: number; lon: number } | null;
        primaryTypeLabel?: string | null;
      }>;
      return places
        .filter((p) => p.location)
        .map((p) => ({
          id: p.id,
          lat: p.location!.lat,
          lon: p.location!.lon,
          label: p.name,
          color: "blue" as const,
          subtitle: p.primaryTypeLabel ?? undefined,
        }));
    }
    case "placeDetails": {
      const place = body.place as
        | { id: string; name: string; location?: { lat: number; lon: number } | null; primaryTypeLabel?: string | null }
        | undefined;
      if (!place?.location) return [];
      return [
        {
          id: place.id,
          lat: place.location.lat,
          lon: place.location.lon,
          label: place.name,
          color: "purple" as const,
          subtitle: place.primaryTypeLabel ?? undefined,
        },
      ];
    }
    case "events": {
      const events = (body.events ?? []) as Array<{
        id: string;
        name: string;
        venue?: { name?: string | null; lat?: number | null; lon?: number | null } | null;
      }>;
      return events
        .filter((e) => e.venue?.lat != null && e.venue?.lon != null)
        .map((e) => ({
          id: e.id,
          lat: e.venue!.lat as number,
          lon: e.venue!.lon as number,
          label: e.name,
          color: "orange" as const,
          subtitle: e.venue?.name ?? undefined,
        }));
    }
    case "merchantsNearby": {
      const merchants = (body.merchants ?? []) as Array<{
        id: string;
        name: string;
        category: string;
        location: { lat: number; lon: number };
        distanceKm: number;
      }>;
      return merchants.map((m) => ({
        id: m.id,
        lat: m.location.lat,
        lon: m.location.lon,
        label: m.name,
        color: "green" as const,
        subtitle: `${m.category} · ${m.distanceKm} km`,
      }));
    }
    case "merchantById": {
      const m = body.merchant as
        | { id: string; name: string; location: { lat: number; lon: number }; category: string }
        | undefined;
      if (!m) return [];
      return [
        {
          id: m.id,
          lat: m.location.lat,
          lon: m.location.lon,
          label: m.name,
          color: "purple" as const,
          subtitle: m.category,
        },
      ];
    }
    case "density": {
      const merchants = (body.merchants ?? []) as Array<{
        id: string;
        name: string;
        location: { lat: number; lon: number };
        isQuiet: boolean;
        quietScore: number;
        actualTx: number;
        expectedTx: number;
      }>;
      return merchants.map((m) => ({
        id: m.id,
        lat: m.location.lat,
        lon: m.location.lon,
        label: m.name,
        color: (m.isQuiet ? "red" : "green") as MarkerColor,
        subtitle: `actual ${m.actualTx} / expected ${m.expectedTx} (q=${m.quietScore})`,
      }));
    }
    case "weather": {
      const loc = body.location as { lat: number; lon: number; name: string } | undefined;
      const t = body.temperature as { current: number } | undefined;
      const c = body.conditions as { description: string } | undefined;
      if (!loc) return [];
      return [
        {
          id: "weather",
          lat: loc.lat,
          lon: loc.lon,
          label: `${loc.name}: ${t?.current ?? "?"}°C`,
          color: "purple" as const,
          subtitle: c?.description,
        },
      ];
    }
    default:
      return [];
  }
}
