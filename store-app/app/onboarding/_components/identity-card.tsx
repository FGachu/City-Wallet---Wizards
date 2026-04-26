"use client";

import { useState } from "react";
import { Building2, MapPin, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLoadScript, Autocomplete } from "@react-google-maps/api";

const libraries: "places"[] = ["places"];

const inputCls =
  "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500";

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
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const onLoad = (autoC: google.maps.places.Autocomplete) => setAutocomplete(autoC);
  
  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        setAddress(place.formatted_address);
      }
    }
  };

  const handleLiveLocation = () => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
              const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`);
              const data = await res.json();
              if (data.results && data.results.length > 0) {
                setAddress(data.results[0].formatted_address);
              } else {
                setAddress(`${latitude}, ${longitude}`);
              }
            } else {
              setAddress(`Königstraße 12, 70173 Stuttgart (Simulated Live)`); // Simulation since no key provided
            }
          } catch (e) {
            console.error(e);
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          console.error("Error getting location", error);
          setIsLocating(false);
          // Fallback simulation for hackathon demo if geolocation fails
          setAddress(`Königstraße 12, 70173 Stuttgart (Simulated Live)`); 
        }
      );
    }
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
        
        <div className="block relative">
          <div className="text-[11px] uppercase tracking-wider text-ink-500 mb-1 flex justify-between">
            <span>Address</span>
            <button 
              onClick={handleLiveLocation}
              disabled={isLocating}
              type="button" 
              className="text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors font-medium"
            >
              <Navigation className={cn("size-3", isLocating && "animate-pulse")} />
              {isLocating ? "Locating..." : "Use Live Location"}
            </button>
          </div>
          <div className="relative">
            <MapPin className="size-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
            
            {isLoaded && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
              <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Königstraße 12, 70173 Stuttgart"
                  className={cn(inputCls, "pl-9")}
                />
              </Autocomplete>
            ) : (
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Königstraße 12, 70173 Stuttgart"
                className={cn(inputCls, "pl-9")}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}