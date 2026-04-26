"use client";

import { useState, useEffect } from "react";
import { Sparkles, Check } from "lucide-react";
import { getCurrentVenueName } from "@/lib/current-venue";

export default function GenerativeNotification() {
  const [notification, setNotification] = useState<{
    message: string;
    suggestedProduct: string;
    suggestedDiscount: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [cafeName, setCafeName] = useState<string>("your nearby cafe");

  useEffect(() => {
    async function fetchNotification() {
      let resolvedCafeName = "your nearby cafe";
      try {
        const currentVenueName = getCurrentVenueName();
        if (currentVenueName) {
          resolvedCafeName = currentVenueName;
          setCafeName(currentVenueName);
        }

        const settingsRes = await fetch("/api/settings", { cache: "no-store" });
        if (settingsRes.ok) {
          const settings = (await settingsRes.json()) as { venueName?: string };
          if (!currentVenueName && settings.venueName?.trim()) {
            resolvedCafeName = settings.venueName.trim();
            setCafeName(resolvedCafeName);
          }
        }

        // Fetch from the local context engine which talks to Gemini
        // We use port 3001 for app-services as defined in its package.json dev script
        // Note: For CORS to work properly during local development without setup, 
        // we use a relative path if they were merged, but since they are separate ports
        // we need to make sure the endpoint is accessible. 
        // Since we are running this on the client-side of port 3000, we need to fetch the 
        // absolute URL.
        const res = await fetch("http://127.0.0.1:3001/api/assistant", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            weather: {
              temperature: { current: 11 },
              conditions: { description: "Overcast" }
            },
            demandLevel: "bring",
            maxDiscount: 20,
            products: [{ name: "Hot Chocolate" }]
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to fetch notification");
        }

        const data = await res.json();
        setNotification(data);
      } catch (err) {
        console.error("Using fallback notification due to error or missing API key:", err);
        // Fallback for hackathon demo if no API key is set
        setNotification({
          message: `It's cold and overcast outside near ${resolvedCafeName}, and foot traffic is low. Suggesting a 15% 'Rainy Day' discount on Hot Chocolate to boost volume.`,
          suggestedProduct: "Hot Chocolate",
          suggestedDiscount: 15,
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchNotification();
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 mb-6 animate-pulse">
        <div className="flex items-center gap-2 text-brand-600 mb-2">
          <Sparkles className="size-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">City Wallet AI Assistant</span>
        </div>
        <div className="h-4 bg-brand-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-brand-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 mb-6 transition-all duration-500">
        <div className="flex items-center gap-2 text-emerald-700 mb-2">
          <Check className="size-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Offer Activated</span>
        </div>
        <p className="text-sm text-emerald-900">
          Your dynamically generated offer for {notification?.suggestedDiscount}% off {notification?.suggestedProduct} at {cafeName} is now live and being distributed to matching users nearby.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50 to-brand-100/50 p-5 mb-6 shadow-sm relative overflow-hidden group">
      <div className="absolute -right-10 -top-10 opacity-10 group-hover:opacity-20 transition-opacity">
        <Sparkles className="w-40 h-40 text-brand-600" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-brand-600 mb-3">
          <Sparkles className="size-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Proactive Suggestion</span>
        </div>
        
        <p className="text-sm font-medium text-brand-950 mb-5 leading-relaxed max-w-2xl">
          "{notification?.message}"
        </p>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setAccepted(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
          >
            Accept & Deploy
          </button>
          <div className="text-xs text-brand-700/70 flex items-center gap-2 bg-white/50 px-3 py-2 rounded-lg border border-brand-200/50">
            <span className="font-semibold text-brand-900">{cafeName}</span>
            <span>·</span>
            <span className="font-semibold text-brand-900">{notification?.suggestedProduct}</span>
            <span>·</span>
            <span className="font-semibold text-emerald-600">{notification?.suggestedDiscount}% off</span>
          </div>
        </div>
      </div>
    </div>
  );
}