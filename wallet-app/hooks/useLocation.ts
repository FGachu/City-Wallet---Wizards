import { useEffect, useState } from "react";
import * as Location from "expo-location";

export type LocationState = {
  coords: { lat: number; lon: number } | null;
  permission: Location.PermissionStatus | "loading";
  error: string | null;
};

const DEFAULT_FALLBACK = { lat: 48.7758, lon: 9.1829 }; // Stuttgart

export function useLocation(opts?: { fallback?: { lat: number; lon: number } }) {
  const fallback = opts?.fallback ?? DEFAULT_FALLBACK;
  const [state, setState] = useState<LocationState>({
    coords: null,
    permission: "loading",
    error: null,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (!mounted) return;
      if (status !== "granted") {
        setState({ coords: fallback, permission: status, error: "permission_denied_using_fallback" });
        return;
      }
      try {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (!mounted) return;
        setState({
          coords: { lat: pos.coords.latitude, lon: pos.coords.longitude },
          permission: status,
          error: null,
        });
      } catch (err) {
        if (!mounted) return;
        setState({
          coords: fallback,
          permission: status,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    })();
    return () => {
      mounted = false;
    };
  }, [fallback]);

  return state;
}
