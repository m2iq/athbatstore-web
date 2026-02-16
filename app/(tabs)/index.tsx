import { CategoryCard } from "@/components/category-card";
import { ProductCard } from "@/components/product-card";
import { SearchBar } from "@/components/search-bar";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import {
  FontSize,
  FontWeight,
  LetterSpacing,
  Radius,
  Shadow,
  Spacing,
} from "@/constants/layout";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useResponsive } from "@/hooks/use-responsive";
import {
  getCategories,
  getFeaturedProducts,
  getProducts,
} from "@/services/catalog";
import type { Category, Product } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const responsive = useResponsive();

  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setError(false);
      const [cats, feat] = await Promise.all([
        getCategories(),
        getFeaturedProducts(8),
      ]);
      setCategories(cats);
      setFeatured(feat);
    } catch {
      setError(true);
      setCategories([]);
      setFeatured([]);
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

  const handleSearch = useCallback(async () => {
    if (!search.trim()) return setSearchResults([]);
    try {
      const results = await getProducts({ search: search.trim(), limit: 20 });
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.length >= 2) handleSearch();
      else setSearchResults([]);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, handleSearch]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Premium Gradient Header */}
      <LinearGradient
        colors={["#011d29", "#023047"] as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[
          styles.darkHeader,
          {
            paddingTop: insets.top + Spacing.md,
            alignItems: "center",
          },
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
          <View style={styles.headerLogoRow}>
            <View style={styles.logoContainer}>
              <Image
                source={require("@/assets/images/logo.png")}
                style={styles.headerLogo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.headerTextSection}>
              <Text style={styles.appName} numberOfLines={1}>
                {t("app_name")}
              </Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View
          style={[
            styles.headerSearch,
            {
              maxWidth: responsive.isDesktop
                ? responsive.maxContentWidth
                : undefined,
              width: "100%",
            },
          ]}
        >
          <SearchBar
            value={search}
            onChangeText={setSearch}
            onSubmit={handleSearch}
          />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={{ paddingBottom: Spacing.massive + 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
      >
        {/* Gradient Banner */}
        <View
          style={[
            styles.bannerSection,
            {
              maxWidth: responsive.isWeb
                ? responsive.maxContentWidth
                : undefined,
              alignSelf: responsive.isWeb
                ? ("center" as const)
                : ("stretch" as const),
              paddingHorizontal: responsive.contentPadding,
            },
          ]}
        >
          <LinearGradient
            colors={theme.gradientBanner as unknown as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.promotionalBanner, Shadow.md]}
          >
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>{t("explore_products")}</Text>
              <Text style={styles.bannerSubtitle}>{t("special_offers")}</Text>
            </View>
            <TouchableOpacity
              style={styles.bannerButton}
              activeOpacity={0.8}
              onPress={() => router.push("/(tabs)/explore")}
            >
              <Text style={styles.bannerButtonText}>{t("view_all")}</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Error State */}

        {error && !loading && (
          <View style={styles.errorContainer}>
            <Ionicons
              name="cloud-offline-outline"
              size={48}
              color={theme.textTertiary}
            />
            <Text style={[styles.errorText, { color: theme.textSecondary }]}>
              {t("error_occurred")}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: theme.primary }]}
              onPress={fetchData}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>{t("retry")}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Search Results */}
        {searchResults.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {t("search")}
              </Text>
              <Text style={[styles.resultCount, { color: theme.textTertiary }]}>
                {searchResults.length} {t("result")}
              </Text>
            </View>
            <View
              style={[
                styles.productsGrid,
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
              {searchResults.map((product) => (
                <View
                  key={product.id}
                  style={{
                    width: `${100 / responsive.productColumns - 2}%` as any,
                  }}
                >
                  <ProductCard product={product} />
                </View>
              ))}
            </View>
          </View>
        ) : (
          <>
            {/* Categories Grid */}
            {categories.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    {t("categories")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/(tabs)/explore")}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[styles.viewAllLink, { color: theme.primary }]}
                    >
                      {t("view_all")} ←
                    </Text>
                  </TouchableOpacity>
                </View>

                <View
                  style={[
                    styles.categoriesGrid,
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
                  {loading ? (
                    <>
                      {[1, 2, 3, 4].map((i) => (
                        <View
                          key={i}
                          style={[
                            styles.categoryCardPlaceholder,
                            {
                              backgroundColor: theme.border,
                              width:
                                `${100 / responsive.categoryColumns - 2}%` as any,
                            },
                          ]}
                        />
                      ))}
                    </>
                  ) : (
                    <>
                      {categories
                        .slice(0, responsive.isDesktop ? 10 : 6)
                        .map((category) => (
                          <CategoryCard
                            key={category.id}
                            category={category}
                            columns={responsive.categoryColumns}
                          />
                        ))}
                    </>
                  )}
                </View>
              </View>
            )}

            {/* Featured Products */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  {t("featured")}
                </Text>
                <Text
                  style={[
                    styles.sectionSubtitle,
                    { color: theme.textTertiary },
                  ]}
                >
                  {t("featured_products")}
                </Text>
              </View>
              {loading ? (
                <View
                  style={[
                    styles.productsGrid,
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
                  {[1, 2, 3, 4].map((i) => (
                    <View
                      key={i}
                      style={{
                        width: `${100 / responsive.productColumns - 2}%` as any,
                      }}
                    >
                      <ProductCardSkeleton />
                    </View>
                  ))}
                </View>
              ) : featured.length > 0 ? (
                <View
                  style={[
                    styles.productsGrid,
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
                  {featured.map((product) => (
                    <View
                      key={product.id}
                      style={{
                        width: `${100 / responsive.productColumns - 2}%` as any,
                      }}
                    >
                      <ProductCard product={product} />
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="bag-outline"
                    size={48}
                    color={theme.textTertiary}
                  />
                  <Text
                    style={[styles.emptyText, { color: theme.textSecondary }]}
                  >
                    {t("empty_state_subtitle")}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
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

  // Gradient Header
  darkHeader: {
    paddingBottom: Spacing.lg,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
    ...Shadow.xl,
  },
  headerContent: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  headerLogoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerLogo: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
  },
  headerTextSection: {
    flex: 1,
  },
  appName: {
    fontSize: FontSize.title,
    fontWeight: FontWeight.bold,
    color: "#FFFFFF",
    letterSpacing: LetterSpacing.tight,
  },
  appTagline: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.medium,
    color: "rgba(255, 255, 255, 0.65)",
    marginTop: 2,
  },
  headerSearch: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.sm,
  },

  // Gradient Banner
  bannerSection: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
    width: "100%",
  },
  promotionalBanner: {
    height: 140,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: FontSize.titleLarge,
    fontWeight: FontWeight.bold,
    color: "#FFFFFF",
    marginBottom: Spacing.xs,
    letterSpacing: LetterSpacing.tight,
  },
  bannerSubtitle: {
    fontSize: FontSize.body,
    color: "rgba(255, 255, 255, 0.95)",
    fontWeight: FontWeight.medium,
  },
  bannerButton: {
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    marginBottom: -13,
    marginHorizontal: -5,
  },
  bannerButtonText: {
    color: "#FFFFFF",
    fontSize: FontSize.small,
    fontWeight: FontWeight.semibold,
  },

  // Error State
  errorContainer: {
    alignItems: "center",
    paddingVertical: Spacing.xxxl,
    gap: Spacing.md,
  },
  errorText: {
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.medium,
  },
  retryButton: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
  },

  // Empty State
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Spacing.xxxl,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.medium,
  },

  // Sections
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.subtitle,
    fontWeight: FontWeight.bold,
    letterSpacing: LetterSpacing.tight,
  },
  sectionSubtitle: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.medium,
  },
  resultCount: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.medium,
  },
  viewAllLink: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
  },

  // Categories Grid - Responsive
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
  },
  categoryCardPlaceholder: {
    aspectRatio: 1,
    borderRadius: Radius.lg,
  },

  // Products Grid - Responsive
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
  },
});
