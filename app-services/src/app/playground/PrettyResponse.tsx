"use client";

import type { ApiId } from "./types";

type Props = {
  apiId: ApiId;
  body: unknown;
};

export function PrettyResponse({ apiId, body }: Props) {
  if (!body || typeof body !== "object") {
    return <Empty>Response has no renderable content.</Empty>;
  }
  const data = body as Record<string, unknown>;

  if ((data as { error?: string }).error) {
    return (
      <div className="rounded-md border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-300">
        <div className="font-semibold mb-1">Error</div>
        <div>{String((data as { error?: string }).error)}</div>
        {(data as { details?: string }).details ? (
          <div className="text-xs mt-1 opacity-80">{String((data as { details?: string }).details)}</div>
        ) : null}
      </div>
    );
  }

  switch (apiId) {
    case "weather":
      return <WeatherView data={data} />;
    case "places":
      return <PlacesView data={data} />;
    case "placeDetails":
      return <PlaceDetailsView data={data} />;
    case "events":
      return <EventsView data={data} />;
    case "merchantsNearby":
      return <MerchantsNearbyView data={data} />;
    case "merchantById":
      return <MerchantByIdView data={data} />;
    case "density":
      return <DensityView data={data} />;
    case "scenarioGet":
    case "scenarioPost":
    case "scenarioDelete":
      return <ScenarioView data={data} />;
    default:
      return <Empty>No pretty view for this endpoint.</Empty>;
  }
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="text-xs text-zinc-500 italic">{children}</div>;
}

/* -------- Weather -------- */

function WeatherView({ data }: { data: Record<string, unknown> }) {
  const loc = data.location as { name?: string; country?: string } | undefined;
  const t = data.temperature as { current?: number; feelsLike?: number; min?: number; max?: number } | undefined;
  const c = data.conditions as { main?: string; description?: string; icon?: string } | undefined;
  const wind = data.wind as { speed?: number } | undefined;
  const humidity = data.humidity as number | undefined;
  const clouds = data.clouds as number | undefined;

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-blue-950/40 p-4">
        <div className="flex items-start gap-4">
          {c?.icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`https://openweathermap.org/img/wn/${c.icon}@2x.png`} alt="" width={64} height={64} />
          ) : null}
          <div className="flex-1">
            <div className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
              {loc?.name}{loc?.country ? `, ${loc.country}` : ""}
            </div>
            <div className="text-3xl font-semibold mt-0.5">
              {t?.current != null ? `${Math.round(t.current)}°C` : "—"}
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400 capitalize">{c?.description ?? c?.main ?? ""}</div>
            {t?.feelsLike != null ? (
              <div className="text-xs text-zinc-500 mt-0.5">Feels like: {Math.round(t.feelsLike)}°</div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 divide-x divide-zinc-200 dark:divide-zinc-800 text-center text-xs">
        <Stat label="Min/Max" value={t?.min != null && t?.max != null ? `${Math.round(t.min)}° / ${Math.round(t.max)}°` : "—"} />
        <Stat label="Wind" value={wind?.speed != null ? `${wind.speed.toFixed(1)} m/s` : "—"} />
        <Stat label="Humidity" value={humidity != null ? `${humidity}%` : "—"} sub={clouds != null ? `Clouds ${clouds}%` : undefined} />
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="px-2 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">{label}</div>
      <div className="text-sm font-semibold mt-0.5">{value}</div>
      {sub ? <div className="text-[10px] text-zinc-500 mt-0.5">{sub}</div> : null}
    </div>
  );
}

/* -------- Places (nearby) -------- */

type PlaceLite = {
  id: string;
  name: string;
  primaryTypeLabel?: string | null;
  primaryType?: string | null;
  address?: string | null;
  rating?: number | null;
  userRatingCount?: number | null;
  priceLevel?: string | null;
  openNow?: boolean | null;
  hoursToday?: string | null;
  distanceKm?: number | null;
  googleMapsUri?: string | null;
};

