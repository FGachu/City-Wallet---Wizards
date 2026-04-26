import { ScrollView, View, Text, RefreshControl, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useCallback } from "react";
import { OfferCard } from "@/components/OfferCard";
import { Button } from "@/components/Button";
import { theme } from "@/lib/theme";
import { fireDemoOfferNotification } from "@/hooks/useNotifications";
import { useLocation } from "@/hooks/useLocation";
import { useGeneratedOffers } from "@/hooks/useGeneratedOffers";
import { demoStore, useDemoState } from "@/lib/demoStore";
import { router } from "expo-router";
import { Pressable } from "react-native";

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

  const primary = offers[0];
  const others = offers.slice(1);

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
          <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: "700", lineHeight: 34 }}>
            Hey Lena 👋
          </Text>
          {context && (
            <Text style={{ color: theme.colors.textMuted, fontSize: 16, fontWeight: "500" }}>
              {context.temp ? `${Math.round(context.temp)}°C` : ""} {context.condition} {context.city ? `in ${context.city}` : ""}
            </Text>
          )}
          <Text style={{ color: theme.colors.textMuted, fontSize: 15, marginTop: 4 }}>
            One offer is tuned to your last 12 minutes.
          </Text>
        </View>

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
