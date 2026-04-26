type Mode = "no-store" | "revalidate";

function resolveMode(): Mode {
  const raw = (process.env.UPSTREAM_CACHE_MODE ?? "no-store").toLowerCase();
  return raw === "revalidate" ? "revalidate" : "no-store";
}

export function upstreamFetchOptions(defaultRevalidateSeconds: number): RequestInit {
  if (resolveMode() === "no-store") return { cache: "no-store" };
  return { next: { revalidate: defaultRevalidateSeconds } };
}