function PlacesView({ data }: { data: Record<string, unknown> }) {
  const places = (data.places ?? []) as PlaceLite[];
  const count = (data.count as number | undefined) ?? places.length;
  if (!places.length) return <Empty>No places within radius.</Empty>;

  return (
    <div className="space-y-2">
      <div className="text-xs text-zinc-500">{count} results</div>
      <ul className="space-y-2">
        {places.map((p) => (
          <li key={p.id} className="rounded-md border border-zinc-200 dark:border-zinc-800 p-3 bg-white dark:bg-zinc-950">
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{p.name}</div>
                <div className="text-xs text-zinc-500 truncate">{p.primaryTypeLabel ?? p.primaryType ?? "—"}</div>
                {p.address ? <div className="text-[11px] text-zinc-500 mt-0.5 truncate">{p.address}</div> : null}
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {p.openNow != null ? (
                    <Badge color={p.openNow ? "emerald" : "zinc"}>{p.openNow ? "Open" : "Closed"}</Badge>
                  ) : null}
                  {p.rating != null ? (
                    <Badge color="amber">★ {p.rating.toFixed(1)}{p.userRatingCount ? ` (${p.userRatingCount})` : ""}</Badge>
                  ) : null}
                  {p.priceLevel ? <Badge color="zinc">{priceSymbol(p.priceLevel)}</Badge> : null}
                  {p.distanceKm != null ? <Badge color="blue">{formatDistance(p.distanceKm)}</Badge> : null}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PlaceDetailsView({ data }: { data: Record<string, unknown> }) {
  const place = data.place as PlaceLite & { weekdayDescriptions?: string[]; websiteUri?: string | null } | undefined;
  if (!place) return <Empty>No data.</Empty>;
  return (
    <div className="rounded-md border border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-950 space-y-3">
      <div>
        <div className="text-base font-semibold">{place.name}</div>
        <div className="text-xs text-zinc-500">{place.primaryTypeLabel ?? place.primaryType ?? "—"}</div>
      </div>
      {place.address ? <div className="text-sm text-zinc-700 dark:text-zinc-300">{place.address}</div> : null}
      <div className="flex flex-wrap gap-1.5">
        {place.openNow != null ? <Badge color={place.openNow ? "emerald" : "zinc"}>{place.openNow ? "Open now" : "Closed"}</Badge> : null}
        {place.rating != null ? <Badge color="amber">★ {place.rating.toFixed(1)}{place.userRatingCount ? ` (${place.userRatingCount})` : ""}</Badge> : null}
        {place.priceLevel ? <Badge color="zinc">{priceSymbol(place.priceLevel)}</Badge> : null}
      </div>
      {place.weekdayDescriptions?.length ? (
        <div>
          <div className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 mb-1">Hours</div>
          <ul className="text-xs space-y-0.5 text-zinc-600 dark:text-zinc-400">
            {place.weekdayDescriptions.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2 text-xs">
        {place.googleMapsUri ? <a href={place.googleMapsUri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Maps ↗</a> : null}
        {place.websiteUri ? <a href={place.websiteUri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Website ↗</a> : null}
      </div>
    </div>
  );
}

/* -------- Events -------- */

type EventVenue = {
  name?: string | null;
  city?: string | null;
  distanceKm?: number | null;
};

type EventLite = {
  id: string;
  name: string;
  url?: string | null;
  start?: string | null;
  startLocal?: string | null;
  segment?: string | null;
  genre?: string | null;
  image?: string | null;
  priceRange?: { min: number; max: number; currency: string } | null;
  venue?: EventVenue | null;
};

function EventsView({ data }: { data: Record<string, unknown> }) {
  const events = (data.events ?? []) as EventLite[];
  const provider = (data.provider as string | undefined) ?? "events";
  if (!events.length) return <Empty>No events in window.</Empty>;
  return (
    <div className="space-y-2">
      <div className="text-xs text-zinc-500">{events.length} events · provider: <span className="font-mono">{provider}</span></div>
      <ul className="space-y-2">
        {events.map((e) => (
          <li key={e.id} className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
            <div className="flex gap-3 p-3">
              {e.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={e.image} alt="" className="w-16 h-16 rounded object-cover flex-shrink-0" />
              ) : null}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium leading-tight">{e.name}</div>
                {e.venue?.name ? (
                  <div className="text-xs text-zinc-500 mt-0.5 truncate">
                    {e.venue.name}{e.venue.city ? ` · ${e.venue.city}` : ""}
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {e.start ? <Badge color="blue">{formatDateShort(e.startLocal ?? e.start)}</Badge> : null}
                  {e.segment ? <Badge color="purple">{e.segment}</Badge> : null}
                  {e.genre ? <Badge color="zinc">{e.genre}</Badge> : null}
                  {e.priceRange ? (
                    <Badge color="amber">
                      {e.priceRange.currency} {e.priceRange.min}{e.priceRange.max !== e.priceRange.min ? `–${e.priceRange.max}` : ""}
                    </Badge>
                  ) : null}
                  {e.venue?.distanceKm != null ? <Badge color="emerald">{formatDistance(e.venue.distanceKm)}</Badge> : null}
                </div>
                {e.url ? (
                  <a href={e.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-600 hover:underline mt-1 inline-block">
                    view ↗
                  </a>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------- Merchants -------- */

type MerchantLite = {
  id: string;
  name: string;
  category: string;
  address?: string;
  distanceKm?: number;
  rating?: number | null;
  userRatingCount?: number | null;
  priceLevel?: string | null;
  productCount?: number;
  quietWindows?: string[];
  rules?: { maxDiscountPct?: number; goalSummary?: string };
};

function MerchantsNearbyView({ data }: { data: Record<string, unknown> }) {
  const merchants = (data.merchants ?? []) as MerchantLite[];
  if (!merchants.length) return <Empty>No registered merchants within radius.</Empty>;
  return (
    <div className="space-y-2">
      <div className="text-xs text-zinc-500">{merchants.length} merchants · catalog</div>
      <ul className="space-y-2">
        {merchants.map((m) => (
          <li key={m.id} className="rounded-md border border-zinc-200 dark:border-zinc-800 p-3 bg-white dark:bg-zinc-950">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{m.name}</div>
                <div className="text-[11px] font-mono text-zinc-500 truncate">{m.id}</div>
                {m.address ? <div className="text-xs text-zinc-500 mt-0.5 truncate">{m.address}</div> : null}
              </div>
              {m.distanceKm != null ? (
                <Badge color="blue">{formatDistance(m.distanceKm)}</Badge>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <Badge color="emerald">{m.category}</Badge>
              {m.rating != null ? <Badge color="amber">★ {m.rating.toFixed(1)}</Badge> : null}
              {m.priceLevel ? <Badge color="zinc">{priceSymbol(m.priceLevel)}</Badge> : null}
              {m.productCount != null ? <Badge color="purple">{m.productCount} products</Badge> : null}
            </div>
            {m.quietWindows?.length ? (
              <div className="text-[11px] text-zinc-500 mt-1.5">
                Quiet windows: {m.quietWindows.join(", ")}
              </div>
            ) : null}
            {m.rules?.goalSummary ? (
              <div className="text-[11px] italic text-zinc-500 mt-1">&quot;{m.rules.goalSummary}&quot;</div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

type Product = {
  id: string;
  name: string;
  priceCents: number;
  category: string;
  maxDiscountPct: number;
  enabled: boolean;
  photo?: string | null;
};

function MerchantByIdView({ data }: { data: Record<string, unknown> }) {
  const m = data.merchant as
    | (MerchantLite & {
        baselineDailyTx?: number;
        avgTicketCents?: number;
        products?: Product[];
        rules?: { maxDiscountPct: number; dailyOfferBudgetCents: number; goalSummary: string };
        quietWindows?: string[];
      })
    | undefined;
  if (!m) return <Empty>No data.</Empty>;

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-zinc-200 dark:border-zinc-800 p-3 bg-white dark:bg-zinc-950">
        <div className="text-base font-semibold">{m.name}</div>
        <div className="text-[11px] font-mono text-zinc-500">{m.id}</div>
        {m.address ? <div className="text-xs text-zinc-500 mt-1">{m.address}</div> : null}
        <div className="flex flex-wrap gap-1.5 mt-2">
          <Badge color="emerald">{m.category}</Badge>
          {m.rating != null ? <Badge color="amber">★ {m.rating.toFixed(1)}</Badge> : null}
          {m.priceLevel ? <Badge color="zinc">{priceSymbol(m.priceLevel)}</Badge> : null}
          {m.baselineDailyTx != null ? <Badge color="blue">{m.baselineDailyTx} tx/day</Badge> : null}
          {m.avgTicketCents != null ? <Badge color="purple">ticket {formatCents(m.avgTicketCents)}</Badge> : null}
        </div>
      </div>

      {m.rules ? (
        <div className="rounded-md border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50 dark:bg-zinc-900">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 mb-1.5">Merchant rules</div>
          <div className="text-sm italic text-zinc-700 dark:text-zinc-300">&quot;{m.rules.goalSummary}&quot;</div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <Badge color="orange">max {m.rules.maxDiscountPct}% off</Badge>
            <Badge color="orange">budget {formatCents(m.rules.dailyOfferBudgetCents)}/day</Badge>
            {m.quietWindows?.length ? <Badge color="zinc">quiet: {m.quietWindows.join(", ")}</Badge> : null}
          </div>
        </div>
      ) : null}

      {m.products?.length ? (
        <div>
          <div className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 mb-1.5">Products ({m.products.length})</div>
          <ul className="space-y-1.5">
            {m.products.map((p) => (
              <li key={p.id} className={`rounded-md border p-2.5 flex items-center gap-2 ${p.enabled ? "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950" : "border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 opacity-60"}`}>
                {p.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.photo} alt={p.name} className="w-10 h-10 rounded object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-500">{p.category[0]}</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-[11px] text-zinc-500">{p.category} · max {p.maxDiscountPct}%</div>
                </div>
                <div className="text-sm font-semibold tabular-nums">{formatCents(p.priceCents)}</div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/* -------- Density -------- */

type DensityRow = {
  id: string;
  name: string;
  category: string;
  distanceKm: number;
  expectedTx: number;
  actualTx: number;
  expectedRevenueCents: number;
  actualRevenueCents: number;
  quietScore: number;
  isQuiet: boolean;
  hasScenarioOverride: boolean;
  windowMinutes: number;
};

type DensityStatus = "quiet" | "busy" | "normal" | "closed";

function densityStatus(m: DensityRow): DensityStatus {
  if (m.expectedTx < 0.1) return "closed";
  if (m.isQuiet) return "quiet";
  if (m.quietScore >= 0.4) return "busy";
  return "normal";
}

function DensityView({ data }: { data: Record<string, unknown> }) {
  const summary = data.summary as { merchantCount?: number; quietCount?: number; activeOverrides?: Record<string, number> } | undefined;
  const merchants = (data.merchants ?? []) as DensityRow[];
  const query = data.query as { windowMinutes?: number } | undefined;

  if (!merchants.length) return <Empty>No merchants within radius.</Empty>;

  const grouped = {
    quiet: merchants.filter((m) => densityStatus(m) === "quiet"),
    busy: merchants.filter((m) => densityStatus(m) === "busy"),
    normal: merchants.filter((m) => densityStatus(m) === "normal"),
    closed: merchants.filter((m) => densityStatus(m) === "closed"),
  };

  const candidateCount = grouped.quiet.length;
  const window = query?.windowMinutes ?? "?";

  return (
    <div className="space-y-3">
      <div
        className={`rounded-lg border p-3.5 ${
          candidateCount > 0
            ? "border-red-200 dark:border-red-900/50 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/20"
            : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50"
        }`}
      >
        <div className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
          Offer-engine signal · last {window} min
        </div>
        <div
          className={`text-lg font-semibold mt-0.5 ${
            candidateCount > 0 ? "text-red-700 dark:text-red-300" : "text-zinc-700 dark:text-zinc-300"
          }`}
        >
          {candidateCount === 0
            ? "No quiet merchants — nothing to trigger"
            : `${candidateCount} quiet merchant${candidateCount > 1 ? "s" : ""} → offer candidate${candidateCount > 1 ? "s" : ""}`}
        </div>
        <div className="text-xs text-zinc-500 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
          <span>{merchants.length} in range</span>
          {grouped.normal.length > 0 ? <span>{grouped.normal.length} normal</span> : null}
          {grouped.busy.length > 0 ? <span>{grouped.busy.length} busy</span> : null}
          {grouped.closed.length > 0 ? <span>{grouped.closed.length} outside hours</span> : null}
        </div>
      </div>

      {summary?.activeOverrides && Object.keys(summary.activeOverrides).length ? (
        <div className="rounded-md border border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-950/30 p-2.5 text-xs">
          <div className="font-semibold text-orange-700 dark:text-orange-300 mb-1">
            Active scenario overrides
          </div>
          <div className="space-y-0.5 font-mono text-[11px]">
            {Object.entries(summary.activeOverrides).map(([id, mult]) => (
              <div key={id}>
                <span className="text-zinc-500">{id}</span> × {mult}{" "}
                <span className="text-zinc-400">
                  ({mult < 0.5 ? "forced quiet" : mult > 1.5 ? "forced busy" : "shifted"})
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {grouped.quiet.length > 0 ? (
        <DensitySection
          label="Offer candidates"
          sublabel="Below −40% threshold — engine should generate an offer"
          tone="red"
        >
          {grouped.quiet.map((m) => <DensityCard key={m.id} m={m} status="quiet" />)}
        </DensitySection>
      ) : null}

      {grouped.busy.length > 0 ? (
        <DensitySection label="Above normal" sublabel="No discount needed — venue is doing well" tone="blue">
          {grouped.busy.map((m) => <DensityCard key={m.id} m={m} status="busy" />)}
        </DensitySection>
      ) : null}

      {grouped.normal.length > 0 ? (
        <DensitySection label="Within normal range" tone="emerald">
          {grouped.normal.map((m) => <DensityCard key={m.id} m={m} status="normal" />)}
        </DensitySection>
      ) : null}

      {grouped.closed.length > 0 ? (
        <DensitySection label="Outside operating hours" sublabel="Curve = 0 at this time of day" tone="zinc">
          {grouped.closed.map((m) => <DensityClosedRow key={m.id} m={m} />)}
        </DensitySection>
      ) : null}
    </div>
  );
}

function DensitySection({
  label,
  sublabel,
  tone,
  children,
}: {
  label: string;
  sublabel?: string;
  tone: "red" | "blue" | "emerald" | "zinc";
  children: React.ReactNode;
}) {
  const dot = {
    red: "bg-red-500",
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    zinc: "bg-zinc-400",
  }[tone];
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline gap-2 px-0.5">
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
        <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-600 dark:text-zinc-400">
          {label}
        </span>
        {sublabel ? <span className="text-[11px] text-zinc-500">· {sublabel}</span> : null}
      </div>
      <ul className="space-y-1.5">{children}</ul>
    </div>
  );
}

function DensityCard({ m, status }: { m: DensityRow; status: "quiet" | "busy" | "normal" }) {
  const deltaPct = Math.round(m.quietScore * 100);
  const deltaLabel =
    deltaPct === 0 ? "on target" : `${deltaPct > 0 ? "+" : ""}${deltaPct}% vs normal`;

  const palette = {
    quiet: { border: "border-red-200 dark:border-red-900/50 bg-red-50/40 dark:bg-red-950/20", text: "text-red-600 dark:text-red-400", fill: "bg-red-500", label: "QUIET" },
    busy: { border: "border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20", text: "text-blue-600 dark:text-blue-400", fill: "bg-blue-500", label: "BUSY" },
    normal: { border: "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950", text: "text-emerald-600 dark:text-emerald-400", fill: "bg-emerald-500", label: "NORMAL" },
  }[status];

  const ratio = m.actualTx / Math.max(m.expectedTx, 0.0001);
  const fillPct = Math.min(100, (ratio / 1.5) * 100);
  const expectedMarker = (1.0 / 1.5) * 100;
  const quietMarker = (0.6 / 1.5) * 100;

  return (
    <li className={`rounded-md border p-3 ${palette.border}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-medium truncate">{m.name}</span>
            {m.hasScenarioOverride ? <Badge color="orange">override</Badge> : null}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            {m.category} · {formatDistance(m.distanceKm)}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className={`text-[11px] font-bold tracking-wide ${palette.text}`}>{palette.label}</div>
          <div className={`text-sm font-semibold tabular-nums ${palette.text}`}>{deltaLabel}</div>
        </div>
      </div>

      <div className="mt-3">
        <div className="relative h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
          <div className={`absolute inset-y-0 left-0 ${palette.fill}`} style={{ width: `${fillPct}%` }} />
          <div
            className="absolute inset-y-0 w-px bg-red-400/70"
            style={{ left: `${quietMarker}%` }}
            title="quiet threshold (−40%)"
          />
          <div
            className="absolute inset-y-0 w-px bg-zinc-700 dark:bg-zinc-300"
            style={{ left: `${expectedMarker}%` }}
            title="expected (100%)"
          />
        </div>
        <div className="relative h-3 mt-0.5 text-[9px] text-zinc-500 uppercase tracking-wider">
          <span className="absolute -translate-x-1/2" style={{ left: `${quietMarker}%` }}>quiet</span>
          <span className="absolute -translate-x-1/2" style={{ left: `${expectedMarker}%` }}>expected</span>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
        <div className="rounded bg-zinc-100 dark:bg-zinc-900 px-2 py-1">
          <div className="text-zinc-500 text-[10px] uppercase tracking-wider">Actual</div>
          <div className="font-semibold tabular-nums">
            {m.actualTx} tx · {formatCents(m.actualRevenueCents)}
          </div>
        </div>
        <div className="rounded bg-zinc-100 dark:bg-zinc-900 px-2 py-1">
          <div className="text-zinc-500 text-[10px] uppercase tracking-wider">Expected</div>
          <div className="font-semibold tabular-nums text-zinc-600 dark:text-zinc-400">
            {m.expectedTx} tx · {formatCents(m.expectedRevenueCents)}
          </div>
        </div>
      </div>
    </li>
  );
}

function DensityClosedRow({ m }: { m: DensityRow }) {
  return (
    <li className="rounded-md border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/60 dark:bg-zinc-900/40 px-3 py-2 flex items-center justify-between gap-2 opacity-70">
      <div className="min-w-0">
        <div className="text-sm truncate">{m.name}</div>
        <div className="text-[11px] text-zinc-500">
          {m.category} · {formatDistance(m.distanceKm)}
        </div>
      </div>
      <Badge color="zinc">closed at this hour</Badge>
    </li>
  );
}

/* -------- Scenario -------- */

function ScenarioView({ data }: { data: Record<string, unknown> }) {
  const overrides = (data.activeOverrides ?? {}) as Record<string, number>;
  const removed = data.removed as boolean | undefined;
  const entries = Object.entries(overrides);

  return (
    <div className="space-y-2">
      {removed != null ? (
        <div className={`text-xs px-2.5 py-1.5 rounded-md ${removed ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900"}`}>
          {removed ? "Override removed" : "No override existed for that merchantId"}
        </div>
      ) : null}

      {entries.length === 0 ? (
        <Empty>No active overrides. Simulator uses default multipliers (1.0).</Empty>
      ) : (
        <div>
          <div className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 mb-1.5">Active overrides</div>
          <ul className="space-y-1">
            {entries.map(([id, mult]) => (
              <li key={id} className="rounded-md border border-zinc-200 dark:border-zinc-800 p-2 bg-white dark:bg-zinc-950 flex items-center justify-between">
                <code className="text-xs">{id}</code>
                <Badge color={mult < 0.5 ? "red" : mult > 1.5 ? "purple" : "emerald"}>× {mult}</Badge>
              </li>
            ))}
          </ul>
          <div className="text-[11px] text-zinc-500 mt-2">
            <strong>0.0–0.5</strong> = quiet, <strong>~1.0</strong> = normal, <strong>&gt;1.5</strong> = busy.
          </div>
        </div>
      )}
    </div>
  );
}

/* -------- Helpers -------- */

type BadgeColor = "blue" | "emerald" | "amber" | "purple" | "orange" | "red" | "zinc";

const BADGE_CLASS: Record<BadgeColor, string> = {
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
  emerald: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  purple: "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300",
  orange: "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300",
  red: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
  zinc: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

function Badge({ color, children }: { color: BadgeColor; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded ${BADGE_CLASS[color]}`}>
      {children}
    </span>
  );
}

function priceSymbol(level: string): string {
  switch (level) {
    case "PRICE_LEVEL_FREE": return "Free";
    case "PRICE_LEVEL_INEXPENSIVE": return "€";
    case "PRICE_LEVEL_MODERATE": return "€€";
    case "PRICE_LEVEL_EXPENSIVE": return "€€€";
    case "PRICE_LEVEL_VERY_EXPENSIVE": return "€€€€";
    default: return level;
  }
}

function formatCents(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(2)} km`;
}

function formatDateShort(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
