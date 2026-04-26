/** Snapshot from `/api/live-weather` (OpenWeatherMap current weather, server-side). */
export type LiveOpenWeatherSnapshot = {
  ok: true;
  city: string;
  lat: number;
  lon: number;
  tempC: number;
  feelsLikeC: number;
  description: string;
  windMs: number;
  rain1h: number | null;
  icon: string;
  observedAt: string;
};

export type LiveWeatherApiResponse = LiveOpenWeatherSnapshot | { ok: false; reason: string; message?: string };
