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
        <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: "700" }}>Wallet</Text>

        <View
          style={{
            padding: 18,
            borderRadius: theme.radius.lg,
            backgroundColor: theme.colors.card,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text style={{ color: theme.colors.textMuted, fontSize: 12, fontWeight: "600" }}>
            Saved this week
          </Text>
          <Text
            style={{
              color: theme.colors.accent,
              fontSize: 32,
              fontWeight: "800",
              marginTop: 4,
              fontVariant: ["tabular-nums"],
            }}
          >
            €{(totalSaved / 100).toFixed(2)}
          </Text>
        </View>

        <Text
          style={{
            color: theme.colors.textMuted,
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 1,
            textTransform: "uppercase",
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
              padding: 14,
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.card,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <View>
              <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: "600" }}>
                {h.merchant}
              </Text>
              <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>
                {h.item} · {h.when}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: "700" }}>
                €{(h.amount / 100).toFixed(2)}
              </Text>
              <Text style={{ color: theme.colors.ok, fontSize: 11 }}>
                saved €{(h.saved / 100).toFixed(2)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
