import { OfferCard } from "@/components/OfferCard";
import { useGeneratedOffers } from "@/hooks/useGeneratedOffers";
import { useLocation } from "@/hooks/useLocation";
import { useDemoState } from "@/lib/demoStore";
import { theme } from "@/lib/theme";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Platform, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const loc = useLocation();
  const { locationMode } = useDemoState();
  const { offers, mode, source, context, regenerate } = useGeneratedOffers(loc.coords);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await regenerate();
    setRefreshing(false);
  }, [regenerate]);

  const primary = offers[0]
    ? {
      ...offers[0],
      widget: offers[0].widget ? { ...offers[0].widget, variant: "hero" as const } : undefined,
    }
    : undefined;
  const others = offers.slice(1).map((o) => ({
    ...o,
    widget: o.widget ? { ...o.widget, variant: "compact" as const } : undefined,
  }));

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
        <View style={{ gap: 4, marginBottom: 12 }}>
          <Text style={{ color: theme.colors.text, fontSize: 32, fontWeight: "900", lineHeight: 38, letterSpacing: -1, textTransform: "uppercase" }}>
            Hey Lena 👋
          </Text>
          {context && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
              <View style={{ backgroundColor: theme.colors.accent + "15", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.accent + "40" }}>
                <Text style={{ color: theme.colors.accent, fontSize: 11, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {context.temp ? `${Math.round(context.temp)}°C` : ""} {context.condition}
                </Text>
              </View>
              {context.city && (
                <Text style={{ color: theme.colors.textMuted, fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {context.city}
                </Text>
              )}
            </View>
          )}
          <Text style={{ color: theme.colors.textMuted, fontSize: 14, marginTop: 8, fontWeight: "600" }}>
            One offer is tuned to your last 12 minutes.
          </Text>
        </View>

        {Platform.OS !== "web" && (
          <ContextStrip
            signals={[
              { icon: "🌧", label: tempLabel },
              { icon: "✨", label: intentLabel },
            ]}
          />
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
          <View style={{ gap: 14, marginTop: 12 }}>
            <Text
              style={{
                color: theme.colors.text,
                fontSize: 14,
                fontWeight: "900",
                letterSpacing: 1,
                textTransform: "uppercase",
                marginBottom: 2,
              }}
            >
              Also nearby
            </Text>
            {others.map((o) => (
              <OfferCard key={o.id} offer={o} onPress={() => router.push(`/offer/${o.id}`)} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
