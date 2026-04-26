"use client";

import { useEffect, useState } from "react";
import { MapPin, Sparkles, Navigation, Clock, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ConsumerLockScreen() {
  const [time, setTime] = useState("");
  const [offer, setOffer] = useState<string | null>(null);
  const [context, setContext] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "locating" | "analyzing" | "ready" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Clock tick
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const triggerLiveOffer = async () => {
    setStatus("locating");
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation not supported");
      setStatus("error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setStatus("analyzing");
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        try {
          // 1. Fetch live contextual data
          const [placesRes, eventsRes, weatherRes] = await Promise.all([
            fetch(`/api/live-places?lat=${lat}&lon=${lon}`).catch(() => null),
            fetch(`/api/live-events?lat=${lat}&lon=${lon}`).catch(() => null),
            fetch(`/api/live-weather?lat=${lat}&lon=${lon}`).catch(() => null)
          ]);

          const placesData = placesRes?.ok ? await placesRes.json() : null;
          const eventsData = eventsRes?.ok ? await eventsRes.json() : null;
          const weatherData = weatherRes?.ok ? await weatherRes.json() : null;

          const nearbyMerchants = placesData?.places?.slice(0, 10).map((p: any) => p.name) || ["Local Cafe"];
          const nearbyEvents = eventsData?.events?.map((e: any) => `${e.name} (${e.category}) at ${e.venueName}`) || [];

          // 2. Build Memory and Grounding
          const memory = {
            weather: weatherData?.description || "rainy",
            location: weatherData?.city || "Current Location",
            merchantTraffic: "low",
            userIntent: "hungry",
            userName: "Alex",
            mood: "hungry",
            time: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" })
          };

          const inputJson = { nearbyMerchants, nearbyEvents };

          // 3. Run Context Agent
          const ctxRes = await fetch("/api/run-agent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              agent: "context-agent",
              input: inputJson,
              sharedMemory: memory
            })
          });
          const ctxData = await ctxRes.json();
          setContext(ctxData.output || "Analyzed local footfall and events.");

          // 4. Run Offer Generator Agent
          const offRes = await fetch("/api/run-agent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              agent: "offer-generator-agent",
              input: inputJson,
              sharedMemory: memory
            })
          });
          const offData = await offRes.json();
          setOffer(offData.output || "15% off at nearby merchants.");
          
          setStatus("ready");
        } catch (err) {
          setErrorMsg("Failed to generate live offer");
          setStatus("error");
        }
      },
      (err) => {
        setErrorMsg("Location access denied. Please enable location.");
        setStatus("error");
      }
    );
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-zinc-950 font-sans selection:bg-primary/30">
      {/* Dynamic Background Blur / Gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-1/4 -left-1/4 w-[150vw] h-[150vh] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-zinc-950/90 to-zinc-950/100 blur-3xl animate-pulse duration-10000"></div>
        {status === "ready" && (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-blue-600/10 opacity-50 transition-opacity duration-1000"></div>
        )}
      </div>

      {/* Lock Screen UI */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full p-8 pt-24 pb-12">
        {/* Clock */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 text-zinc-400 mb-2 font-medium">
            <MapPin className="w-4 h-4" />
            <span>City Wallet Live</span>
          </div>
          <h1 className="text-8xl font-light text-zinc-100 tracking-tighter tabular-nums drop-shadow-md">
            {time.split(" ")[0]}
          </h1>
        </div>

        {/* Live Activity Widget Container */}
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center items-center">
          
          {status === "idle" && (
            <button
              onClick={triggerLiveOffer}
              className="group relative inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all duration-300 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 backdrop-blur-md overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></div>
              <Navigation className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
              <span className="relative">Simulate Live Location</span>
            </button>
          )}

          {status === "locating" && (
            <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in duration-500">
              <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-zinc-400 font-medium">Acquiring GPS Signal...</p>
            </div>
          )}

          {status === "analyzing" && (
            <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in duration-500">
              <Sparkles className="w-12 h-12 text-blue-400 animate-pulse" />
              <p className="text-blue-300/80 font-medium tracking-wide">AI analyzing local demand spikes...</p>
            </div>
          )}

          {status === "error" && (
            <div className="p-6 bg-red-950/40 border border-red-500/30 rounded-3xl backdrop-blur-xl text-center">
              <p className="text-red-400 font-medium mb-4">{errorMsg}</p>
              <button
                onClick={() => setStatus("idle")}
                className="px-6 py-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {status === "ready" && (
            <div className="w-full animate-in slide-in-from-bottom-8 fade-in duration-700 spring-bounce">
              {/* iOS Live Activity Style Widget */}
              <div className="relative overflow-hidden bg-black/40 border border-white/10 backdrop-blur-2xl rounded-[32px] p-6 shadow-2xl ring-1 ring-white/5">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-blue-400">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">City Wallet Offer</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="flex w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <span className="text-xs text-zinc-500 font-medium uppercase">Live</span>
                  </div>
                </div>

                {/* Offer Content */}
                <h2 className="text-2xl font-semibold text-white leading-tight mb-2">
                  {offer?.split(":")[0]}:
                </h2>
                <p className="text-lg text-zinc-200 mb-6 leading-relaxed">
                  {offer?.split(":").slice(1).join(":") || offer}
                </p>

                {/* Context Subtext */}
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-start space-x-3">
                    <Bell className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {context?.substring(0, 150)}...
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <button className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-full transition-colors shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                  Slide to Claim & Pay
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Home Indicator */}
        <div className="w-1/3 h-1.5 bg-white/20 rounded-full"></div>
      </div>
    </div>
  );
}
