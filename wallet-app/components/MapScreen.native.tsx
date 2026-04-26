import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE, type Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocation } from "@/hooks/useLocation";
import { api, type MerchantNearby } from "@/lib/api";
import { theme } from "@/lib/theme";

const CATEGORY_COLOR: Record<string, string> = {
  cafe: "#6CA9F0",
  restaurant: "#E26A6A",
  bakery: "#F2C75C",
  bar: "#B07CE0",
  retail: "#8A8A94",
};

const provider = Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT;

export default function MapScreen() {
  const loc = useLocation();
  const [merchants, setMerchants] = useState<MerchantNearby[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loc.coords) return;
    setError(null);
    api
      .merchantsNearby(loc.coords, 2)
      .then((r) => setMerchants(r.merchants))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [loc.coords]);

  const initialRegion: Region | undefined = useMemo(() => {
    if (!loc.coords) return undefined;
    return {
      latitude: loc.coords.lat,
      longitude: loc.coords.lon,
      latitudeDelta: 0.025,
      longitudeDelta: 0.025,
    };
  }, [loc.coords]);

  const isLoading = !loc.coords || merchants === null;

  return (
    <View style={styles.root}>
      {initialRegion ? (
        <MapView
          provider={provider}
          style={StyleSheet.absoluteFillObject}
          initialRegion={initialRegion}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={false}
        >
          {(merchants ?? []).map((m) => (
            <Marker
              key={m.id}
              coordinate={{ latitude: m.location.lat, longitude: m.location.lon }}
              title={m.name}
              description={
                m.distanceKm !== undefined
                  ? `${m.category} · ${formatDistance(m.distanceKm)}${
                      m.rating ? ` · ★ ${m.rating.toFixed(1)}` : ""
                    }`
                  : m.category
              }
              pinColor={CATEGORY_COLOR[m.category] ?? theme.colors.accent}
            />
          ))}
        </MapView>
      ) : null}

      <SafeAreaView style={styles.headerSafe} edges={["top"]} pointerEvents="box-none">
        <View style={styles.headerCard} pointerEvents="box-none">
          <Text style={styles.title}>Nearby</Text>
          <Text style={styles.subtitle}>
            {error
              ? `Backend error: ${error}`
              : isLoading
                ? "Loading merchants…"
                : `${merchants?.length ?? 0} merchants in 2 km · ${api.baseUrl}`}
          </Text>
        </View>
      </SafeAreaView>

      {isLoading ? (
        <View style={styles.loader} pointerEvents="none">
          <ActivityIndicator color={theme.colors.accent} />
        </View>
      ) : null}
    </View>
  );
}

function formatDistance(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(2)} km`;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  headerSafe: { position: "absolute", top: 0, left: 0, right: 0 },
  headerCard: {
    margin: 12,
    padding: 14,
    borderRadius: theme.radius.md,
    backgroundColor: "rgba(21,21,27,0.92)",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: { color: theme.colors.text, fontSize: 20, fontWeight: "700" },
  subtitle: { color: theme.colors.textMuted, fontSize: 12, marginTop: 4 },
  loader: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 32,
    alignItems: "center",
  },
});
