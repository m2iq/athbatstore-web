import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import {
    FontSize,
    FontWeight,
    Radius,
    Shadow,
    Spacing,
} from "@/constants/layout";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useResponsive } from "@/hooks/use-responsive";
import { getAutoFilters, getProducts } from "@/services/catalog";
import type { Product } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CategoryProductsScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const responsive = useResponsive();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const { t } = useTranslation();

  const [products, setProducts] = useState<Product[]>([]);
  const [filterPrefixes, setFilterPrefixes] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [prods, prefixes] = await Promise.all([
        getProducts({
          categoryId: id,
          filterPrefix: activeFilter ?? undefined,
        }),
        filterPrefixes.length === 0
          ? getAutoFilters(id)
          : Promise.resolve(filterPrefixes),
      ]);
      setProducts(prods);
      if (filterPrefixes.length === 0) setFilterPrefixes(prefixes);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, activeFilter]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleFilterPress = (subId: string | null) => {
    if (activeFilter === subId) return;
    setActiveFilter(subId);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + Spacing.sm, alignItems: "center" },
        ]}
      >
        <View
          style={[
            {
              maxWidth: responsive.isDesktop
                ? responsive.maxContentWidth
                : undefined,
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: Spacing.lg,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: theme.surface }]}
          >
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {name || t("categories")}
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      {/* Filter Chips */}
      {filterPrefixes.length > 0 && (
        <View style={styles.filtersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          >
            <TouchableOpacity
              onPress={() => handleFilterPress(null)}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    activeFilter === null ? theme.tint : theme.surface,
                  borderColor:
                    activeFilter === null ? theme.tint : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: activeFilter === null ? "#fff" : theme.textSecondary,
                    fontWeight: activeFilter === null ? "700" : "500",
                  },
                ]}
              >
                الكل
              </Text>
            </TouchableOpacity>
            {filterPrefixes.map((prefix) => (
              <TouchableOpacity
                key={prefix}
                onPress={() => handleFilterPress(prefix)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor:
                      activeFilter === prefix ? theme.tint : theme.surface,
                    borderColor:
                      activeFilter === prefix ? theme.tint : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color:
                        activeFilter === prefix ? "#fff" : theme.textSecondary,
                      fontWeight: activeFilter === prefix ? "700" : "500",
                    },
                  ]}
                >
                  {prefix}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {loading ? (
        <View
          style={[
            styles.grid,
            {
              paddingHorizontal: responsive.contentPadding,
              maxWidth: responsive.maxContentWidth,
              alignSelf: "center",
              width: "100%",
            },
          ]}
        >
          {Array.from({ length: responsive.productColumns * 2 }).map((_, i) => (
            <View
              key={i}
              style={{ width: `${100 / responsive.productColumns - 2}%` }}
            >
              <ProductCardSkeleton />
            </View>
          ))}
        </View>
      ) : products.length === 0 ? (
        <EmptyState title={t("no_products")} />
      ) : (
        <FlatList
          key={responsive.productColumns}
          data={products}
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              <ProductCard product={item} />
            </View>
          )}
          keyExtractor={(item) => item.id}
          numColumns={responsive.productColumns}
          contentContainerStyle={[
            styles.grid,
            {
              paddingHorizontal: responsive.contentPadding,
              maxWidth: responsive.maxContentWidth,
              alignSelf: "center",
              width: "100%",
            },
          ]}
          columnWrapperStyle={{
            gap: responsive.gridGap,
            marginBottom: responsive.gridGap,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.tint}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.sm,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: FontSize.title,
    fontWeight: FontWeight.bold,
  },
  filtersContainer: {
    paddingBottom: Spacing.sm,
  },
  filtersContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  filterText: {
    fontSize: FontSize.small,
  },
  grid: {
    paddingBottom: Spacing.huge,
  },
  gridItem: {
    flex: 1,
  },
});
