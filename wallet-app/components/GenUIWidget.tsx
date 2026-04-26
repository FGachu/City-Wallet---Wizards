import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "@/lib/theme";
import type { GenUIWidget } from "@/lib/genui/types";
import type { Offer } from "@/lib/mockOffers";

function nextSimulatedWindowMs() {
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
  return { ms, label: `${min}:${sec.toString().padStart(2, "0")}` };
}

type Props = {
  offer: Offer;
  widget: GenUIWidget;
  onPress?: () => void;
};

export function GenUIWidgetView({ offer, widget, onPress }: Props) {
  switch (widget.variant) {
    case "hero":
      return <HeroWidget offer={offer} widget={widget} onPress={onPress} />;
    case "compact":
      return <CompactWidget offer={offer} widget={widget} onPress={onPress} />;
    case "sticker":
      return <StickerWidget offer={offer} widget={widget} onPress={onPress} />;
    case "banner":
      return <BannerWidget offer={offer} widget={widget} onPress={onPress} />;
  }
}

function CountdownPill({
  expiresAt,
  tone,
  size = "md",
}: {
  expiresAt: string;
  tone: "factual" | "emotional" | "playful" | "urgent";
  size?: "sm" | "md";
}) {
  const cd = useCountdown(expiresAt);
  const expiringSoon = cd.ms < 5 * 60_000;
  const bg = expiringSoon || tone === "urgent" ? theme.colors.quiet : theme.colors.cardElevated;
  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: theme.radius.full,
        paddingVertical: size === "sm" ? 2 : 4,
        paddingHorizontal: size === "sm" ? 8 : 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
      }}
    >
      <Text style={{ color: theme.colors.text, fontSize: size === "sm" ? 9 : 11, fontWeight: "600" }}>
        ⏱
      </Text>
      <Text
        style={{
          color: expiringSoon || tone === "urgent" ? "#fff" : theme.colors.textMuted,
          fontSize: size === "sm" ? 10 : 12,
          fontWeight: "700",
          fontVariant: ["tabular-nums"],
        }}
      >
        {cd.label}
      </Text>
    </View>
  );
}

