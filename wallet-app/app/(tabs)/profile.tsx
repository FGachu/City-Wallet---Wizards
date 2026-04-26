import { ScrollView, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/lib/theme";
import { useNotifications } from "@/hooks/useNotifications";
import { api } from "@/lib/api";

export default function ProfileScreen() {
  const notif = useNotifications();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
        <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: "700" }}>Profile</Text>

        <Section title="Identity">
          <Row k="Name" v="Mia (demo)" />
          <Row k="City" v="Stuttgart" />
        </Section>

        <Section title="Privacy">
          <Row k="On-device personalisation" v="Phi-3 mini · enabled" />
          <Row k="Upstream signals" v="abstract intent only" />
          <Row k="GDPR consent" v="granted · 2026-04-12" />
        </Section>

        <Section title="Push notifications">
          <Row k="Permission" v={notif.permission} />
          <Row k="Token" v={notif.pushToken ? notif.pushToken.slice(0, 28) + "…" : "—"} />
          {notif.error ? <Row k="Note" v={notif.error} /> : null}
        </Section>

        <Section title="Backend">
          <Row k="Base URL" v={api.baseUrl} />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text
        style={{
          color: theme.colors.textMuted,
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

function Row({ k, v }: { k: string; v: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}
    >
      <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>{k}</Text>
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 13,
          fontWeight: "600",
          maxWidth: "60%",
          textAlign: "right",
        }}
        numberOfLines={1}
      >
        {v}
      </Text>
    </View>
  );
}
