import { ScrollView, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { theme } from "@/lib/theme";
import { mockOffers } from "@/lib/mockOffers";
import { Button } from "@/components/Button";
import { LinearGradient } from "expo-linear-gradient";

export default function OfferDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const offer = mockOffers.find((o) => o.id === id) ?? mockOffers[0];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 18 }}>
        <LinearGradient
          colors={[offer.accentColor + "55", "transparent"]}
          style={{
            height: 220,
            borderRadius: theme.radius.xl,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 96 }}>{offer.imageEmoji}</Text>
        </LinearGradient>

        <View style={{ gap: 6 }}>
          <Text style={{ color: theme.colors.textMuted, fontSize: 13, fontWeight: "600" }}>
            {offer.merchantName} · {offer.distanceM} m
          </Text>
          <Text style={{ color: theme.colors.text, fontSize: 26, fontWeight: "700", lineHeight: 32 }}>
            {offer.emotionalHeadline}
          </Text>
          <Text style={{ color: theme.colors.textMuted, fontSize: 15, marginTop: 4 }}>
            {offer.factualSummary}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: theme.colors.card,
            borderRadius: theme.radius.lg,
            borderWidth: 1,
            borderColor: theme.colors.border,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
          }}
        >
          <View>
            <Text style={{ color: theme.colors.textMuted, fontSize: 11, fontWeight: "600" }}>
              YOU PAY
            </Text>
            <Text style={{ color: theme.colors.accent, fontSize: 28, fontWeight: "800" }}>
              €{(offer.finalCents / 100).toFixed(2)}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: theme.colors.textDim,
                fontSize: 13,
                textDecorationLine: "line-through",
              }}
            >
              €{(offer.originalCents / 100).toFixed(2)}
            </Text>
            <Text style={{ color: theme.colors.ok, fontSize: 13, fontWeight: "600" }}>
              save €{((offer.originalCents - offer.finalCents) / 100).toFixed(2)}
            </Text>
          </View>
        </View>

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
            Why this, why now
          </Text>
          {offer.contextSignals.map((s, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                paddingVertical: 6,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: theme.colors.accent,
                }}
              />
              <Text style={{ color: theme.colors.text, fontSize: 14 }}>{s}</Text>
            </View>
          ))}
        </View>

        <View style={{ gap: 10, marginTop: 8 }}>
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
