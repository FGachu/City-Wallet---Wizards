import type { LiveWeatherApiResponse } from "@/lib/live-weather";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const searchParams = new URL(req.url).searchParams;
  const q = searchParams.get("q")?.trim();
  const lat = searchParams.get("lat")?.trim();
  const lon = searchParams.get("lon")?.trim();
  const key = process.env.OPENWEATHERMAP_API_KEY?.trim();

  if (!key) {
    const body: LiveWeatherApiResponse = {
      ok: false,
      reason: "missing_key",
      message: "Set OPENWEATHERMAP_API_KEY in .env.local for live weather."
    };
    return Response.json(body, { status: 200 });
  }

  const url = new URL("https://api.openweathermap.org/data/2.5/weather");
  if (lat && lon) {
    url.searchParams.set("lat", lat);
    url.searchParams.set("lon", lon);
  } else {
    url.searchParams.set("q", q || "Stuttgart");
  }
  url.searchParams.set("units", "metric");
  url.searchParams.set("appid", key);

  try {
    const upstream = await fetch(url.toString(), { cache: "no-store" });
    const raw = (await upstream.json()) as Record<string, unknown>;

    if (!upstream.ok) {
      const msg =
        typeof raw.message === "string" ? raw.message : `OpenWeatherMap HTTP ${upstream.status}`;
      const body: LiveWeatherApiResponse = { ok: false, reason: "upstream", message: msg };
      return Response.json(body, { status: 200 });
    }

    const main = raw.main as Record<string, number> | undefined;
    const weather0 = Array.isArray(raw.weather) ? (raw.weather[0] as Record<string, string>) : undefined;
    const coord = raw.coord as { lat?: number; lon?: number } | undefined;
    const wind = raw.wind as { speed?: number } | undefined;
    const rain = raw.rain as Record<string, number> | undefined;
    const name = typeof raw.name === "string" ? raw.name : q;
    const dt = typeof raw.dt === "number" ? raw.dt : Math.floor(Date.now() / 1000);

    const rain1h = rain?.["1h"] ?? null;

    const body: LiveWeatherApiResponse = {
      ok: true,
      city: name,
      lat: coord?.lat ?? 0,
      lon: coord?.lon ?? 0,
      tempC: main?.temp ?? 0,
      feelsLikeC: main?.feels_like ?? main?.temp ?? 0,
      description: weather0?.description ?? "unknown",
      windMs: wind?.speed ?? 0,
      rain1h,
      icon: weather0?.icon ?? "",
      observedAt: new Date(dt * 1000).toISOString()
    };

    return Response.json(body);
  } catch (e) {
    const body: LiveWeatherApiResponse = {
      ok: false,
      reason: "network",
      message: e instanceof Error ? e.message : "Request failed"
    };
    return Response.json(body, { status: 200 });
  }
}
