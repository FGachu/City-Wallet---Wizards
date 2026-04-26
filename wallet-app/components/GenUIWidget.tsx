import { useEffect, useState } from "react";
import { Pressable, Text, View, Platform } from "react-native";
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
  const bg = expiringSoon || tone === "urgent" ? theme.colors.quiet : theme.colors.bg;
  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: expiringSoon || tone === "urgent" ? theme.colors.quiet : theme.colors.border,
        paddingVertical: size === "sm" ? 2 : 4,
        paddingHorizontal: size === "sm" ? 6 : 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
      }}
    >
      <View
        style={{
          width: size === "sm" ? 4 : 6,
          height: size === "sm" ? 4 : 6,
          borderRadius: size === "sm" ? 2 : 3,
          backgroundColor: expiringSoon || tone === "urgent" ? "#fff" : theme.colors.accent,
        }}
      />
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
    <View style={{ flexDirection: "row", alignItems: "baseline", gap: 12 }}>
      <Text style={{ color: accent, fontSize: 28, fontWeight: "900", letterSpacing: -1 }}>
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
          backgroundColor: accent,
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
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
      {items.map((s, i) => (
        <View
          key={`${s}-${i}`}
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
  );
}

function HeroWidget({ offer, widget, onPress }: Props) {
  const accent = widget.palette.accent;
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1.5,
        borderColor: theme.colors.border,
        backgroundColor: widget.palette.surface ?? theme.colors.card,
        shadowColor: accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
      }}
    >
      <View style={{ height: 4, backgroundColor: accent }} />
      <View style={{ padding: 20 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 8,
              backgroundColor: accent + "15",
              borderWidth: 1,
              borderColor: accent + "40",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 26 }}>{widget.slots.emoji ?? offer.imageEmoji}</Text>
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
              fontWeight: "800",
              letterSpacing: 1,
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
            fontSize: 22,
            fontWeight: "800",
            lineHeight: 28,
            marginTop: widget.slots.kicker ? 6 : 18,
            letterSpacing: -0.4,
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
          <View style={{ marginTop: 20 }}>
            <PriceLine offer={offer} accent={accent} />
          </View>
        ) : null}

        {Platform.OS !== "web" && widget.slots.chips && widget.slots.chips.length > 0 ? (
          <View style={{ marginTop: 18 }}>
            <Chips items={widget.slots.chips} />
          </View>
        ) : null}

        <View
          style={{
            marginTop: 20,
            backgroundColor: accent,
            borderRadius: 6,
            paddingVertical: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: theme.colors.bg, fontSize: 14, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 }}>
            {widget.slots.ctaText}
          </Text>
        </View>
      </View>
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
        borderWidth: 1.5,
        borderColor: theme.colors.border,
        borderRadius: 8,
        alignItems: "center",
        borderLeftWidth: 4,
        borderLeftColor: accent,
      })}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 6,
          backgroundColor: accent + "15",
          borderWidth: 1,
          borderColor: accent + "40",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 22 }}>{widget.slots.emoji ?? offer.imageEmoji}</Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          numberOfLines={1}
          style={{ color: theme.colors.text, fontSize: 14, fontWeight: "800", letterSpacing: -0.2 }}
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
            <Text style={{ color: accent, fontSize: 16, fontWeight: "900" }}>
              €{(offer.finalCents / 100).toFixed(2)}
            </Text>
            <Text
              style={{
                color: theme.colors.textDim,
                fontSize: 12,
                textDecorationLine: "line-through",
                fontWeight: "600",
              }}
            >
              €{(offer.originalCents / 100).toFixed(2)}
            </Text>
            <View style={{ backgroundColor: accent, borderRadius: 2, paddingHorizontal: 4, paddingVertical: 1 }}>
              <Text style={{ color: theme.colors.bg, fontSize: 9, fontWeight: "900" }}>
                −{offer.discountPct}%
              </Text>
            </View>
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
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
        backgroundColor: accent,
        padding: 14,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: theme.colors.bg,
        shadowColor: accent,
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 0,
      })}
    >
      <Text style={{ fontSize: 26 }}>{widget.slots.emoji ?? offer.imageEmoji}</Text>
      <Text style={{ flex: 1, color: theme.colors.bg, fontSize: 14, fontWeight: "900", letterSpacing: -0.2 }}>
        {widget.slots.headline}
      </Text>
      <View
        style={{
          backgroundColor: theme.colors.bg,
          borderRadius: 4,
          paddingVertical: 6,
          paddingHorizontal: 10,
        }}
      >
        <Text style={{ color: accent, fontSize: 11, fontWeight: "900", textTransform: "uppercase" }}>
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
        gap: 12,
        padding: 14,
        backgroundColor: widget.palette.surface ?? theme.colors.cardElevated,
        borderWidth: 1.5,
        borderColor: theme.colors.border,
        borderLeftWidth: 4,
        borderLeftColor: accent,
        borderRadius: 8,
      })}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 6,
          backgroundColor: accent + "15",
          borderWidth: 1,
          borderColor: accent + "40",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 22 }}>{widget.slots.emoji ?? offer.imageEmoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        {widget.slots.kicker ? (
          <Text
            style={{
              color: accent,
              fontSize: 10,
              fontWeight: "800",
              letterSpacing: 1,
              textTransform: "uppercase",
              marginBottom: 2,
            }}
          >
            {widget.slots.kicker}
          </Text>
        ) : null}
        <Text
          numberOfLines={1}
          style={{ color: theme.colors.text, fontSize: 14, fontWeight: "800", letterSpacing: -0.2 }}
        >
          {widget.slots.headline}
        </Text>
        {widget.slots.showPrice !== false ? (
          <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 2, fontWeight: "600" }}>
            €{(offer.finalCents / 100).toFixed(2)} · <Text style={{ color: accent }}>−{offer.discountPct}%</Text>
          </Text>
        ) : null}
      </View>
      <View style={{ backgroundColor: theme.colors.bg, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4, borderWidth: 1, borderColor: theme.colors.border }}>
        <Text style={{ color: accent, fontSize: 11, fontWeight: "900", textTransform: "uppercase" }}>
          {widget.slots.ctaText}
        </Text>
      </View>
    </Pressable>
  );
}
