import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { router } from "expo-router";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("offers", {
    name: "Local offers",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#F2C75C",
    sound: "default",
  });
}

async function registerCategories() {
  if (Platform.OS === "web") return;
  await Notifications.setNotificationCategoryAsync("offer", [
    { identifier: "ACCEPT", buttonTitle: "Claim", options: { opensAppToForeground: true } },
    { identifier: "DISMISS", buttonTitle: "Not now", options: { isDestructive: true } },
  ]);
}

export type NotificationsState = {
  pushToken: string | null;
  permission: Notifications.PermissionStatus;
  error: string | null;
};

export function useNotifications() {
  const [state, setState] = useState<NotificationsState>({
    pushToken: null,
    permission: Notifications.PermissionStatus.UNDETERMINED,
    error: null,
  });
  const tapSub = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    let mounted = true;

    if (Platform.OS === "web") {
      setState((s) => ({ ...s, error: "Push notifications are not available on web." }));
      return;
    }

    (async () => {
      await ensureAndroidChannel();
      await registerCategories();

      if (!Device.isDevice) {
        if (mounted)
          setState((s) => ({
            ...s,
            error: "Push notifications need a real device (simulator can still show local).",
          }));
        return;
      }

      const existing = await Notifications.getPermissionsAsync();
      let status = existing.status;
      if (status !== "granted") {
        const req = await Notifications.requestPermissionsAsync();
        status = req.status;
      }
      if (!mounted) return;
      setState((s) => ({ ...s, permission: status }));

      if (status !== "granted") return;

      try {
        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          Constants.easConfig?.projectId;
        const token = await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : undefined,
        );
        if (mounted) setState((s) => ({ ...s, pushToken: token.data }));
      } catch (err) {
        if (mounted)
          setState((s) => ({ ...s, error: err instanceof Error ? err.message : String(err) }));
      }
    })();

    tapSub.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as { offerId?: string } | undefined;
      if (data?.offerId) router.push(`/offer/${data.offerId}`);
    });

    return () => {
      mounted = false;
      tapSub.current?.remove();
    };
  }, []);

  return state;
}

export async function fireDemoOfferNotification(offer: {
  id: string;
  merchantName: string;
  productName: string;
  emotionalHeadline: string;
  discountPct: number;
}) {
  if (Platform.OS === "web") return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: offer.emotionalHeadline,
      body: `${offer.discountPct}% off ${offer.productName} at ${offer.merchantName}`,
      data: { offerId: offer.id },
      categoryIdentifier: "offer",
      sound: "default",
    },
    trigger: { seconds: 2, channelId: "offers" } as Notifications.TimeIntervalTriggerInput,
  });
}
