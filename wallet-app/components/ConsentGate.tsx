import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { privacyStore, useLastIntent } from "@/lib/privacy/store";
import { theme } from "@/lib/theme";

export function ConsentGate() {
  const { consentGivenAt } = useLastIntent();
  if (consentGivenAt) return null;

  return (
    <View
      pointerEvents="auto"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.85)",
        justifyContent: "center",
        padding: 24,
        zIndex: 100,
      }}
    >
      <View
        style={{
          backgroundColor: theme.colors.card,
          borderRadius: 16,
          padding: 20,
          gap: 12,
        }}
      >
        <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: "700" }}>
          Privacy at a glance
        </Text>
        <Text style={{ color: theme.colors.textMuted, fontSize: 14, lineHeight: 20 }}>
          City Wallet keeps personal data on your device. We send only an{" "}
          <Text style={{ color: theme.colors.text, fontWeight: "600" }}>
            anonymized context
          </Text>{" "}
          to our servers — district, time bucket, weather bucket, intent. No identity, no
          precise location, no history.
        </Text>
        <Text style={{ color: theme.colors.textMuted, fontSize: 13, lineHeight: 18 }}>
          Coordinates used for nearby lookups are coarsened to ~110 m before leaving the
          device. Nothing is stored across app launches.
        </Text>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
          <Pressable
            onPress={() => {
              privacyStore.acknowledgeConsent();
              router.push("/privacy");
            }}
            style={{
              flex: 1,
              borderColor: theme.colors.border,
              borderWidth: 1,
              borderRadius: 10,
              padding: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: theme.colors.text, fontWeight: "600" }}>Read details</Text>
          </Pressable>
          <Pressable
            onPress={() => privacyStore.acknowledgeConsent()}
            style={{
              flex: 1,
              backgroundColor: theme.colors.accent,
              borderRadius: 10,
              padding: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#000", fontWeight: "700" }}>Got it</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
