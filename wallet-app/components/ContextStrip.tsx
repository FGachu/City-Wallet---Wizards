import { View, Text } from "react-native";
import { theme } from "@/lib/theme";

type Signal = { icon: string; label: string };

export function ContextStrip({ signals }: { signals: Signal[] }) {
  return (
    <View
      style={{
        flexDirection: "row",
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      {signals.map((s, i) => (
        <View
          key={i}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingVertical: 6,
            paddingHorizontal: 10,
            backgroundColor: theme.colors.cardElevated,
            borderRadius: theme.radius.full,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text style={{ fontSize: 12 }}>{s.icon}</Text>
          <Text style={{ color: theme.colors.textMuted, fontSize: 12, fontWeight: "500" }}>
            {s.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
