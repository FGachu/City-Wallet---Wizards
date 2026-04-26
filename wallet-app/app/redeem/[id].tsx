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
        <Text style={{ color: theme.colors.textMuted, fontSize: 13, fontWeight: "600" }}>
          {offer.merchantName}
        </Text>
        <Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: "700", textAlign: "center" }}>
          Show this at the counter
        </Text>

        <View
          style={{
            width: 240,
            height: 240,
            backgroundColor: "#fff",
            borderRadius: theme.radius.lg,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 8,
          }}
        >
          {/* Placeholder QR — in production: react-native-qrcode-svg encodes `token` */}
          <View
            style={{
              width: 200,
              height: 200,
              backgroundColor: "#0B0B0F",
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#F2C75C", fontSize: 11, fontWeight: "700" }}>QR PLACEHOLDER</Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: theme.colors.card,
            borderRadius: theme.radius.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
            padding: 12,
          }}
        >
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 13,
              fontFamily: "Menlo",
              letterSpacing: 1,
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
