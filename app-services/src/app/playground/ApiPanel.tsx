"use client";

import { useMemo, useState } from "react";
import type { ApiId, ApiResult, Coords } from "./types";

type Props = {
  coords: Coords;
  onResult: (apiId: ApiId, result: ApiResult) => void;
  onCoordsChange: (c: Coords) => void;
};

type TabDef = {
  id: ApiId;
  label: string;
  method: string;
  group: "context" | "catalog" | "payone";
  hint: string;
};

const TABS: TabDef[] = [
  { id: "weather", label: "Weather", method: "GET", group: "context", hint: "Current weather at lat/lon (OpenWeather)." },
  { id: "places", label: "Places nearby", method: "GET", group: "context", hint: "Real POIs from Google Places." },
  { id: "placeDetails", label: "Place details", method: "GET", group: "context", hint: "Place detail by ID." },
  { id: "events", label: "Events", method: "GET", group: "context", hint: "Nearby events (Ticketmaster/Eventbrite)." },
  { id: "merchantsNearby", label: "Merchants nearby", method: "GET", group: "catalog", hint: "Registered merchant catalog (5 hardcoded in Stuttgart)." },
  { id: "merchantById", label: "Merchant by ID", method: "GET", group: "catalog", hint: "Full detail + products + rules." },
  { id: "density", label: "Density", method: "GET", group: "payone", hint: "Payone simulator: expected vs actual tx, quietScore, isQuiet." },
  { id: "scenarioGet", label: "Scenario: list", method: "GET", group: "payone", hint: "Active overrides in memory." },
  { id: "scenarioPost", label: "Scenario: set", method: "POST", group: "payone", hint: "Force a multiplier for a merchant (e.g. 0.2 = empty)." },
  { id: "scenarioDelete", label: "Scenario: clear", method: "DELETE", group: "payone", hint: "Clear a merchant override (or all)." },
];

const GROUP_COLORS: Record<TabDef["group"], string> = {
  context: "bg-blue-100 text-blue-700",
  catalog: "bg-emerald-100 text-emerald-700",
  payone: "bg-orange-100 text-orange-700",
};

type FormState = {
  radius: number;
  radiusKm: number;
  windowMinutes: number;
  types: string;
  category: string;
  placeId: string;
  merchantId: string;
  within: string;
  classification: string;
  multiplier: number;
  scenarioMerchantId: string;
};

const INITIAL_FORM: FormState = {
  radius: 500,
  radiusKm: 1,
  windowMinutes: 15,
  types: "cafe,restaurant,bakery,bar",
  category: "",
  placeId: "",
  merchantId: "mer_cafe_mueller",
  within: "5km",
  classification: "",
  multiplier: 0.2,
  scenarioMerchantId: "mer_cafe_mueller",
};

