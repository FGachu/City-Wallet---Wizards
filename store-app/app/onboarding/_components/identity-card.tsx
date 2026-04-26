"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, MapPin, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { setCurrentVenueSnapshot } from "@/lib/current-venue";

const inputCls =
  "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500";

type Suggestion = {
  placeId: string;
  mainText: string;
  secondaryText: string;
  prediction: google.maps.places.PlacePrediction;
};

let mapsBootstrap: Promise<void> | null = null;

function bootstrapGoogleMaps(apiKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("ssr"));
  const w = window as unknown as {
    google?: { maps?: { importLibrary?: unknown } };
  };
  if (w.google?.maps?.importLibrary) return Promise.resolve();
  if (mapsBootstrap) return mapsBootstrap;

  mapsBootstrap = new Promise<void>((resolve, reject) => {
    const params = new URLSearchParams({
      key: apiKey,
      v: "weekly",
      loading: "async",
    });
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      mapsBootstrap = null;
      reject(new Error("Failed to load Google Maps"));
    };
    document.head.appendChild(script);
  });

  return mapsBootstrap;
}

export function IdentityCard({
  name,
  setName,
  address,
  setAddress,
}: {
  name: string;
  setName: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLocating, setIsLocating] = useState(false);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [locationInfo, setLocationInfo] = useState<{
    latitude: number;
    longitude: number;
    updatedAt: number;
  } | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const debounceRef = useRef<number | null>(null);
  const skipFetchRef = useRef(false);
  const watchIdRef = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);


  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;
    let cancelled = false;
    bootstrapGoogleMaps(apiKey)
      .then(() => {
        if (!cancelled) setIsLoaded(true);
      })
      .catch((e) => console.error("Google Maps load failed", e));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (skipFetchRef.current) {
      skipFetchRef.current = false;
      return;
    }
    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    if (!isLoaded || !address.trim() || address.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = window.setTimeout(async () => {
      try {
        const places = (await google.maps.importLibrary(
          "places",
        )) as google.maps.PlacesLibrary;

        if (!sessionTokenRef.current) {
          sessionTokenRef.current = new places.AutocompleteSessionToken();
        }

        const { suggestions: results } =
          await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: address,
            sessionToken: sessionTokenRef.current,
          });

        const mapped: Suggestion[] = results
          .filter((s) => s.placePrediction)
          .map((s) => {
            const p = s.placePrediction!;
            return {
              placeId: p.placeId,
              mainText: p.mainText?.text ?? p.text?.text ?? "",
              secondaryText: p.secondaryText?.text ?? "",
              prediction: p,
            };
          });

        setSuggestions(mapped);
        setActiveIndex(-1);
        setIsOpen(mapped.length > 0);
      } catch (e) {
        console.error("Autocomplete error", e);
        setSuggestions([]);
      }
    }, 200);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [address, isLoaded]);

  const selectSuggestion = async (s: Suggestion) => {
    try {
      const place = s.prediction.toPlace();
      await place.fetchFields({ fields: ["formattedAddress"] });
      const formatted =
        place.formattedAddress ||
        [s.mainText, s.secondaryText].filter(Boolean).join(", ");
      skipFetchRef.current = true;
      setAddress(formatted);
      setIsOpen(false);
      setSuggestions([]);
      sessionTokenRef.current = null;
    } catch (e) {
      console.error(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const syncAddressFromCoordinates = async (
    latitude: number,
    longitude: number,
  ) => {
    try {
      const response = await fetch(
        `/api/location/reverse?lat=${latitude}&lng=${longitude}`,
        { cache: "no-store" },
      );
      const data = (await response.json()) as {
        address?: string | null;
        nearestRestaurantName?: string | null;
      };
      skipFetchRef.current = true;
      const resolvedAddress =
        data.address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      setAddress(resolvedAddress);
      const resolvedName = data.nearestRestaurantName?.trim() || name.trim();
      if (data.nearestRestaurantName) {
        setName(data.nearestRestaurantName);
      }
      setCurrentVenueSnapshot(resolvedName, resolvedAddress);
    } catch {
      skipFetchRef.current = true;
      const fallbackAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      setAddress(fallbackAddress);
      setCurrentVenueSnapshot(name, fallbackAddress);
    }
  };

  const handleLiveLocation = () => {
    if (!("geolocation" in navigator)) return;

    if (isLiveTracking && watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsLiveTracking(false);
      return;
    }

    setIsLocating(true);
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocationInfo({
          latitude,
          longitude,
          updatedAt: Date.now(),
        });
        setIsLiveTracking(true);
        await syncAddressFromCoordinates(latitude, longitude);
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting live location", error);
        setIsLocating(false);
        setIsLiveTracking(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 2000,
        timeout: 10000,
      },
    );

    watchIdRef.current = watchId;
  };

  return (
    <section className="rounded-2xl border border-ink-200 bg-white p-5 lg:p-6">
      <div className="flex items-start gap-3 mb-4">
        <span className="size-8 rounded-lg bg-ink-100 grid place-items-center shrink-0">
          <Building2 className="size-4 text-ink-700" />
        </span>
        <div>
          <h2 className="text-base font-semibold">Your venue</h2>
          <p className="text-xs text-ink-500 mt-0.5 leading-relaxed">
            We use the address to match the Handelsregister and find quiet
            windows nearby.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.4fr] gap-3">
        <label className="block">
          <div className="text-[11px] uppercase tracking-wider text-ink-500 mb-1">
            Restaurant name
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Café Müller"
            className={inputCls}
          />
        </label>

        <div className="block relative" ref={wrapperRef}>
          <div className="text-[11px] uppercase tracking-wider text-ink-500 mb-1 flex justify-between">
            <span>Address</span>
            <button
              onClick={handleLiveLocation}
              disabled={isLocating}
              type="button"
              className="text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors font-medium"
            >
              <Navigation
                className={cn("size-3", (isLocating || isLiveTracking) && "animate-pulse")}
              />
              {isLocating
                ? "Locating..."
                : isLiveTracking
                  ? "Stop Live Location"
                  : "Use Live Location"}
            </button>
          </div>
          <div className="relative">
            <MapPin className="size-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onFocus={() => suggestions.length > 0 && setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Königstraße 12, 70173 Stuttgart"
              className={cn(inputCls, "pl-9")}
              autoComplete="off"
              role="combobox"
              aria-expanded={isOpen}
              aria-autocomplete="list"
            />
            {locationInfo && (
              <p className="mt-2 text-[11px] text-ink-500">
                Live: {locationInfo.latitude.toFixed(6)},{" "}
                {locationInfo.longitude.toFixed(6)} · Updated{" "}
                {new Date(locationInfo.updatedAt).toLocaleTimeString()}
              </p>
            )}
            {isOpen && suggestions.length > 0 && (
              <ul
                role="listbox"
                className="absolute z-20 mt-1 left-0 right-0 max-h-72 overflow-auto rounded-lg border border-ink-200 bg-white py-1 shadow-lg shadow-ink-900/5"
              >
                {suggestions.map((s, i) => (
                  <li key={s.placeId} role="option" aria-selected={i === activeIndex}>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectSuggestion(s);
                      }}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={cn(
                        "w-full text-left flex items-start gap-2.5 px-3 py-2 transition-colors",
                        i === activeIndex ? "bg-brand-50" : "hover:bg-ink-50",
                      )}
                    >
                      <MapPin className="size-3.5 text-ink-400 mt-0.5 shrink-0" />
                      <span className="text-sm leading-tight">
                        <span className="font-medium text-ink-800">{s.mainText}</span>
                        {s.secondaryText && (
                          <span className="ml-1.5 text-ink-500">{s.secondaryText}</span>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
