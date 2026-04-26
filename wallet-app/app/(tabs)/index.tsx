import { ScrollView, View, Text, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useCallback } from "react";
import { OfferCard } from "@/components/OfferCard";
import { ContextStrip } from "@/components/ContextStrip";
import { Button } from "@/components/Button";
import { mockOffers } from "@/lib/mockOffers";
import { theme } from "@/lib/theme";
import { fireDemoOfferNotification } from "@/hooks/useNotifications";
import { useLocation } from "@/hooks/useLocation";
import { router } from "expo-router";

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const loc = useLocation();
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 600));
    setRefreshing(false);
  }, []);

  const primary = mockOffers[0];
  const others = mockOffers.slice(1);

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
            Tuesday, 12:48 · {loc.coords ? `${loc.coords.lat.toFixed(3)}, ${loc.coords.lon.toFixed(3)}` : "locating…"}
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
            { icon: "🌧", label: "10°C drizzle" },
            { icon: "📍", label: "Café district" },
            { icon: "⏱", label: "12 min free" },
          ]}
        />

        <OfferCard offer={primary} onPress={() => router.push(`/offer/${primary.id}`)} />

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
          <Button
            label="🔔 Demo: send push in 2s"
            variant="secondary"
            onPress={() => fireDemoOfferNotification(primary)}
          />
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
