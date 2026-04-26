import { ScrollView, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { theme } from "@/lib/theme";
import { mockOffers } from "@/lib/mockOffers";
import { offerStore } from "@/lib/offerStore";
import { Button } from "@/components/Button";
import { LinearGradient } from "expo-linear-gradient";

export default function OfferDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const offer =
    (id ? offerStore.findById(id) : undefined) ??
    mockOffers.find((o) => o.id === id) ??
    mockOffers[0];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }}>
        <View
          style={{
            height: 220,
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: offer.accentColor + "40",
            backgroundColor: offer.accentColor + "15",
            alignItems: "center",
            justifyContent: "center",
            borderBottomWidth: 4,
            borderBottomColor: offer.accentColor,
          }}
        >
          <Text style={{ fontSize: 96 }}>{offer.imageEmoji}</Text>
        </View>

        <View style={{ gap: 8, marginTop: 4 }}>
          <View style={{ alignSelf: "flex-start", backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
            <Text style={{ color: theme.colors.textMuted, fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 }}>
              {offer.merchantName} · {offer.distanceM} m
            </Text>
          </View>
          <Text style={{ color: theme.colors.text, fontSize: 32, fontWeight: "900", lineHeight: 36, letterSpacing: -0.5 }}>
            {offer.emotionalHeadline}
          </Text>
          <Text style={{ color: theme.colors.textMuted, fontSize: 15, marginTop: 4, lineHeight: 22 }}>
            {offer.factualSummary}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: theme.colors.card,
            borderRadius: 8,
            borderWidth: 1.5,
            borderColor: theme.colors.border,
            padding: 20,
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.accent,
          }}
        >
          <View>
            <Text style={{ color: theme.colors.textMuted, fontSize: 11, fontWeight: "800", textTransform: "uppercase" }}>
              YOU PAY
            </Text>
            <Text style={{ color: theme.colors.accent, fontSize: 32, fontWeight: "900", letterSpacing: -1 }}>
              €{(offer.finalCents / 100).toFixed(2)}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: theme.colors.textDim,
                fontSize: 14,
                textDecorationLine: "line-through",
                fontWeight: "600",
              }}
            >
              €{(offer.originalCents / 100).toFixed(2)}
            </Text>
            <Text style={{ color: theme.colors.ok, fontSize: 13, fontWeight: "800", textTransform: "uppercase" }}>
              save €{((offer.originalCents - offer.finalCents) / 100).toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 14,
              fontWeight: "900",
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            Why this, why now
          </Text>
          <View style={{ gap: 8 }}>
            {offer.contextSignals.map((s, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  backgroundColor: theme.colors.cardElevated,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    backgroundColor: theme.colors.accent,
                  }}
                />
                <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: "600" }}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ gap: 12, marginTop: 12 }}>
          <Button
            label="Claim & redeem"
            onPress={() => router.push(`/redeem/${offer.id}`)}
          />
          <Button label="Save for later" variant="secondary" />
          <Button label="Not interested" variant="ghost" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
