"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, Navigation, RotateCcw, Save } from "lucide-react";
import {
  defaultMerchantSettings,
  type MerchantSettings,
} from "@/lib/merchant-settings";
import { setCurrentVenueSnapshot } from "@/lib/current-venue";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function SettingsPage() {
  const [settings, setSettings] = useState<MerchantSettings>(defaultMerchantSettings);
  const [initialSettings, setInitialSettings] =
    useState<MerchantSettings>(defaultMerchantSettings);
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isLocating, setIsLocating] = useState(false);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [locationInfo, setLocationInfo] = useState<{
    latitude: number;
    longitude: number;
    updatedAt: number;
  } | null>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/settings", { cache: "no-store" });
        if (!response.ok) throw new Error("Could not load settings");
        const data = (await response.json()) as MerchantSettings;
        setSettings(data);
        setInitialSettings(data);
      } finally {
        setLoaded(true);
      }
    };

    load();
  }, []);

  const dirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(initialSettings),
    [settings, initialSettings]
  );

  const update = <K extends keyof MerchantSettings>(
    key: K,
    value: MerchantSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaveStatus("idle");
  };

  const save = async () => {
    setSaveStatus("saving");
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error("Failed to save");
      const saved = (await response.json()) as MerchantSettings;
      setSettings(saved);
      setInitialSettings(saved);
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  };

  const reset = () => {
    setSettings(initialSettings);
    setSaveStatus("idle");
  };

  const updateLocationAddress = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `/api/location/reverse?lat=${latitude}&lng=${longitude}`,
        { cache: "no-store" }
      );
      const data = (await response.json()) as {
        address?: string | null;
        nearestRestaurantName?: string | null;
      };
      update(
        "address",
        data.address ?? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
      );
      if (data.nearestRestaurantName) {
        update("venueName", data.nearestRestaurantName);
        setCurrentVenueSnapshot(
          data.nearestRestaurantName,
          data.address ?? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        );
      } else {
        setCurrentVenueSnapshot(
          settings.venueName,
          data.address ?? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        );
      }
    } catch {
      const fallbackAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      update("address", fallbackAddress);
      setCurrentVenueSnapshot(settings.venueName, fallbackAddress);
    }
  };

  const stopLocationTracking = () => {
    if (watchIdRef.current === null) return;
    navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
    setIsLiveTracking(false);
  };

  const toggleLiveLocation = () => {
    if (!("geolocation" in navigator)) return;

    if (isLiveTracking) {
      stopLocationTracking();
      return;
    }

    setIsLocating(true);
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocationInfo({ latitude, longitude, updatedAt: Date.now() });
        setIsLiveTracking(true);
        setIsLocating(false);
        await updateLocationAddress(latitude, longitude);
      },
      () => {
        setIsLocating(false);
        setIsLiveTracking(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 2000 }
    );

    watchIdRef.current = watchId;
  };

  useEffect(() => {
    return () => stopLocationTracking();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-ink-500 mt-1">
          Manage merchant profile, payout details, integration IDs, and privacy
          controls.
        </p>
      </div>

      {!loaded ? (
        <div className="rounded-2xl border border-ink-200 bg-white p-6 text-sm text-ink-500">
          Loading settings...
        </div>
      ) : (
        <>
          <section className="rounded-2xl border border-ink-200 bg-white p-6 space-y-4">
            <h2 className="font-semibold">Store profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Venue name"
                value={settings.venueName}
                onChange={(value) => update("venueName", value)}
              />
              <Field
                label="Address"
                value={settings.address}
                onChange={(value) => update("address", value)}
                action={
                  <button
                    type="button"
                    onClick={toggleLiveLocation}
                    disabled={isLocating}
                    className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 disabled:opacity-60"
                  >
                    <Navigation
                      className={
                        "size-3 " + (isLocating || isLiveTracking ? "animate-pulse" : "")
                      }
                    />
                    {isLocating
                      ? "Locating..."
                      : isLiveTracking
                        ? "Stop live location"
                        : "Use live location"}
                  </button>
                }
              />
            </div>
            {locationInfo && (
              <p className="text-xs text-ink-500">
                Live coordinates: {locationInfo.latitude.toFixed(6)},{" "}
                {locationInfo.longitude.toFixed(6)} · Updated{" "}
                {new Date(locationInfo.updatedAt).toLocaleTimeString()}
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-ink-200 bg-white p-6 space-y-4">
            <h2 className="font-semibold">Payout and integration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Payout IBAN"
                value={settings.payoutIban}
                onChange={(value) => update("payoutIban", value)}
              />
              <Field
                label="Payone merchant ID"
                value={settings.payoneMerchantId}
                onChange={(value) => update("payoneMerchantId", value)}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-ink-200 bg-white p-6 space-y-4">
            <h2 className="font-semibold">Delivery and privacy</h2>
            <div className="space-y-3">
              <Toggle
                label="Allow push notifications"
                checked={settings.allowPushOffers}
                onChange={(checked) => update("allowPushOffers", checked)}
              />
              <Toggle
                label="Allow SMS fallback"
                checked={settings.allowSmsFallback}
                onChange={(checked) => update("allowSmsFallback", checked)}
              />
            </div>

            <div className="pt-1">
              <div className="text-sm text-ink-700 mb-2">Privacy mode</div>
              <div className="flex gap-2 flex-wrap">
                <ModeButton
                  active={settings.privacyMode === "balanced"}
                  onClick={() => update("privacyMode", "balanced")}
                  label="Balanced"
                />
                <ModeButton
                  active={settings.privacyMode === "strict"}
                  onClick={() => update("privacyMode", "strict")}
                  label="Strict"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-ink-200 bg-white p-5 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-ink-500">
              {saveStatus === "saved" ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="size-4" />
                  Settings saved
                </span>
              ) : saveStatus === "error" ? (
                <span className="text-rose-600">
                  Could not save settings. Please try again.
                </span>
              ) : dirty ? (
                "You have unsaved changes."
              ) : (
                "Everything is up to date."
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={reset}
                disabled={!dirty || saveStatus === "saving"}
                className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-600 disabled:opacity-50"
              >
                <RotateCcw className="size-4" />
                Reset
              </button>
              <button
                type="button"
                onClick={save}
                disabled={!dirty || saveStatus === "saving"}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
              >
                <Save className="size-4" />
                {saveStatus === "saving" ? "Saving..." : "Save changes"}
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  action,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  action?: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center justify-between gap-2 text-xs uppercase tracking-wide text-ink-500">
        <span>{label}</span>
        {action}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-lg border border-ink-200 px-3 text-sm outline-none focus:border-brand-400"
      />
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-ink-200 px-3 py-2.5">
      <span className="text-sm text-ink-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={
          "inline-flex h-6 w-11 items-center rounded-full p-0.5 transition " +
          (checked ? "bg-brand-500 justify-end" : "bg-ink-300 justify-start")
        }
      >
        <span className="size-5 rounded-full bg-white" />
      </button>
    </label>
  );
}

function ModeButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-lg border px-3 py-1.5 text-sm transition " +
        (active
          ? "border-brand-200 bg-brand-50 text-brand-700"
          : "border-ink-200 bg-white text-ink-600 hover:bg-ink-50")
      }
    >
      {label}
    </button>
  );
}
