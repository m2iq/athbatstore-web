import { HapticTab } from "@/components/haptic-tab";
import { Radius, Shadow, Spacing } from "@/constants/layout";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useResponsive } from "@/hooks/use-responsive";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notifications";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const theme = useAppTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const responsive = useResponsive();
  const isDesktopWeb = Platform.OS === "web" && responsive.isDesktop;
  const tabBarWidth = isDesktopWeb
    ? Math.min(responsive.maxContentWidth, responsive.width - Spacing.xl * 2)
    : undefined;
  const { session } = useAuthStore();
  const { unreadCount, startListening, loadUnreadCount } =
    useNotificationStore();

  useEffect(() => {
    if (!session?.user?.id) return;
    loadUnreadCount(session.user.id);
    const unsubscribe = startListening(session.user.id);
    return unsubscribe;
  }, [session?.user?.id, loadUnreadCount, startListening]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopWidth: 0,
          height:
            Platform.OS === "web"
              ? 80
              : Platform.OS === "ios"
                ? 50 + insets.bottom
                : 10 + insets.bottom,
          paddingBottom: Platform.OS === "web" ? 0 : insets.bottom,
          paddingTop: 8,
          paddingHorizontal: Spacing.lg,
          position: "absolute",
          // Center the bar on desktop web by explicit width + translateX
          maxWidth: isDesktopWeb ? tabBarWidth : undefined,
          width: isDesktopWeb ? tabBarWidth : undefined,
          marginHorizontal: isDesktopWeb
            ? 0
            : Platform.OS === "ios"
              ? 0
              : Platform.OS === "web"
                ? 5
                : 10,
          bottom: Platform.OS === "ios" ? 0 : Platform.OS === "web" ? 10 : 40,
          marginBottom: Platform.OS === "web" ? 0 : 15,
          left: isDesktopWeb ? "50%" : Platform.OS === "ios" ? 0 : Spacing.lg,
          right: isDesktopWeb
            ? undefined
            : Platform.OS === "ios"
              ? 0
              : Spacing.lg,
          transform: isDesktopWeb
            ? [{ translateX: -(tabBarWidth ?? 0) / 2 }]
            : undefined,
          borderRadius: Platform.OS === "ios" ? 0 : Radius.xl,
          ...Shadow.lg,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("home"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={focused ? 26 : 24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t("categories"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"}
              size={focused ? 26 : 24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: t("wallet"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "wallet" : "wallet-outline"}
              size={focused ? 26 : 24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t("my_orders"),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: theme.primary,
            fontSize: 10,
            fontWeight: "700",
            minWidth: 18,
            height: 18,
            lineHeight: 18,
          },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "receipt" : "receipt-outline"}
              size={focused ? 26 : 24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("profile"),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={focused ? 26 : 24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
