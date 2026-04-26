import { ScrollView, View, Text, RefreshControl, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useCallback } from "react";
import { OfferCard } from "@/components/OfferCard";
import { ContextStrip } from "@/components/ContextStrip";
import { Button } from "@/components/Button";
import { theme } from "@/lib/theme";
import { fireDemoOfferNotification } from "@/hooks/useNotifications";
import { useLocation } from "@/hooks/useLocation";
import { useGeneratedOffers } from "@/hooks/useGeneratedOffers";
import { useLastIntent } from "@/lib/privacy/store";
import { router } from "expo-router";

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const loc = useLocation();
  const { offers, mode, regenerate } = useGeneratedOffers(loc.coords);
  const { lastIntent } = useLastIntent();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await regenerate();
    setRefreshing(false);
  }, [regenerate]);

  const primary = offers[0];
  const others = offers.slice(1);

  const tempLabel = lastIntent ? `${lastIntent.weather.tempBucket} ${lastIntent.weather.condition}` : "—";
  const districtLabel = lastIntent?.district ?? "Café district";
  const intentLabel = lastIntent ? lastIntent.intentCategory.replace("-", " ") : "12 min free";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.accent}
          />
        }
      >
        <View style={{ gap: 4 }}>
          <Text style={{ color: theme.colors.textMuted, fontSize: 13, fontWeight: "500" }}>
            {loc.coords ? `${loc.coords.lat.toFixed(3)}, ${loc.coords.lon.toFixed(3)}` : "locating…"}
          </Text>
          <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: "700", lineHeight: 34 }}>
            Hey Mia 👋
          </Text>
          <Text style={{ color: theme.colors.textMuted, fontSize: 15, marginTop: 2 }}>
            One offer is tuned to your last 12 minutes.
          </Text>
        </View>

        <ContextStrip
          signals={[
            { icon: "🌧", label: tempLabel },
            { icon: "📍", label: districtLabel },
            { icon: "✨", label: intentLabel },
          ]}
        />

        {mode === "offline" && (
          <View
            style={{
              backgroundColor: "#3a2a1a",
              borderColor: "#a26a3a",
              borderWidth: 1,
              borderRadius: 10,
              padding: 10,
            }}
          >
            <Text style={{ color: "#f0c486", fontSize: 12, fontWeight: "600" }}>
              Offline samples · API unreachable
            </Text>
            <Text style={{ color: "#c9a06a", fontSize: 11, marginTop: 2 }}>
              Showing bundled mock offers. Pull to retry.
            </Text>
          </View>
        )}

        {mode === "server-fallback" && (
          <View
            style={{
              backgroundColor: "#1c2a3a",
              borderColor: "#3a6aa2",
              borderWidth: 1,
              borderRadius: 10,
              padding: 10,
            }}
          >
            <Text style={{ color: "#86b6f0", fontSize: 12, fontWeight: "600" }}>
              Demo mode · server-side fallback
            </Text>
            <Text style={{ color: "#6a90c9", fontSize: 11, marginTop: 2 }}>
              Server reachable. Set GEMINI_API_KEY to enable live generation.
            </Text>
          </View>
        )}

        {mode === "live" && (
          <View
            style={{
              backgroundColor: "#1c3a2a",
              borderColor: "#3aa26a",
              borderWidth: 1,
              borderRadius: 10,
              padding: 8,
              alignSelf: "flex-start",
            }}
          >
            <Text style={{ color: "#86f0b6", fontSize: 11, fontWeight: "600" }}>
              ● live · Gemini-generated
            </Text>
          </View>
        )}

        {mode === "loading" && !primary && (
          <View style={{ alignItems: "center", padding: 24 }}>
            <ActivityIndicator color={theme.colors.accent} />
          </View>
        )}

        {primary && (
          <OfferCard offer={primary} onPress={() => router.push(`/offer/${primary.id}`)} />
        )}

        {others.length > 0 && (
          <View style={{ gap: 10 }}>
            <Text
              style={{
                color: theme.colors.textMuted,
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              Also nearby
            </Text>
            {others.map((o) => (
              <OfferCard key={o.id} offer={o} onPress={() => router.push(`/offer/${o.id}`)} />
            ))}
          </View>
        )}

        <View style={{ gap: 8, marginTop: 8 }}>
          {primary && (
            <Button
              label="🔔 Demo: send push in 2s"
              variant="secondary"
              onPress={() => fireDemoOfferNotification(primary)}
            />
          )}
          <Text
            style={{
              color: theme.colors.textDim,
              fontSize: 11,
              textAlign: "center",
              paddingHorizontal: 20,
            }}
          >
            Background the app, then watch the push arrive.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
