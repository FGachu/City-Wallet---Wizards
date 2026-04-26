export type Coords = { lat: number; lon: number };

export type MarkerColor = "blue" | "green" | "orange" | "red" | "purple" | "gray";

export type Marker = {
  id: string;
  lat: number;
  lon: number;
  label: string;
  color: MarkerColor;
  subtitle?: string;
};

export type ApiResult = {
  url: string;
  method: string;
  status: number | null;
  durationMs: number;
  ok: boolean;
  body: unknown;
};

export type ApiId =
  | "weather"
  | "places"
  | "placeDetails"
  | "events"
  | "merchantsNearby"
  | "merchantById"
  | "density"
  | "scenarioGet"
  | "scenarioPost"
  | "scenarioDelete";