function PriceLine({ offer, accent }: { offer: Offer; accent: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
      <Text style={{ color: accent, fontSize: 26, fontWeight: "800" }}>
        €{(offer.finalCents / 100).toFixed(2)}
      </Text>
      <Text
        style={{
          color: theme.colors.textDim,
          fontSize: 15,
          textDecorationLine: "line-through",
        }}
      >
        €{(offer.originalCents / 100).toFixed(2)}
      </Text>
      <View
        style={{
          backgroundColor: accent,
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
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
      {items.map((s, i) => (
        <View
          key={`${s}-${i}`}
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
  );
}

function HeroWidget({ offer, widget, onPress }: Props) {
  const accent = widget.palette.accent;
  return (
    <Pressable onPress={onPress} style={{ borderRadius: theme.radius.xl, overflow: "hidden" }}>
      <LinearGradient
        colors={[accent + "33", widget.palette.surface ?? theme.colors.card]}
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
              backgroundColor: accent + "44",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 32 }}>{widget.slots.emoji ?? offer.imageEmoji}</Text>
          </View>
          {widget.slots.showCountdown !== false ? (
            <CountdownPill expiresAt={offer.expiresAt} tone={widget.tone} />
          ) : null}
        </View>

        {widget.slots.kicker ? (
          <Text
            style={{
              color: accent,
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 0.6,
              textTransform: "uppercase",
              marginTop: 18,
            }}
          >
            {widget.slots.kicker}
          </Text>
        ) : null}
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 24,
            fontWeight: "700",
            lineHeight: 30,
            marginTop: widget.slots.kicker ? 4 : 18,
          }}
        >
          {widget.slots.headline}
        </Text>
        {widget.slots.subhead ? (
          <Text style={{ color: theme.colors.textMuted, fontSize: 14, marginTop: 6, lineHeight: 20 }}>
            {widget.slots.subhead}
          </Text>
        ) : null}

        {widget.slots.showPrice !== false ? (
          <View style={{ marginTop: 18 }}>
            <PriceLine offer={offer} accent={accent} />
          </View>
        ) : null}

        {widget.slots.chips && widget.slots.chips.length > 0 ? (
          <View style={{ marginTop: 14 }}>
            <Chips items={widget.slots.chips} />
          </View>
        ) : null}

        <View
          style={{
            marginTop: 18,
            backgroundColor: accent,
            borderRadius: theme.radius.md,
            paddingVertical: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#0B0B0F", fontSize: 14, fontWeight: "800" }}>
            {widget.slots.ctaText}
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

function CompactWidget({ offer, widget, onPress }: Props) {
  const accent = widget.palette.accent;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.85 : 1,
        flexDirection: "row",
        gap: 12,
        padding: 14,
        backgroundColor: widget.palette.surface ?? theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.lg,
        alignItems: "center",
      })}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: theme.radius.md,
          backgroundColor: accent + "33",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 22 }}>{widget.slots.emoji ?? offer.imageEmoji}</Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          numberOfLines={1}
          style={{ color: theme.colors.text, fontSize: 14, fontWeight: "700" }}
        >
          {widget.slots.headline}
        </Text>
        {widget.slots.subhead ? (
          <Text
            numberOfLines={1}
            style={{ color: theme.colors.textMuted, fontSize: 12 }}
          >
            {widget.slots.subhead}
          </Text>
        ) : null}
        {widget.slots.showPrice !== false ? (
          <View style={{ flexDirection: "row", gap: 6, alignItems: "baseline", marginTop: 2 }}>
            <Text style={{ color: accent, fontSize: 15, fontWeight: "800" }}>
              €{(offer.finalCents / 100).toFixed(2)}
            </Text>
            <Text
              style={{
                color: theme.colors.textDim,
                fontSize: 12,
                textDecorationLine: "line-through",
              }}
            >
              €{(offer.originalCents / 100).toFixed(2)}
            </Text>
            <Text style={{ color: theme.colors.textDim, fontSize: 11, fontWeight: "700" }}>
              −{offer.discountPct}%
            </Text>
          </View>
        ) : null}
      </View>
      {widget.slots.showCountdown !== false ? (
        <CountdownPill expiresAt={offer.expiresAt} tone={widget.tone} size="sm" />
      ) : null}
    </Pressable>
  );
}

function StickerWidget({ offer, widget, onPress }: Props) {
  const accent = widget.palette.accent;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.85 : 1,
        alignSelf: "flex-start",
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
        backgroundColor: accent,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: theme.radius.full,
      })}
    >
      <Text style={{ fontSize: 18 }}>{widget.slots.emoji ?? offer.imageEmoji}</Text>
      <Text style={{ color: "#0B0B0F", fontSize: 13, fontWeight: "800" }}>
        {widget.slots.headline}
      </Text>
      <View
        style={{
          backgroundColor: "#0B0B0F",
          borderRadius: theme.radius.full,
          paddingVertical: 3,
          paddingHorizontal: 8,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>
          {widget.slots.ctaText}
        </Text>
      </View>
    </Pressable>
  );
}

function BannerWidget({ offer, widget, onPress }: Props) {
  const accent = widget.palette.accent;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.85 : 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: widget.palette.surface ?? theme.colors.cardElevated,
        borderLeftWidth: 4,
        borderLeftColor: accent,
        borderRadius: theme.radius.md,
      })}
    >
      <Text style={{ fontSize: 22 }}>{widget.slots.emoji ?? offer.imageEmoji}</Text>
      <View style={{ flex: 1 }}>
        {widget.slots.kicker ? (
          <Text
            style={{
              color: accent,
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 0.6,
              textTransform: "uppercase",
            }}
          >
            {widget.slots.kicker}
          </Text>
        ) : null}
        <Text
          numberOfLines={1}
          style={{ color: theme.colors.text, fontSize: 13, fontWeight: "700" }}
        >
          {widget.slots.headline}
        </Text>
        {widget.slots.showPrice !== false ? (
          <Text style={{ color: theme.colors.textMuted, fontSize: 11, marginTop: 1 }}>
            €{(offer.finalCents / 100).toFixed(2)} · −{offer.discountPct}%
          </Text>
        ) : null}
      </View>
      <Text style={{ color: accent, fontSize: 12, fontWeight: "800" }}>
        {widget.slots.ctaText} →
      </Text>
    </Pressable>
  );
}
