import { Button } from "@/components/ui/button";
import { useAlert } from "@/components/ui/custom-alert";
import {
    FontSize,
    FontWeight,
    Radius,
    Shadow,
    Spacing,
} from "@/constants/layout";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useResponsive } from "@/hooks/use-responsive";
import { getProductById } from "@/services/catalog";
import { purchaseProduct } from "@/services/wallet";
import { useAuthStore } from "@/stores/auth";
import type { Product } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ShoppingCart } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProductDetailScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const responsive = useResponsive();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const isDesktopWeb = Platform.OS === "web" && responsive.isDesktop;
  const bottomBarWidth = isDesktopWeb
    ? Math.min(responsive.maxContentWidth, responsive.width - Spacing.xl * 2)
    : undefined;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const { profile, updateBalance, refreshProfile } = useAuthStore();
  const { alert } = useAlert();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ar-IQ", {
      maximumFractionDigits: 0,
    }).format(price);
  };

  useEffect(() => {
    (async () => {
      try {
        const p = await getProductById(id!);
        setProduct(p);
      } catch {
        // no fallback
      } finally {
        setLoading(false);
      }
    })();
    refreshProfile?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handlePurchase = () => {
    if (!product) return;

    const productPrice = Number(product.price) || 0;
    const walletBalance = Number(profile?.wallet_balance ?? 0);

    if (productPrice <= 0) {
      alert({ title: t("error"), message: t("error_occurred"), icon: "error" });
      return;
    }

    if (walletBalance < productPrice) {
      alert({
        title: t("error"),
        message: `${t("insufficient_balance")}\n${t("wallet_balance")}: ${formatPrice(walletBalance)} ${t("currency")}\n${t("price")}: ${formatPrice(productPrice)} ${t("currency")}`,
        icon: "error",
      });
      return;
    }

    alert({
      title: t("confirm_purchase"),
      message: t("purchase_confirm_msg", {
        amount: formatPrice(productPrice),
        currency: t("currency"),
      }),
      icon: "confirm",
      buttons: [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("confirm"),
          onPress: async () => {
            setPurchasing(true);
            try {
              const result = await purchaseProduct(product.id);
              if (result.success) {
                if (result.new_balance !== undefined) {
                  updateBalance(result.new_balance);
                }
                alert({
                  title: t("purchase_success"),
                  message: t("order_received_msg"),
                  icon: "success",
                  buttons: [
                    { text: t("confirm"), onPress: () => router.back() },
                  ],
                });
              } else {
                const errorKey = result.error?.includes("balance")
                  ? "insufficient_balance"
                  : "error_occurred";
                alert({
                  title: t("error"),
                  message: t(errorKey),
                  icon: "error",
                });
              }
            } catch {
              alert({
                title: t("error"),
                message: t("error_occurred"),
                icon: "error",
              });
            } finally {
              setPurchasing(false);
            }
          },
        },
      ],
    });
  };

  if (loading) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <Ionicons
          name="bag-remove-outline"
          size={48}
          color={theme.textTertiary}
        />
        <Text style={[styles.notFoundText, { color: theme.textSecondary }]}>
          {t("product_not_found")}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: theme.primary }]}
        >
          <Text style={styles.backButtonText}>{t("back")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const name = product.name_ar;
  const description = product.description_ar;
  const categoryName = product.category ? product.category.name_ar : "";

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 120,
          maxWidth: responsive.maxContentWidth,
          alignSelf: "center",
          width: "100%",
        }}
      >
        <View
          style={[styles.imageContainer, { backgroundColor: theme.surface }]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              styles.backBtn,
              { backgroundColor: theme.card, top: insets.top + Spacing.sm },
            ]}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>

          {product.image_url ? (
            <Image
              source={{ uri: product.image_url }}
              style={styles.image}
              contentFit="contain"
              transition={300}
            />
          ) : (
            <View
              style={[
                styles.iconFallbackContainer,
                { backgroundColor: `${theme.primary}10` },
              ]}
            >
              <ShoppingCart size={64} color={theme.primary} strokeWidth={1.5} />
            </View>
          )}
        </View>

        <View style={styles.details}>
          {categoryName ? (
            <Text style={[styles.category, { color: theme.primary }]}>
              {categoryName}
            </Text>
          ) : null}
          <Text style={[styles.name, { color: theme.text }]}>{name}</Text>

          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: theme.primary }]}>
              {formatPrice(Number(product.price))}
            </Text>
            <Text style={[styles.currency, { color: theme.textSecondary }]}>
              {t("currency")}
            </Text>
          </View>

          {/* Digital product badge */}
          <View style={styles.digitalBadgeRow}>
            <View
              style={[
                styles.digitalBadge,
                { backgroundColor: `${theme.primary}15` },
              ]}
            >
              <Ionicons name="flash" size={14} color={theme.primary} />
              <Text style={[styles.digitalBadgeText, { color: theme.primary }]}>
                {t("digital_product")}
              </Text>
            </View>
          </View>

          {description && (
            <View style={styles.descSection}>
              <Text style={[styles.descTitle, { color: theme.text }]}>
                {t("description")}
              </Text>
              <Text style={[styles.descBody, { color: theme.textSecondary }]}>
                {description}
              </Text>
            </View>
          )}

          {/* Balance info */}
          <View
            style={[
              styles.balanceCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.borderLight,
              },
            ]}
          >
            <View style={styles.balanceRow}>
              <Ionicons name="wallet-outline" size={20} color={theme.primary} />
              <Text
                style={[styles.balanceLabel, { color: theme.textSecondary }]}
              >
                {t("wallet_balance")}
              </Text>
            </View>
            <Text style={[styles.balanceValue, { color: theme.text }]}>
              {formatPrice(Number(profile?.wallet_balance ?? 0))}{" "}
              {t("currency")}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottom,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            maxWidth: isDesktopWeb
              ? bottomBarWidth
              : responsive.maxContentWidth,
            width: isDesktopWeb ? bottomBarWidth : "100%",
            left: isDesktopWeb ? "50%" : 0,
            right: isDesktopWeb ? undefined : 0,
            transform: isDesktopWeb
              ? [{ translateX: -(bottomBarWidth ?? 0) / 2 }]
              : undefined,
          },
        ]}
      >
        <View>
          <Text style={[styles.bottomLabel, { color: theme.textSecondary }]}>
            {t("price")}
          </Text>
          <View style={styles.bottomPriceRow}>
            <Text style={[styles.bottomTotal, { color: theme.text }]}>
              {formatPrice(Number(product.price))}
            </Text>
            <Text
              style={[styles.bottomCurrency, { color: theme.textSecondary }]}
            >
              {t("currency")}
            </Text>
          </View>
        </View>
        <Button
          title={purchasing ? t("loading") : t("buy_now")}
          onPress={handlePurchase}
          variant="primary"
          size="md"
          loading={purchasing}
          disabled={purchasing}
          style={{ width: 200, padding: 0, marginBottom: 10 }}
          icon={<Ionicons name="wallet-outline" size={22} color="#fff" />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  notFoundText: {
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.medium,
  },
  backButton: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    marginTop: Spacing.md,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
  },
  imageContainer: {
    height: 320,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backBtn: {
    position: "absolute",
    left: Spacing.lg,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.md,
  },
  image: { width: "65%", height: "65%" },
  iconFallbackContainer: {
    width: 120,
    height: 120,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  details: {
    padding: Spacing.xxl,
  },
  category: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.semibold,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  name: {
    fontSize: FontSize.heading,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.sm,
  },
  price: {
    fontSize: FontSize.titleLarge,
    fontWeight: FontWeight.heavy,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginVertical: Spacing.sm,
  },
  currency: {
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.medium,
  },
  digitalBadgeRow: { marginBottom: Spacing.xl },
  digitalBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  digitalBadgeText: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.semibold,
  },
  descSection: { marginBottom: Spacing.xxl },
  descTitle: {
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.sm,
  },
  descBody: {
    fontSize: FontSize.body,
    lineHeight: 22,
  },
  balanceCard: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  balanceLabel: {
    fontSize: FontSize.small,
  },
  balanceValue: {
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.bold,
  },
  bottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  bottomLabel: {
    fontSize: FontSize.small,
    marginBottom: 2,
  },
  bottomTotal: {
    fontSize: FontSize.titleLarge,
    fontWeight: FontWeight.heavy,
  },
  bottomPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  bottomCurrency: {
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.semibold,
  },
});
