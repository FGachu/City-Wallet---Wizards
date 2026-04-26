import { ScrollView, View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { theme } from "@/lib/theme";
import { useLastIntent, privacyStore } from "@/lib/privacy/store";

const STAYS_ON_DEVICE = [
  "GPS coordinates (raw)",
  "Device push token",
  "Identity (name, email, phone)",
  "Movement & dwell history",
  "Transaction history",
  "Calendar / contacts",
];

const SENT_UPSTREAM = [
  "District (bounding-box, e.g. stuttgart-mitte)",
  "Time bucket (lunch, afternoon, …)",
  "Weather bucket (cold + drizzle)",
  "Density level (quiet / normal / busy)",
  "Intent category (warm-comfort, …)",
  "Optional: free-minutes hint, budget tier",
];

export default function PrivacyScreen() {
  const { lastIntent, lastSentAt } = useLastIntent();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={["top"]}>
      <Stack.Screen options={{ title: "Privacy" }} />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: 40 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text style={{ color: theme.colors.accent, fontSize: 15, fontWeight: "600" }}>‹ Back</Text>
          </Pressable>
          <Pressable onPress={() => privacyStore.clear()} hitSlop={12}>
            <Text style={{ color: theme.colors.textMuted, fontSize: 12, fontWeight: "600" }}>
              Clear
            </Text>
          </Pressable>
        </View>

        <View style={{ gap: 4 }}>
          <Text style={{ color: theme.colors.text, fontSize: 26, fontWeight: "700" }}>
            What leaves your phone
          </Text>
          <Text style={{ color: theme.colors.textMuted, fontSize: 14 }}>
            Only an abstract intent — no identity, no GPS, no history. Nothing is persisted; this
            page resets when the app closes.
          </Text>
        </View>

        <Section title="Stays on device" tone="ok">
          {STAYS_ON_DEVICE.map((s) => (
            <Bullet key={s} text={s} icon="🔒" />
          ))}
        </Section>

        <Section title="Sent upstream" tone="warn">
          {SENT_UPSTREAM.map((s) => (
            <Bullet key={s} text={s} icon="↗" />
          ))}
        </Section>

        <Section title={lastIntent ? "Last intent payload (live)" : "No intent sent yet"}>
          {lastIntent ? (
            <View style={{ padding: 12 }}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontFamily: "Courier",
                  fontSize: 12,
                  lineHeight: 18,
                }}
              >
                {JSON.stringify(lastIntent, null, 2)}
              </Text>
              {lastSentAt && (
                <Text style={{ color: theme.colors.textDim, fontSize: 11, marginTop: 8 }}>
                  Sent {new Date(lastSentAt).toLocaleTimeString()}
                </Text>
              )}
            </View>
          ) : (
            <View style={{ padding: 14 }}>
              <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>
                Open Today to trigger a generation.
              </Text>
            </View>
          )}
        </Section>

        <Text style={{ color: theme.colors.textDim, fontSize: 11, textAlign: "center" }}>
          The server rejects any payload containing PII keys (lat, lon, userId, email, …) with
          HTTP 400.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  tone,
  children,
}: {
  title: string;
  tone?: "ok" | "warn";
  children: React.ReactNode;
}) {
  const accent =
    tone === "ok" ? "#5fb37a" : tone === "warn" ? "#e0a85a" : theme.colors.textMuted;
  return (
    <View style={{ gap: 6 }}>
      <Text
        style={{
          color: accent,
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        {title}
      </Text>
      <View
        style={{
          backgroundColor: theme.colors.card,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          borderColor: theme.colors.border,
          overflow: "hidden",
        }}
      >
        {children}
      </View>
    </View>
  );
}

function Bullet({ icon, text }: { icon: string; text: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}
    >
      <Text style={{ fontSize: 14 }}>{icon}</Text>
      <Text style={{ color: theme.colors.text, fontSize: 13, flex: 1 }}>{text}</Text>
    </View>
  );
}