export function ApiPanel({ coords, onResult, onCoordsChange }: Props) {
  const [activeTab, setActiveTab] = useState<ApiId>("density");
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [busy, setBusy] = useState(false);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const tab = useMemo(() => TABS.find((t) => t.id === activeTab)!, [activeTab]);

  const buildRequest = (): { url: string; init: RequestInit } => {
    const { lat, lon } = coords;
    switch (activeTab) {
      case "weather":
        return { url: `/api/weather?lat=${lat}&lon=${lon}`, init: { method: "GET" } };
      case "places": {
        const qs = new URLSearchParams({
          lat: String(lat),
          lon: String(lon),
          radius: String(form.radius),
        });
        if (form.types.trim()) qs.set("types", form.types.trim());
        return { url: `/api/places?${qs.toString()}`, init: { method: "GET" } };
      }
      case "placeDetails":
        return {
          url: `/api/places/details?placeId=${encodeURIComponent(form.placeId)}`,
          init: { method: "GET" },
        };
      case "events": {
        const qs = new URLSearchParams({
          lat: String(lat),
          lon: String(lon),
          within: form.within,
        });
        if (form.classification.trim()) qs.set("classification", form.classification.trim());
        return { url: `/api/events?${qs.toString()}`, init: { method: "GET" } };
      }
      case "merchantsNearby": {
        const qs = new URLSearchParams({
          lat: String(lat),
          lon: String(lon),
          radiusKm: String(form.radiusKm),
        });
        if (form.category) qs.set("category", form.category);
        return { url: `/api/merchants/nearby?${qs.toString()}`, init: { method: "GET" } };
      }
      case "merchantById":
        return {
          url: `/api/merchants/${encodeURIComponent(form.merchantId)}`,
          init: { method: "GET" },
        };
      case "density": {
        const qs = new URLSearchParams({
          lat: String(lat),
          lon: String(lon),
          radiusKm: String(form.radiusKm),
          windowMinutes: String(form.windowMinutes),
        });
        return { url: `/api/transactions/density?${qs.toString()}`, init: { method: "GET" } };
      }
      case "scenarioGet":
        return { url: `/api/transactions/scenario`, init: { method: "GET" } };
      case "scenarioPost":
        return {
          url: `/api/transactions/scenario`,
          init: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              merchantId: form.scenarioMerchantId,
              multiplier: form.multiplier,
            }),
          },
        };
      case "scenarioDelete": {
        const qs = form.scenarioMerchantId
          ? `?merchantId=${encodeURIComponent(form.scenarioMerchantId)}`
          : "";
        return { url: `/api/transactions/scenario${qs}`, init: { method: "DELETE" } };
      }
    }
  };

  const run = async () => {
    setBusy(true);
    const { url, init } = buildRequest();
    const start = performance.now();
    try {
      const res = await fetch(url, init);
      const text = await res.text();
      let body: unknown = text;
      try {
        body = JSON.parse(text);
      } catch {
        // keep raw text
      }
      const result: ApiResult = {
        url,
        method: init.method ?? "GET",
        status: res.status,
        durationMs: Math.round(performance.now() - start),
        ok: res.ok,
        body,
      };
      onResult(activeTab, result);
      if (activeTab === "places" && result.ok) {
        const placesBody = (result.body as { places?: Array<{ id?: string }> } | undefined)?.places;
        if (placesBody?.length && !form.placeId) {
          setField("placeId", placesBody[0].id ?? "");
        }
      }
    } catch (err) {
      const result: ApiResult = {
        url,
        method: init.method ?? "GET",
        status: null,
        durationMs: Math.round(performance.now() - start),
        ok: false,
        body: { error: err instanceof Error ? err.message : String(err) },
      };
      onResult(activeTab, result);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap gap-1.5 border-b border-zinc-200 dark:border-zinc-800 p-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`text-xs px-2.5 py-1 rounded-md font-medium transition ${
              activeTab === t.id
                ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] uppercase tracking-wide font-bold px-1.5 py-0.5 rounded ${GROUP_COLORS[tab.group]}`}>
            {tab.group}
          </span>
          <span className="text-[10px] uppercase tracking-wide font-bold px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {tab.method}
          </span>
          <span className="text-sm font-medium">{tab.label}</span>
        </div>
        <p className="text-xs text-zinc-500">{tab.hint}</p>

        <FormFields
          activeTab={activeTab}
          coords={coords}
          form={form}
          setField={setField}
          onCoordsChange={onCoordsChange}
        />
      </div>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex-shrink-0">
        <button
          onClick={run}
          disabled={busy}
          className="w-full rounded-md bg-zinc-900 text-white text-sm font-medium py-2.5 disabled:opacity-60 dark:bg-white dark:text-black"
        >
          {busy ? "Running…" : `Run ${tab.method}`}
        </button>
      </div>
    </div>
  );
}

