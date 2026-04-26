import { useEffect, useState } from "react";
import * as Location from "expo-location";
import { demoStore, useDemoState } from "@/lib/demoStore";

export type LocationState = {
  coords: { lat: number; lon: number } | null;
  permission: Location.PermissionStatus | "loading";
  error: string | null;
  mode: "live" | "simulated";
};

const DEFAULT_FALLBACK = { lat: 48.7758, lon: 9.1829 }; // Stuttgart

export function useLocation(opts?: { fallback?: { lat: number; lon: number } }) {
  const fallback = opts?.fallback ?? DEFAULT_FALLBACK;
  const { locationMode } = useDemoState();
  const [state, setState] = useState<LocationState>({
    coords: null,
    permission: "loading",
    error: null,
    mode: "live",
  });

  useEffect(() => {
    if (locationMode !== "live") {
      setState({
        coords: demoStore.getCoords(),
        permission: "granted",
        error: null,
        mode: "simulated",
      });
      return;
    }

    let mounted = true;
    (async () => {
      setState((s) => ({ ...s, permission: "loading", mode: "live" }));
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (!mounted) return;
      if (status !== "granted") {
        setState({
          coords: fallback,
          permission: status,
          error: "permission_denied_using_fallback",
          mode: "live",
        });
        return;
      }
      try {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (!mounted) return;
        setState({
          coords: { lat: pos.coords.latitude, lon: pos.coords.longitude },
          permission: status,
          error: null,
          mode: "live",
        });
      } catch (err) {
        if (!mounted) return;
        setState({
          coords: fallback,
          permission: status,
          error: err instanceof Error ? err.message : String(err),
          mode: "live",
        });
      }
    })();
    return () => {
      mounted = false;
    };
  }, [fallback, locationMode]);

  return state;
}
