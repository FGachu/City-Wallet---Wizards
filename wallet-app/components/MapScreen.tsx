import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocation } from "@/hooks/useLocation";
import { api, type MerchantNearby } from "@/lib/api";
import { theme } from "@/lib/theme";

export default function MapScreenWeb() {
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
        <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: "700" }}>Nearby</Text>
        <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>
          Web preview · native maps not available here · {api.baseUrl}
        </Text>
        {error ? (
          <Text style={{ color: theme.colors.quiet, fontSize: 12 }}>Backend: {error}</Text>
        ) : null}
        {merchants === null && !error ? (
          <Text style={{ color: theme.colors.textDim }}>Loading…</Text>
        ) : null}
        {(merchants ?? []).map((m) => (
          <View
            key={m.id}
            style={{
              padding: 14,
              borderRadius: theme.radius.md,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.card,
            }}
          >
            <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: "600" }}>
              {m.name}
            </Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 2 }}>
              {m.category}
              {m.distanceKm !== undefined
                ? ` · ${m.distanceKm < 1 ? `${Math.round(m.distanceKm * 1000)} m` : `${m.distanceKm.toFixed(2)} km`}`
                : ""}
              {m.rating ? ` · ★ ${m.rating.toFixed(1)}` : ""}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
