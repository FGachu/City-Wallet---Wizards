import { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "@/lib/theme";
import type { Offer } from "@/lib/mockOffers";
import { GenUIWidgetView } from "@/components/GenUIWidget";

function nextSimulatedWindowMs() {
  // 8–22 min so demos always show an active, plausible window.
  return (8 + Math.floor(Math.random() * 15)) * 60_000;
}

function useCountdown(expiresAt: string) {
  const [now, setNow] = useState(() => Date.now());
  const [target, setTarget] = useState(() => {
    const t = new Date(expiresAt).getTime();
    return Number.isFinite(t) && t > Date.now() ? t : Date.now() + nextSimulatedWindowMs();
  });

  useEffect(() => {
    const t = new Date(expiresAt).getTime();
    if (Number.isFinite(t) && t > Date.now()) setTarget(t);
  }, [expiresAt]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (target - now <= 0) setTarget(Date.now() + nextSimulatedWindowMs());
  }, [target, now]);

  const ms = Math.max(0, target - now);
  const min = Math.floor(ms / 60_000);
  const sec = Math.floor((ms % 60_000) / 1000);
  return { min, sec, ms, label: `${min}:${sec.toString().padStart(2, "0")}` };
}

export function OfferCard({ offer, onPress }: { offer: Offer; onPress?: () => void }) {
  if (offer.widget) {
    return <GenUIWidgetView offer={offer} widget={offer.widget} onPress={onPress} />;
  }
  return <LegacyOfferCard offer={offer} onPress={onPress} />;
}

function LegacyOfferCard({ offer, onPress }: { offer: Offer; onPress?: () => void }) {
  const cd = useCountdown(offer.expiresAt);
  const expiringSoon = cd.ms < 5 * 60_000;

  return (
    <Pressable onPress={onPress} style={{ borderRadius: theme.radius.xl, overflow: "hidden" }}>
      <LinearGradient
        colors={[offer.accentColor + "33", theme.colors.card]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          padding: 20,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.xl,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: theme.radius.lg,
              backgroundColor: offer.accentColor + "44",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 32 }}>{offer.imageEmoji}</Text>
          </View>
          <View
            style={{
              backgroundColor: expiringSoon ? theme.colors.quiet : theme.colors.cardElevated,
              borderRadius: theme.radius.full,
              paddingVertical: 4,
              paddingHorizontal: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Text style={{ color: theme.colors.text, fontSize: 11, fontWeight: "600" }}>⏱</Text>
            <Text
              style={{
                color: expiringSoon ? "#fff" : theme.colors.textMuted,
                fontSize: 12,
                fontWeight: "700",
                fontVariant: ["tabular-nums"],
              }}
            >
              {cd.label}
            </Text>
          </View>
        </View>

        <Text
          style={{
            color: theme.colors.text,
            fontSize: 24,
            fontWeight: "700",
            lineHeight: 30,
            marginTop: 18,
          }}
        >
          {offer.emotionalHeadline}
        </Text>
        <Text style={{ color: theme.colors.textMuted, fontSize: 14, marginTop: 6, lineHeight: 20 }}>
          {offer.factualSummary}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10, marginTop: 18 }}>
          <Text style={{ color: theme.colors.accent, fontSize: 28, fontWeight: "800" }}>
            €{(offer.finalCents / 100).toFixed(2)}
          </Text>
          <Text
            style={{
              color: theme.colors.textDim,
              fontSize: 16,
              textDecorationLine: "line-through",
            }}
          >
            €{(offer.originalCents / 100).toFixed(2)}
          </Text>
          <View
            style={{
              backgroundColor: theme.colors.accent,
              borderRadius: theme.radius.sm,
              paddingHorizontal: 6,
              paddingVertical: 2,
            }}
          >
            <Text style={{ color: "#0B0B0F", fontSize: 11, fontWeight: "800" }}>
              −{offer.discountPct}%
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
          {offer.contextSignals.map((s, i) => (
            <View
              key={i}
              style={{
                backgroundColor: "#00000033",
                borderRadius: theme.radius.full,
                paddingVertical: 4,
                paddingHorizontal: 10,
              }}
            >
              <Text style={{ color: theme.colors.textMuted, fontSize: 11, fontWeight: "500" }}>
                {s}
              </Text>
            </View>
          ))}
        </View>
      </LinearGradient>
    </Pressable>
  );
}
