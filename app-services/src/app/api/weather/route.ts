import { NextRequest, NextResponse } from "next/server";

const OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export type WeatherResponse = {
  location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
  temperature: {
    current: number;
    feelsLike: number;
    min: number;
    max: number;
    unit: "celsius";
  };
  conditions: {
    main: string;
    description: string;
    icon: string;
  };
  wind: {
    speed: number;
    deg: number;
  };
  humidity: number;
  clouds: number;
  observedAt: string;
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OPENWEATHER_API_KEY environment variable" },
      { status: 500, headers: CORS_HEADERS },
    );
  }

  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const units = searchParams.get("units") ?? "metric";
  const lang = searchParams.get("lang") ?? "en";

  if (!lat || !lon) {
    return NextResponse.json(
      {
        error: "Missing required query parameters",
        details: "Provide both 'lat' and 'lon' as query parameters.",
        example: "/api/weather?lat=48.7758&lon=9.1829",
      },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const latNum = Number(lat);
  const lonNum = Number(lon);
  if (
    !Number.isFinite(latNum) ||
    !Number.isFinite(lonNum) ||
    latNum < -90 ||
    latNum > 90 ||
    lonNum < -180 ||
    lonNum > 180
  ) {
    return NextResponse.json(
      { error: "Invalid coordinates", details: "lat must be in [-90, 90] and lon in [-180, 180]." },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const upstream = new URL(OPENWEATHER_URL);
  upstream.searchParams.set("lat", String(latNum));
  upstream.searchParams.set("lon", String(lonNum));
  upstream.searchParams.set("units", units);
  upstream.searchParams.set("lang", lang);
  upstream.searchParams.set("appid", apiKey);

  try {
    const res = await fetch(upstream.toString(), { next: { revalidate: 60 } });
    if (!res.ok) {
      const body = await res.text();
      return NextResponse.json(
        { error: "OpenWeather request failed", status: res.status, body },
        { status: res.status, headers: CORS_HEADERS },
      );
    }

    const data = await res.json();

    const payload: WeatherResponse = {
      location: {
        name: data.name,
        country: data.sys?.country ?? "",
        lat: data.coord?.lat ?? latNum,
        lon: data.coord?.lon ?? lonNum,
      },
      temperature: {
        current: data.main?.temp,
        feelsLike: data.main?.feels_like,
        min: data.main?.temp_min,
        max: data.main?.temp_max,
        unit: "celsius",
      },
      conditions: {
        main: data.weather?.[0]?.main ?? "",
        description: data.weather?.[0]?.description ?? "",
        icon: data.weather?.[0]?.icon ?? "",
      },
      wind: {
        speed: data.wind?.speed ?? 0,
        deg: data.wind?.deg ?? 0,
      },
      humidity: data.main?.humidity ?? 0,
      clouds: data.clouds?.all ?? 0,
      observedAt: new Date((data.dt ?? Date.now() / 1000) * 1000).toISOString(),
    };

    return NextResponse.json(payload, { headers: CORS_HEADERS });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to reach OpenWeather", details: err instanceof Error ? err.message : String(err) },
      { status: 502, headers: CORS_HEADERS },
    );
  }
}