function FormFields({
  activeTab,
  coords,
  form,
  setField,
  onCoordsChange,
}: {
  activeTab: ApiId;
  coords: Coords;
  form: FormState;
  setField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  onCoordsChange: (c: Coords) => void;
}) {
  const needsCoords = activeTab !== "placeDetails" && activeTab !== "merchantById" &&
    activeTab !== "scenarioGet" && activeTab !== "scenarioPost" && activeTab !== "scenarioDelete";

  return (
    <div className="space-y-2.5">
      {needsCoords ? (
        <div className="grid grid-cols-2 gap-2">
          <Field label="lat">
            <input
              type="number"
              step="0.0001"
              value={coords.lat}
              onChange={(e) => onCoordsChange({ lat: Number(e.target.value), lon: coords.lon })}
              className={inputClass}
            />
          </Field>
          <Field label="lon">
            <input
              type="number"
              step="0.0001"
              value={coords.lon}
              onChange={(e) => onCoordsChange({ lat: coords.lat, lon: Number(e.target.value) })}
              className={inputClass}
            />
          </Field>
        </div>
      ) : null}

      {activeTab === "places" && (
        <>
          <Field label="radius (m)">
            <input type="number" value={form.radius} onChange={(e) => setField("radius", Number(e.target.value))} className={inputClass} />
          </Field>
          <Field label="types (comma)">
            <input value={form.types} onChange={(e) => setField("types", e.target.value)} className={inputClass} placeholder="cafe,restaurant" />
          </Field>
        </>
      )}

      {activeTab === "placeDetails" && (
        <Field label="placeId">
          <input value={form.placeId} onChange={(e) => setField("placeId", e.target.value)} className={inputClass} placeholder="ChIJ..." />
        </Field>
      )}

      {activeTab === "events" && (
        <>
          <Field label="within">
            <input value={form.within} onChange={(e) => setField("within", e.target.value)} className={inputClass} placeholder="5km" />
          </Field>
          <Field label="classification (optional)">
            <input value={form.classification} onChange={(e) => setField("classification", e.target.value)} className={inputClass} placeholder="music" />
          </Field>
        </>
      )}

      {(activeTab === "merchantsNearby" || activeTab === "density") && (
        <Field label="radiusKm">
          <input type="number" step="0.1" value={form.radiusKm} onChange={(e) => setField("radiusKm", Number(e.target.value))} className={inputClass} />
        </Field>
      )}

      {activeTab === "merchantsNearby" && (
        <Field label="category (optional)">
          <select value={form.category} onChange={(e) => setField("category", e.target.value)} className={inputClass}>
            <option value="">— any —</option>
            <option value="cafe">cafe</option>
            <option value="restaurant">restaurant</option>
            <option value="bakery">bakery</option>
            <option value="bar">bar</option>
            <option value="retail">retail</option>
          </select>
        </Field>
      )}

      {activeTab === "density" && (
        <Field label="windowMinutes">
          <input type="number" value={form.windowMinutes} onChange={(e) => setField("windowMinutes", Number(e.target.value))} className={inputClass} />
        </Field>
      )}

      {activeTab === "merchantById" && (
        <Field label="merchantId">
          <input value={form.merchantId} onChange={(e) => setField("merchantId", e.target.value)} className={inputClass} placeholder="mer_cafe_mueller" />
        </Field>
      )}

      {(activeTab === "scenarioPost" || activeTab === "scenarioDelete") && (
        <Field label="merchantId">
          <input value={form.scenarioMerchantId} onChange={(e) => setField("scenarioMerchantId", e.target.value)} className={inputClass} placeholder="mer_cafe_mueller" />
        </Field>
      )}

      {activeTab === "scenarioPost" && (
        <Field label="multiplier (0=empty, 1=normal, 2=busy)">
          <input type="number" step="0.1" value={form.multiplier} onChange={(e) => setField("multiplier", Number(e.target.value))} className={inputClass} />
        </Field>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wide text-zinc-500 font-medium">{label}</span>
      <div className="mt-0.5">{children}</div>
    </label>
  );
}

