import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// ─── Notification Configuration ─────────────────────────────────────────────
// This configures how notifications are displayed when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions from the user
 * Returns the Expo Push Token if successful
 */
export async function registerForPushNotifications(): Promise<string | null> {
  // Web doesn't support push notifications fully yet
  if (Platform.OS === "web") {
    console.log("[Notifications] Push notifications not supported on web");
    return null;
  }

  // Only works on physical devices
  if (!Device.isDevice) {
    console.log("Push notifications only work on physical devices");
    return null;
  }

  try {
    // Check existing permissions
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Ask for permissions if not granted
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // If still not granted, return null
    if (finalStatus !== "granted") {
      console.log("Notification permissions not granted");
      return null;
    }

    // Get the Expo Push Token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: "72c3f094-ba54-478e-acda-76a1bf92cda8", // From app.json
    });

    // Android-specific channel setup (required for Android 8.0+)
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#0066CC",
        sound: "default",
      });

      await Notifications.setNotificationChannelAsync("orders", {
        name: "Orders",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#0066CC",
        sound: "default",
      });
    }

    console.log("✅ Push token:", tokenData.data);
    return tokenData.data;
  } catch (error) {
    console.error("Error registering for push notifications:", error);
    return null;
  }
}

/**
 * Check if notification permissions are granted
 */
export async function checkNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) return false;

  const { status } = await Notifications.getPermissionsAsync();
  return status === "granted";
}

/**
 * Schedule a local notification (for testing or local alerts)
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>,
) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: "default",
      },
      trigger: null, // Show immediately
    });
  } catch (error) {
    console.error("Error scheduling local notification:", error);
  }
}

/**
 * Get Expo Push Token (after permissions granted)
 */
export async function getExpoPushToken(): Promise<string | null> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") return null;

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: "72c3f094-ba54-478e-acda-76a1bf92cda8",
    });

    return tokenData.data;
  } catch (error) {
    console.error("Error getting push token:", error);
    return null;
  }
}

/**
 * Set up notification listeners
 * Call this in your root component
 */
export function setupNotificationListeners() {
  // Web doesn't support push notifications fully yet
  if (Platform.OS === "web") {
    console.log("[Notifications] Skipping setup on web platform");
    return () => {};
  }

  // Notification received while app is in foreground
  const receivedSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log("📬 Notification received:", notification);
    },
  );

  // User tapped on notification
  const responseSubscription =
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("👆 Notification tapped:", response);
      // You can navigate to specific screens based on notification data here
      const data = response.notification.request.content.data;
      if (data?.orderId) {
        // Navigate to order details
        console.log("Navigate to order:", data.orderId);
      }
    });

  // Return cleanup function
  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}
