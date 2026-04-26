import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { theme } from "@/lib/theme";
import { mockOffers } from "@/lib/mockOffers";
import { Button } from "@/components/Button";

export default function RedeemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const offer = mockOffers.find((o) => o.id === id) ?? mockOffers[0];

  const token = `CW-${offer.id.toUpperCase().slice(0, 12)}-${Math.floor(
    Date.now() / 1000,
  )
    .toString(36)
    .toUpperCase()}`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={["bottom"]}>
      <View style={{ padding: 24, gap: 20, alignItems: "center", flex: 1 }}>
        <Text style={{ color: theme.colors.textMuted, fontSize: 13, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 }}>
          {offer.merchantName}
        </Text>
        <Text style={{ color: theme.colors.text, fontSize: 26, fontWeight: "900", textAlign: "center", textTransform: "uppercase", letterSpacing: -0.5 }}>
          Show this at the counter
        </Text>

        <View
          style={{
            width: 240,
            height: 240,
            backgroundColor: "#fff",
            borderRadius: 12,
            borderWidth: 2,
            borderColor: theme.colors.accent,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 16,
          }}
        >
          {/* Placeholder QR — in production: react-native-qrcode-svg encodes `token` */}
          <View
            style={{
              width: 200,
              height: 200,
              backgroundColor: theme.colors.bg,
              borderRadius: 6,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Text style={{ color: theme.colors.accent, fontSize: 13, fontWeight: "900", letterSpacing: 1 }}>QR PLACEHOLDER</Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: theme.colors.cardElevated,
            borderRadius: 6,
            borderWidth: 1.5,
            borderColor: theme.colors.accent + "50",
            padding: 14,
            marginTop: 12,
          }}
        >
          <Text
            style={{
              color: theme.colors.accent,
              fontSize: 14,
              fontFamily: "Menlo",
              fontWeight: "bold",
              letterSpacing: 2,
              textAlign: "center",
            }}
            selectable
          >
            {token}
          </Text>
        </View>

        <Text style={{ color: theme.colors.textMuted, fontSize: 13, textAlign: "center" }}>
          Valid for the next 12 minutes. Settled via simulated Payone.
        </Text>

        <View style={{ flex: 1 }} />

        <Button label="Done" onPress={() => router.dismissTo("/(tabs)")} />
      </View>
    </SafeAreaView>
  );
}
