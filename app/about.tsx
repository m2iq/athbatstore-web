import {
    FontSize,
    FontWeight,
    Radius,
    Shadow,
    Spacing,
} from "@/constants/layout";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useResponsive } from "@/hooks/use-responsive";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FEATURES = [
  { icon: "phone-portrait" as const, color: "#3B82F6", key: "about_feature_1" },
  { icon: "stats-chart" as const, color: "#10B981", key: "about_feature_2" },
  { icon: "analytics" as const, color: "#8B5CF6", key: "about_feature_3" },
  { icon: "headset" as const, color: "#06B6D4", key: "about_feature_4" },
  {
    icon: "shield-checkmark" as const,
    color: "#10B981",
    key: "about_feature_5",
  },
  { icon: "refresh" as const, color: "#F59E0B", key: "about_feature_6" },
];

const VALUES = [
  { icon: "trophy" as const, color: "#FBBF24", key: "about_value_1" },
  { icon: "eye" as const, color: "#3B82F6", key: "about_value_2" },
  { icon: "bulb" as const, color: "#8B5CF6", key: "about_value_3" },
  { icon: "heart" as const, color: "#EF4444", key: "about_value_4" },
  { icon: "leaf" as const, color: "#10B981", key: "about_value_5" },
];

export default function AboutScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const responsive = useResponsive();

  // On small screens: show features as a vertical list
  // On larger screens: show as row
  const isSmallScreen = responsive.width < 400;

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
          <Text style={styles.headerTitle}>{t("about_us")}</Text>
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
              styles.logoCircle,
              { backgroundColor: "rgba(255,255,255,0.15)" },
            ]}
          >
            <Image
              source={require("../assets/images/logo.png")}
              style={{ width: 80, height: 80 }}
            />
          </View>
          <Text
            style={[
              styles.storeName,
              isSmallScreen && { fontSize: FontSize.title },
            ]}
          >
            {t("app_name")}
          </Text>
          <Text style={styles.storeTagline}>{t("app_tagline")}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={{
          paddingTop: Spacing.xl,
          paddingBottom: Spacing.massive + 40,
          maxWidth: responsive.isWeb ? responsive.maxContentWidth : undefined,
          alignSelf: responsive.isWeb ? ("center" as const) : undefined,
          width: "100%",
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Description Card */}
        <View
          style={[
            styles.section,
            { paddingHorizontal: responsive.contentPadding },
          ]}
        >
          <View
            style={[
              styles.descCard,
              { backgroundColor: theme.surface },
              Shadow.md,
            ]}
          >
            <Text
              style={[
                styles.descText,
                { color: theme.textSecondary },
                isSmallScreen && { fontSize: FontSize.body, lineHeight: 22 },
              ]}
            >
              {t("about_description")}
            </Text>
          </View>
        </View>

        {/* Features */}
        <View
          style={[
            styles.section,
            { paddingHorizontal: responsive.contentPadding },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.sectionIconCircle,
                { backgroundColor: `${theme.primary}15` },
              ]}
            >
              <Ionicons name="flash" size={20} color={theme.primary} />
            </View>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text },
                isSmallScreen && { fontSize: FontSize.bodyLarge },
              ]}
            >
              {t("about_features_title")}
            </Text>
          </View>
          <View
            style={[
              styles.featuresGrid,
              isSmallScreen && styles.featuresColumn,
            ]}
          >
            {FEATURES.map((feature, index) => (
              <View
                key={index}
                style={[
                  isSmallScreen ? styles.featureCardRow : styles.featureCard,
                  { backgroundColor: theme.surface },
                  Shadow.sm,
                ]}
              >
                <View
                  style={[
                    styles.featureIconCircle,
                    { backgroundColor: `${feature.color}15` },
                    isSmallScreen && { width: 44, height: 44 },
                  ]}
                >
                  <Ionicons
                    name={feature.icon}
                    size={isSmallScreen ? 20 : 24}
                    color={feature.color}
                  />
                </View>
                <Text
                  style={[
                    styles.featureTitle,
                    { color: theme.text },
                    isSmallScreen && {
                      fontSize: FontSize.small,
                      textAlign: "right" as const,
                      flex: 1,
                    },
                  ]}
                >
                  {t(feature.key)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Values */}
        <View
          style={[
            styles.section,
            { paddingHorizontal: responsive.contentPadding },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.sectionIconCircle,
                { backgroundColor: `${theme.primary}15` },
              ]}
            >
              <Ionicons name="diamond" size={20} color={theme.primary} />
            </View>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text },
                isSmallScreen && { fontSize: FontSize.bodyLarge },
              ]}
            >
              {t("about_values_title")}
            </Text>
          </View>
          <View style={styles.valuesContainer}>
            {VALUES.map((value, index) => (
              <View
                key={index}
                style={[
                  styles.valueCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.borderLight,
                  },
                  Shadow.sm,
                ]}
              >
                <View
                  style={[
                    styles.valueIconCircle,
                    { backgroundColor: `${value.color}15` },
                  ]}
                >
                  <Ionicons name={value.icon} size={20} color={value.color} />
                </View>
                <Text style={[styles.valueText, { color: theme.text }]}>
                  {t(value.key)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Version */}
        <Text style={[styles.versionText, { color: theme.textTertiary }]}>
          {t("version")} 1.0.0
        </Text>
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
  logoCircle: {
    width: 78,
    height: 78,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  storeName: {
    fontSize: FontSize.titleLarge,
    fontWeight: FontWeight.bold,
    color: "#fff",
    marginBottom: Spacing.xxs,
  },
  storeTagline: {
    fontSize: FontSize.body,
    color: "rgba(255,255,255,0.7)",
  },
  scrollContent: { flex: 1 },
  section: {
    marginBottom: Spacing.xxl,
  },
  descCard: {
    padding: Spacing.xl,
    borderRadius: Radius.xl,
  },
  descText: {
    fontSize: FontSize.bodyLarge,
    lineHeight: 26,
    textAlign: "center",
    fontWeight: FontWeight.medium,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  sectionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: FontSize.subtitle,
    fontWeight: FontWeight.bold,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    justifyContent: "space-between",
  },
  featuresColumn: {
    flexDirection: "column",
    gap: Spacing.sm,
  },
  featureCard: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
  },
  featureCardRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  featureIconCircle: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    textAlign: "center",
    lineHeight: 15,
  },
  valuesContainer: {
    gap: Spacing.sm,
  },
  valueCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
  },
  valueIconCircle: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  valueText: {
    flex: 1,
    fontSize: FontSize.body,
    fontWeight: FontWeight.medium,
    lineHeight: 22,
  },
  versionText: {
    textAlign: "center",
    fontSize: FontSize.small,
    fontWeight: FontWeight.medium,
    marginTop: Spacing.xl,
  },
});
