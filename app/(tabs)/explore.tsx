import { CategoryCard } from "@/components/category-card";
import { FontSize, FontWeight, Spacing } from "@/constants/layout";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useResponsive } from "@/hooks/use-responsive";
import { getCategories } from "@/services/catalog";
import type { Category } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ExploreScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const responsive = useResponsive();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const cats = await getCategories();
      setCategories(cats);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          paddingTop: insets.top + Spacing.lg,
          alignItems: "center",
        },
      ]}
    >
      <View
        style={[
          styles.header,
          {
            maxWidth: responsive.isDesktop
              ? responsive.maxContentWidth
              : undefined,
            width: "100%",
          },
        ]}
      >
        <Text style={[styles.title, { color: theme.text }]}>
          {t("browse_categories")}
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {t("explore_products")}
        </Text>
      </View>

      {loading ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            {t("loading")}
          </Text>
        </View>
      ) : !loading && categories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="folder-open-outline"
            size={48}
            color={theme.textTertiary}
          />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            {t("no_categories")}
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.primary}
            />
          }
        >
          <View
            style={[
              styles.grid,
              {
                maxWidth: responsive.isWeb
                  ? responsive.maxContentWidth
                  : undefined,
                alignSelf: responsive.isWeb
                  ? ("center" as const)
                  : ("stretch" as const),
                gap: responsive.gridGap,
                paddingHorizontal: responsive.contentPadding,
              },
            ]}
          >
            {categories.map((item) => (
              <CategoryCard
                key={item.id}
                category={item}
                columns={responsive.categoryColumns}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: Spacing.xl },
  header: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: FontWeight.heavy,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.medium,
  },
  scrollContent: {
    paddingBottom: Spacing.huge,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.medium,
  },
});
