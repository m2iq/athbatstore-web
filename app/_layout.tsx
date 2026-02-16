import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider as NavThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { AlertProvider } from "@/components/ui/custom-alert";
import { ThemeProvider, useThemeControls } from "@/hooks/use-app-theme";
import "@/i18n";
import {
    registerForPushNotifications,
    setupNotificationListeners,
} from "@/services/notifications";
import { useAuthStore } from "@/stores/auth";
import React, { useEffect } from "react";
import { ActivityIndicator, Platform, View } from "react-native";

// Load fonts from CDN for web only
if (Platform.OS === "web") {
  require("./fonts.css");
  // Inject font loading styles directly
  if (typeof document !== "undefined") {
    const style = document.createElement("style");
    style.innerHTML = `
      * {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      [data-icon-set] {
        font-family: Ionicons, 'Material Icons', sans-serif;
      }
    `;
    document.head.appendChild(style);
  }
}

export const unstable_settings = {
  anchor: "(tabs)",
};

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, initialized } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    const isOnLogin = segments[0] === "login";

    if (!session && !isOnLogin) {
      router.replace("/login");
    } else if (session && isOnLogin) {
      router.replace("/(tabs)");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, initialized, segments]);

  // Show loading while auth is initializing
  if (!initialized) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

function RootNavigator() {
  const { isDark, theme } = useThemeControls();
  const { initialize, initialized } = useAuthStore();

  useEffect(() => {
    // Only initialize auth on client-side (not during SSR)
    if (
      !initialized &&
      (Platform.OS !== "web" || typeof window !== "undefined")
    ) {
      initialize();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Setup notification permissions and listeners
  useEffect(() => {
    // Register for push notifications
    registerForPushNotifications().then((token) => {
      if (token) {
        console.log("✅ Push token registered:", token);
        // TODO: Send token to your backend to store in database
        // You can call an API here to save the token for this user
      }
    });

    // Setup notification listeners
    const cleanup = setupNotificationListeners();
    return cleanup;
  }, []);

  const navTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary: theme.primary,
          background: theme.background,
          card: theme.card,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: theme.primary,
          background: theme.background,
          card: theme.card,
        },
      };

  return (
    <NavThemeProvider value={navTheme}>
      <AuthGuard>
        <Stack>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="category/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
          <Stack.Screen name="about" options={{ headerShown: false }} />
          <Stack.Screen
            name="contact-support"
            options={{ headerShown: false }}
          />
        </Stack>
      </AuthGuard>
      <StatusBar style="auto" />
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts(
    Platform.OS === "web"
      ? {} // On web, fonts are loaded via CDN
      : {
          ...Ionicons.font,
          ...FontAwesome5.font,
          ...MaterialIcons.font,
        },
  );

  // Skip font loading check on web since we use CDN
  if (!fontsLoaded && Platform.OS !== "web") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <AlertProvider>
        <RootNavigator />
      </AlertProvider>
    </ThemeProvider>
  );
}
