import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { theme } from "@/lib/theme";
import { useNotifications } from "@/hooks/useNotifications";
import { ConsentGate } from "@/components/ConsentGate";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  useNotifications();

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.bg },
          headerTintColor: theme.colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="offer/[id]"
          options={{ presentation: "modal", title: "Offer" }}
        />
        <Stack.Screen name="redeem/[id]" options={{ title: "Redeem", presentation: "modal" }} />
        <Stack.Screen name="privacy" options={{ title: "Privacy", presentation: "modal" }} />
      </Stack>
      <ConsentGate />
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}
