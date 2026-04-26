"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Coords, Marker, MarkerColor } from "./types";

type Props = {
  center: Coords;
  zoom?: number;
  radiusKm?: number;
  markers: Marker[];
  onMapClick?: (lat: number, lon: number) => void;
  onMarkerClick?: (markerId: string) => void;
};

declare global {
  interface Window {
    google?: typeof google;
    __mapsScriptPromise?: Promise<void>;
  }
}

const COLOR_HEX: Record<MarkerColor, string> = {
  blue: "#2563eb",
  green: "#16a34a",
  orange: "#ea580c",
  red: "#dc2626",
  purple: "#9333ea",
  gray: "#64748b",
};

function loadMapsScript(apiKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no-window"));
  if (window.google?.maps) return Promise.resolve();
  if (window.__mapsScriptPromise) return window.__mapsScriptPromise;

  window.__mapsScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-maps]");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("maps-load-error")));
      return;
    }
    const script = document.createElement("script");
    script.dataset.maps = "1";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("maps-load-error"));
    document.head.appendChild(script);
  });
  return window.__mapsScriptPromise;
}

function pinSvg(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="38" viewBox="0 0 28 38"><path d="M14 0C6.27 0 0 6.27 0 14c0 9.5 14 24 14 24s14-14.5 14-24C28 6.27 21.73 0 14 0z" fill="${color}" stroke="white" stroke-width="2"/><circle cx="14" cy="14" r="5" fill="white"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function centerPinSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="9" fill="#0f172a" stroke="white" stroke-width="3"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function MapView({ center, zoom = 15, radiusKm, markers, onMapClick, onMarkerClick }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const centerMarkerRef = useRef<google.maps.Marker | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);
  const markerObjsRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/internal/maps-key")
      .then((r) => r.json())
      .then((data: { apiKey?: string; error?: string }) => {
        if (!data.apiKey) throw new Error(data.error ?? "missing-key");
        return loadMapsScript(data.apiKey);
      })
      .then(() => {
        if (cancelled || !containerRef.current || !window.google) return;
        mapRef.current = new window.google.maps.Map(containerRef.current, {
          center: { lat: center.lat, lng: center.lon },
          zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
        });
        infoWindowRef.current = new window.google.maps.InfoWindow();
        if (onMapClick) {
          mapRef.current.addListener("click", (e: google.maps.MapMouseEvent) => {
            const ll = e.latLng;
            if (!ll) return;
            onMapClick(ll.lat(), ll.lng());
          });
        }
        setStatus("ready");
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status !== "ready" || !mapRef.current || !window.google) return;
    const pos = { lat: center.lat, lng: center.lon };
    mapRef.current.panTo(pos);
    if (!centerMarkerRef.current) {
      centerMarkerRef.current = new window.google.maps.Marker({
        position: pos,
        map: mapRef.current,
        icon: {
          url: centerPinSvg(),
          anchor: new window.google.maps.Point(11, 11),
        },
        zIndex: 9999,
      });
    } else {
      centerMarkerRef.current.setPosition(pos);
    }
  }, [center.lat, center.lon, status]);

  useEffect(() => {
    if (status !== "ready" || !mapRef.current || !window.google) return;
    if (!radiusKm || radiusKm <= 0) {
      circleRef.current?.setMap(null);
      circleRef.current = null;
      return;
    }
    if (!circleRef.current) {
      circleRef.current = new window.google.maps.Circle({
        map: mapRef.current,
        center: { lat: center.lat, lng: center.lon },
        radius: radiusKm * 1000,
        strokeColor: "#2563eb",
        strokeOpacity: 0.7,
        strokeWeight: 1.5,
        fillColor: "#2563eb",
        fillOpacity: 0.06,
        clickable: false,
      });
    } else {
      circleRef.current.setCenter({ lat: center.lat, lng: center.lon });
      circleRef.current.setRadius(radiusKm * 1000);
    }
  }, [center.lat, center.lon, radiusKm, status]);

  useEffect(() => {
    if (status !== "ready" || !mapRef.current || !window.google) return;
    for (const m of markerObjsRef.current) m.setMap(null);
    markerObjsRef.current = [];
    for (const item of markers) {
      const marker = new window.google.maps.Marker({
        position: { lat: item.lat, lng: item.lon },
        map: mapRef.current,
        title: item.label,
        icon: {
          url: pinSvg(COLOR_HEX[item.color]),
          anchor: new window.google.maps.Point(14, 38),
        },
      });
      marker.addListener("click", () => {
        if (infoWindowRef.current && mapRef.current) {
          const subtitle = item.subtitle ? `<div style="font-size:11px;color:#475569">${item.subtitle}</div>` : "";
          infoWindowRef.current.setContent(
            `<div style="font:13px system-ui;min-width:120px"><strong>${item.label}</strong>${subtitle}</div>`,
          );
          infoWindowRef.current.open({ anchor: marker, map: mapRef.current });
        }
        onMarkerClick?.(item.id);
      });
      markerObjsRef.current.push(marker);
    }
  }, [markers, status, onMarkerClick]);

  const fallback = useMemo(() => {
    if (status === "loading") return <div className="text-sm text-zinc-500">Loading map…</div>;
    if (status === "error")
      return (
        <div className="text-sm text-red-600">
          Failed to load Google Maps: {error}
          <div className="text-xs text-zinc-500 mt-1">
            Check <code>GOOGLE_MAPS_API_KEY</code> in <code>.env.local</code>.
          </div>
        </div>
      );
    return null;
  }, [status, error]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full rounded-lg" />
      {fallback ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/60 backdrop-blur-sm rounded-lg">
          {fallback}
        </div>
      ) : null}
    </div>
  );
}
