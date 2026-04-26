import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { useLocation } from "@/hooks/useLocation";
import { api, type EventItem } from "@/lib/api";
import { theme } from "@/lib/theme";

export default function EventsScreen() {
  const loc = useLocation();
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loc.coords) return;
    setError(null);
    api
      .events(loc.coords, 15, 60)
      .then((r) => setEvents(r.events))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [loc.coords]);

  const recommended = useMemo(() => rankRecommended(events ?? []), [events]);

  const isLoading = !loc.coords || events === null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingVertical: 20, paddingBottom: 40, gap: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, gap: 4 }}>
          <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: "700" }}>
            Events
          </Text>
          <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>
            {error
              ? `Backend: ${error}`
              : isLoading
                ? "Loading nearby events…"
                : `${events?.length ?? 0} events within 15 km`}
          </Text>
        </View>

        {isLoading ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <ActivityIndicator color={theme.colors.accent} />
          </View>
        ) : null}

        {recommended.length > 0 ? (
          <View style={{ gap: 10 }}>
            <SectionHeader title="Recommended" subtitle="Close · happening soon" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
            >
              {recommended.map((ev) => (
                <RecommendedCard key={ev.id} event={ev} />
              ))}
            </ScrollView>
          </View>
        ) : null}

        {events && events.length > 0 ? (
          <View style={{ gap: 10 }}>
            <SectionHeader title="All events" subtitle={`${events.length} total`} />
            <View style={{ paddingHorizontal: 20, gap: 10 }}>
              {events.map((ev) => (
                <EventRow key={ev.id} event={ev} />
              ))}
            </View>
          </View>
        ) : null}

        {!isLoading && !error && events?.length === 0 ? (
          <Text
            style={{
              paddingHorizontal: 20,
              color: theme.colors.textDim,
              fontSize: 13,
            }}
          >
            No events found in this area. Try a wider radius later.
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View
      style={{
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "baseline",
        justifyContent: "space-between",
      }}
    >
      <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "700" }}>{title}</Text>
      {subtitle ? (
        <Text style={{ color: theme.colors.textDim, fontSize: 12 }}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

function RecommendedCard({ event }: { event: EventItem }) {
  return (
    <Pressable
      onPress={() => openUrl(event.url)}
      style={({ pressed }) => ({
        width: 240,
        borderRadius: theme.radius.lg,
        overflow: "hidden",
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      {event.image ? (
        <Image source={{ uri: event.image }} style={{ width: "100%", height: 130 }} />
      ) : (
        <View
          style={{
            height: 130,
            backgroundColor: theme.colors.cardElevated,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 32 }}>🎟️</Text>
        </View>
      )}
      <View style={{ padding: 12, gap: 4 }}>
        <Text
          numberOfLines={2}
          style={{ color: theme.colors.text, fontSize: 14, fontWeight: "600" }}
        >
          {event.name}
        </Text>
        <Text numberOfLines={1} style={{ color: theme.colors.textMuted, fontSize: 12 }}>
          {[event.venue?.name, formatDate(event.startLocal ?? event.start)]
            .filter(Boolean)
            .join(" · ")}
        </Text>
        <Text style={{ color: theme.colors.accent, fontSize: 11, fontWeight: "600" }}>
          {[event.segment, event.venue?.distanceKm != null ? formatKm(event.venue.distanceKm) : null]
            .filter(Boolean)
            .join(" · ")}
        </Text>
      </View>
    </Pressable>
  );
}

function EventRow({ event }: { event: EventItem }) {
  return (
    <Pressable
      onPress={() => openUrl(event.url)}
      style={({ pressed }) => ({
        flexDirection: "row",
        gap: 12,
        padding: 12,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      {event.image ? (
        <Image
          source={{ uri: event.image }}
          style={{ width: 64, height: 64, borderRadius: theme.radius.sm }}
        />
      ) : (
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: theme.radius.sm,
            backgroundColor: theme.colors.cardElevated,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 24 }}>🎟️</Text>
        </View>
      )}
      <View style={{ flex: 1, gap: 2 }}>
        <Text numberOfLines={2} style={{ color: theme.colors.text, fontSize: 14, fontWeight: "600" }}>
          {event.name}
        </Text>
        <Text numberOfLines={1} style={{ color: theme.colors.textMuted, fontSize: 12 }}>
          {[event.venue?.name, event.venue?.city].filter(Boolean).join(", ") || "—"}
        </Text>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 2, flexWrap: "wrap" }}>
          <Pill text={formatDate(event.startLocal ?? event.start) ?? "TBA"} />
          {event.venue?.distanceKm != null ? <Pill text={formatKm(event.venue.distanceKm)} /> : null}
          {event.priceRange ? (
            <Pill
              text={`${event.priceRange.currency} ${Math.round(event.priceRange.min)}+`}
              tone="accent"
            />
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function Pill({ text, tone }: { text: string; tone?: "accent" }) {
  const color = tone === "accent" ? theme.colors.accent : theme.colors.textDim;
  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: theme.radius.full,
        borderWidth: 1,
        borderColor: tone === "accent" ? theme.colors.accentDark : theme.colors.border,
      }}
    >
      <Text style={{ color, fontSize: 10, fontWeight: "600" }}>{text}</Text>
    </View>
  );
}

function rankRecommended(events: EventItem[]): EventItem[] {
  return [...events]
    .filter((e) => !!e.image && e.start)
    .sort((a, b) => {
      const da = a.venue?.distanceKm ?? 999;
      const db = b.venue?.distanceKm ?? 999;
      if (da !== db) return da - db;
      const ta = a.start ? new Date(a.start).getTime() : Number.POSITIVE_INFINITY;
      const tb = b.start ? new Date(b.start).getTime() : Number.POSITIVE_INFINITY;
      return ta - tb;
    })
    .slice(0, 6);
}

function openUrl(url: string) {
  if (!url) return;
  void WebBrowser.openBrowserAsync(url);
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatKm(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}
