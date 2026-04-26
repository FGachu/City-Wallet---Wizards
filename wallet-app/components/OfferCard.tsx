import { useEffect, useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
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
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1.5,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.card,
        shadowColor: theme.colors.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
      }}
    >
      <View style={{ height: 4, backgroundColor: offer.accentColor || theme.colors.accent }} />
      <View style={{ padding: 20 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 8,
              backgroundColor: (offer.accentColor || theme.colors.accent) + "15",
              borderWidth: 1,
              borderColor: (offer.accentColor || theme.colors.accent) + "40",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 26 }}>{offer.imageEmoji}</Text>
          </View>
          <View
            style={{
              backgroundColor: expiringSoon ? theme.colors.quiet : theme.colors.bg,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: expiringSoon ? theme.colors.quiet : theme.colors.border,
              paddingVertical: 4,
              paddingHorizontal: 8,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: expiringSoon ? "#fff" : theme.colors.accent,
              }}
            />
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
            fontSize: 22,
            fontWeight: "800",
            lineHeight: 28,
            marginTop: 18,
            letterSpacing: -0.4,
          }}
        >
          {offer.emotionalHeadline}
        </Text>
        <Text style={{ color: theme.colors.textMuted, fontSize: 14, marginTop: 6, lineHeight: 20 }}>
          {offer.factualSummary}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 12, marginTop: 20 }}>
          <Text style={{ color: theme.colors.accent, fontSize: 28, fontWeight: "900", letterSpacing: -1 }}>
            €{(offer.finalCents / 100).toFixed(2)}
          </Text>
          <Text
            style={{
              color: theme.colors.textDim,
              fontSize: 15,
              textDecorationLine: "line-through",
              fontWeight: "600",
            }}
          >
            €{(offer.originalCents / 100).toFixed(2)}
          </Text>
          <View
            style={{
              backgroundColor: theme.colors.accent,
              borderRadius: 4,
              paddingHorizontal: 6,
              paddingVertical: 2,
            }}
          >
            <Text style={{ color: theme.colors.bg, fontSize: 11, fontWeight: "900", textTransform: "uppercase" }}>
              SAVE {offer.discountPct}%
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
          {offer.contextSignals.map((s, i) => (
            <View
              key={i}
              style={{
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: 4,
                paddingVertical: 4,
                paddingHorizontal: 8,
                backgroundColor: theme.colors.bg,
              }}
            >
              <Text style={{ color: theme.colors.textMuted, fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 }}>
                {s}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

