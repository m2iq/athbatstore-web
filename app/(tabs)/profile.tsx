import { useAlert } from "@/components/ui/custom-alert";
import {
  FontSize,
  FontWeight,
  Radius,
  Shadow,
  Spacing,
} from "@/constants/layout";
import { useAppTheme, useThemeControls } from "@/hooks/use-app-theme";
import { useResponsive } from "@/hooks/use-responsive";
import { signOut } from "@/services/auth";
import { useAuthStore } from "@/stores/auth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const theme = useAppTheme();
  const { themeMode, setThemeMode, isDark } = useThemeControls();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const { profile, reset } = useAuthStore();
  const router = useRouter();
  const { alert } = useAlert();
  const responsive = useResponsive();
  const [avatarError, setAvatarError] = React.useState(false);

  const toggleLanguage = () => {
    const langs = ["ar", "en", "ku"];
    const idx = langs.indexOf(i18n.language);
    const next = langs[(idx + 1) % langs.length];
    i18n.changeLanguage(next);
  };

  const getLangLabel = () => {
    const map: Record<string, string> = {
      ar: "العربية",
      en: "English",
      ku: "کوردی",
    };
    return map[i18n.language] ?? i18n.language;
  };

  const toggleTheme = () => {
    if (themeMode === "system") {
      setThemeMode("dark");
    } else if (themeMode === "dark") {
      setThemeMode("light");
    } else {
      setThemeMode("dark");
    }
  };

  const getThemeLabel = () => {
    if (themeMode === "dark") return t("dark_mode");
    if (themeMode === "light") return t("light_mode");
    return isDark ? t("dark_mode") : t("light_mode");
  };

  const handleLogout = () => {
    alert({
      title: t("logout"),
      message: t("logout_confirm"),
      icon: "warning",
      buttons: [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("logout"),
          style: "destructive",
          onPress: async () => {
            await signOut();
            reset();
            router.replace("/login" as any);
          },
        },
      ],
    });
  };

  const SettingItem = ({
    icon,
    label,
    subtitle,
    onPress,
    trailing,
    color,
    showChevron = true,
  }: {
    icon: string;
    label: string;
    subtitle?: string;
    onPress?: () => void;
    trailing?: React.ReactNode;
    color?: string;
    showChevron?: boolean;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.settingItem,
        { backgroundColor: theme.surface },
        Shadow.sm,
      ]}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: color ? `${color}15` : theme.tintLight },
        ]}
      >
        <Ionicons name={icon as any} size={22} color={color || theme.primary} />
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemLabel, { color: theme.text }]}>{label}</Text>
        {subtitle && (
          <Text style={[styles.itemSubtitle, { color: theme.textTertiary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {trailing ??
        (showChevron && (
          <Ionicons name="chevron-back" size={20} color={theme.textTertiary} />
        ))}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Profile Header */}
      <LinearGradient
        colors={[theme.navy, theme.navyDark] as [string, string]}
        style={[
          styles.header,
          { paddingTop: insets.top + Spacing.xl, alignItems: "center" },
        ]}
      >
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
              styles.avatar,
              {
                backgroundColor: `${theme.primary}20`,
                borderColor: theme.primary,
              },
            ]}
          >
            {profile?.avatar_url && !avatarError ? (
              <Image
                source={{ uri: profile.avatar_url, cache: "force-cache" }}
                style={styles.avatarImage}
                onError={() => setAvatarError(true)}
              />
            ) : (
              <Ionicons name="person" size={36} color={theme.primary} />
            )}
          </View>
          <Text style={styles.userName}>
            {profile?.full_name ?? t("app_name")}
          </Text>
          <Text style={styles.userEmail}>{profile?.phone ?? ""}</Text>
        </View>

        {/* Wallet Preview */}
        <View
          style={[
            {
              maxWidth: responsive.isDesktop
                ? responsive.maxContentWidth
                : undefined,
              width: "100%",
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.walletPreview,
              { backgroundColor: "rgba(255,255,255,0.1)" },
            ]}
            onPress={() => router.push("/(tabs)/wallet" as any)}
            activeOpacity={0.7}
          >
            <View style={styles.walletLeft}>
              <Ionicons name="wallet-outline" size={20} color={theme.accent} />
              <Text style={styles.walletLabel}>{t("wallet_balance")}</Text>
            </View>
            <Text style={styles.walletAmount}>
              {Number(profile?.wallet_balance ?? 0).toLocaleString()}{" "}
              {t("currency")}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={{
          paddingTop: Spacing.xl,
          paddingBottom: Spacing.massive + 20,
          maxWidth: responsive.isWeb ? responsive.maxContentWidth : undefined,
          alignSelf: responsive.isWeb ? ("center" as const) : undefined,
          width: "100%",
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            {t("account")}
          </Text>
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="person-outline"
              label={t("edit_profile")}
              color={theme.primary}
              onPress={() => router.push("/edit-profile" as any)}
            />
          </View>
        </View>

        {/* General Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            {t("general")}
          </Text>
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="language-outline"
              label={t("language")}
              subtitle={getLangLabel()}
              onPress={toggleLanguage}
              color={theme.accent}
            />
            <SettingItem
              icon={isDark ? "moon" : "sunny"}
              label={t("appearance")}
              subtitle={getThemeLabel()}
              onPress={toggleTheme}
              color={theme.primary}
              trailing={
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={theme.surface}
                  ios_backgroundColor={theme.border}
                />
              }
              showChevron={false}
            />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            {t("support")}
          </Text>
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="chatbubbles-outline"
              label={t("contact_support")}
              color="#25D366"
              onPress={() => router.push("/contact-support" as any)}
            />
            <SettingItem
              icon="information-circle-outline"
              label={t("about_us")}
              color={theme.accent}
              onPress={() => router.push("/about" as any)}
            />
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <View style={styles.settingsGroup}>
            <SettingItem
              icon="log-out-outline"
              label={t("logout")}
              onPress={handleLogout}
              color={theme.error}
              showChevron={false}
            />
          </View>
        </View>

        <Text style={[styles.versionText, { color: theme.textTertiary }]}>
          {t("version")} 1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  header: {
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },
  headerContent: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: Radius.full,
  },
  userName: {
    fontSize: FontSize.title,
    fontWeight: FontWeight.bold,
    color: "#FFFFFF",
    marginBottom: Spacing.xxs,
  },
  userEmail: {
    fontSize: FontSize.body,
    color: "rgba(255, 255, 255, 0.7)",
  },
  walletPreview: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  walletLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  walletLabel: {
    fontSize: FontSize.body,
    color: "rgba(255,255,255,0.8)",
    fontWeight: FontWeight.medium,
  },
  walletAmount: {
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.bold,
    color: "#FFFFFF",
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.bold,
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  settingsGroup: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    gap: Spacing.md,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.04)",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.semibold,
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.medium,
  },
  versionText: {
    textAlign: "center",
    fontSize: FontSize.small,
    fontWeight: FontWeight.medium,
    marginTop: Spacing.xl,
  },
});
