import { ScrollView, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/lib/theme";

const history = [
  { id: "h1", merchant: "Café Müller", item: "Cappuccino", amount: 304, when: "Yesterday 14:22", saved: 76 },
  { id: "h2", merchant: "Bäckerei Brot", item: "Brezel", amount: 180, when: "Mon 09:10", saved: 30 },
];

export default function WalletScreen() {
  const totalSaved = history.reduce((acc, h) => acc + h.saved, 0);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <Text style={{ color: theme.colors.text, fontSize: 32, fontWeight: "900", letterSpacing: -1, textTransform: "uppercase" }}>Wallet</Text>

        <View
          style={{
            padding: 20,
            borderRadius: 8,
            backgroundColor: theme.colors.cardElevated,
            borderWidth: 1.5,
            borderColor: theme.colors.border,
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.accent,
          }}
        >
          <Text style={{ color: theme.colors.textMuted, fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1 }}>
            Saved this week
          </Text>
          <Text
            style={{
              color: theme.colors.accent,
              fontSize: 36,
              fontWeight: "900",
              marginTop: 4,
              fontVariant: ["tabular-nums"],
              letterSpacing: -1,
            }}
          >
            €{(totalSaved / 100).toFixed(2)}
          </Text>
        </View>

        <Text
          style={{
            color: theme.colors.text,
            fontSize: 14,
            fontWeight: "900",
            letterSpacing: 1,
            textTransform: "uppercase",
            marginTop: 8,
          }}
        >
          History
        </Text>

        {history.map((h) => (
          <View
            key={h.id}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 16,
              borderRadius: 8,
              backgroundColor: theme.colors.card,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <View>
              <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "800", letterSpacing: -0.2 }}>
                {h.merchant}
              </Text>
              <Text style={{ color: theme.colors.textMuted, fontSize: 13, marginTop: 2, fontWeight: "600" }}>
                {h.item} · {h.when}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "900" }}>
                €{(h.amount / 100).toFixed(2)}
              </Text>
              <Text style={{ color: theme.colors.ok, fontSize: 11, fontWeight: "800", textTransform: "uppercase" }}>
                saved €{(h.saved / 100).toFixed(2)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
