import {
    FontSize,
    FontWeight,
    Radius,
    Shadow,
    Spacing,
} from "@/constants/layout";
import { useAppTheme, useThemeControls } from "@/hooks/use-app-theme";
import { useResponsive } from "@/hooks/use-responsive";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SUPPORT_CHANNELS = [
  {
    key: "whatsapp",
    icon: "whatsapp" as const,
    color: "#25D366",
    darkColor: "#25D366",
    gradient: ["#25D366", "#128C7E"] as [string, string],
    url: "https://wa.me/9647719045309",
    labelKey: "support_whatsapp",
    descKey: "support_whatsapp_desc",
  },
  {
    key: "telegram",
    icon: "paper-plane" as const,
    color: "#0088CC",
    darkColor: "#34A8E0",
    gradient: ["#0088CC", "#006699"] as [string, string],
    url: "https://t.me/@sFF_s",
    labelKey: "support_telegram",
    descKey: "support_telegram_desc",
  },
  {
    key: "tiktok",
    icon: "tiktok" as const,
    color: "#000000",
    darkColor: "#FFFFFF",
    gradient: ["rgb(60,40,70)", "rgb(245,30,30)"] as [string, string],
    url: "https://www.tiktok.com/@ali_mleh",
    labelKey: "support_tiktok",
    descKey: "support_tiktok_desc",
  },
];

export default function ContactSupportScreen() {
  const theme = useAppTheme();
  const { isDark } = useThemeControls();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const responsive = useResponsive();

  const handleOpenLink = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch {
      // Silently fail
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[theme.navy, theme.navyDark] as [string, string]}
        style={[
          styles.header,
          { paddingTop: insets.top + Spacing.sm, alignItems: "center" },
        ]}
      >
        <View
          style={[
            styles.headerRow,
            {
              maxWidth: responsive.isDesktop
                ? responsive.maxContentWidth
                : undefined,
              width: "100%",
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              styles.backBtn,
              { backgroundColor: "rgba(255,255,255,0.12)" },
            ]}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("contact_support")}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View
          style={[
            styles.headerContent,
            {
              maxWidth: responsive.isDesktop
                ? responsive.maxContentWidth
                : undefined,
              width: "100%",
            },
          ]}
        >
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: "rgba(255,255,255,0.15)" },
            ]}
          >
            <Ionicons name="chatbubbles" size={36} color="#fff" />
          </View>
          <Text style={styles.headerSubtitle}>{t("contact_support_desc")}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={{
          paddingTop: Spacing.xxl,
          paddingBottom: Spacing.massive + 40,
          maxWidth: responsive.isWeb ? 600 : undefined,
          alignSelf: responsive.isWeb ? ("center" as const) : undefined,
          width: "100%",
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.channelsContainer,
            { paddingHorizontal: responsive.contentPadding },
          ]}
        >
          {SUPPORT_CHANNELS.map((channel) => {
            const iconColor = isDark ? channel.darkColor : channel.color;
            const isTikTok = channel.key === "tiktok";
            // TikTok doesn't have a built-in Ionicons logo, so use musical-note as fallback
            const iconName =
              channel.icon === "logo-tiktok"
                ? Platform.OS === "web"
                  ? ("tiktok" as const)
                  : ("tiktok" as const)
                : channel.icon;

            return (
              <TouchableOpacity
                key={channel.key}
                style={[
                  styles.channelCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: isDark
                      ? theme.borderLight
                      : "rgba(0,0,0,0.06)",
                  },
                  Shadow.lg,
                ]}
                activeOpacity={0.7}
                onPress={() => handleOpenLink(channel.url)}
              >
                <View style={styles.channelCardInner}>
                  {isTikTok ? (
                    <LinearGradient
                      colors={channel.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.channelIconBg}
                    >
                      <FontAwesome5 name={iconName} size={26} color="#fff" />
                    </LinearGradient>
                  ) : (
                    <View
                      style={[
                        styles.channelIconBg,
                        { backgroundColor: `${channel.color}15` },
                      ]}
                    >
                      <FontAwesome5
                        name={iconName}
                        size={26}
                        color={iconColor}
                      />
                    </View>
                  )}
                  <View style={styles.channelContent}>
                    <Text style={[styles.channelLabel, { color: theme.text }]}>
                      {t(channel.labelKey)}
                    </Text>
                    <Text
                      style={[
                        styles.channelDesc,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {t(channel.descKey)}
                    </Text>
                  </View>
                </View>
                <LinearGradient
                  colors={channel.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.channelButton}
                >
                  <Ionicons name="open-outline" size={16} color="#fff" />
                  <Text style={styles.channelButtonText}>{t("open")}</Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Working Hours */}
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: theme.surface,
              borderColor: isDark ? theme.borderLight : "rgba(0,0,0,0.06)",
            },
            Shadow.sm,
          ]}
        >
          <View
            style={[
              styles.infoIconBg,
              { backgroundColor: `${theme.primary}12` },
            ]}
          >
            <Ionicons name="time-outline" size={22} color={theme.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: theme.text }]}>
              {t("support_hours_title")}
            </Text>
            <Text style={[styles.infoDesc, { color: theme.textSecondary }]}>
              {t("support_hours_desc")}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: Spacing.lg,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: FontSize.title,
    fontWeight: FontWeight.bold,
    color: "#fff",
  },
  headerContent: {
    alignItems: "center",
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  headerSubtitle: {
    fontSize: FontSize.body,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  scrollContent: { flex: 1 },
  channelsContainer: {
    gap: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  channelCard: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  channelCardInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  channelIconBg: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  channelContent: {
    flex: 1,
  },
  channelLabel: {
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.bold,
    marginBottom: 4,
  },
  channelDesc: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.medium,
    lineHeight: 18,
  },
  channelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    height: 44,
    borderRadius: Radius.lg,
  },
  channelButtonText: {
    color: "#fff",
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
  },
  channelArrow: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    marginHorizontal: Spacing.xl,
    borderRadius: Radius.lg,
    gap: Spacing.md,
    borderWidth: 1,
  },
  infoIconBg: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    marginBottom: 2,
  },
  infoDesc: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.medium,
  },
});
