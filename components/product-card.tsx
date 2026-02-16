import {
    AnimDuration,
    FontSize,
    FontWeight,
    LetterSpacing,
    PressScale,
    Radius,
    Shadow,
    Spacing,
} from "@/constants/layout";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { Product } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Animated,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface Props {
  product: Product;
}

const PRODUCT_IMAGES: Record<string, any> = {
  زين: require("@/assets/images/zain.png"),
  "آب ستور": require("@/assets/images/apple.png"),
  "جوجل بلاي": require("@/assets/images/google.png"),
  ببجي: require("@/assets/images/pubg-uc.webp"),
};

const PRODUCT_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  زين: "phone-portrait",
  آسياسيل: "cellular",
  "آب ستور": "logo-apple",
  "جوجل بلاي": "logo-google-playstore",
  ببجي: "game-controller",
  "فري فاير": "flame",
  default: "cart",
};

function getProductImage(productName: string) {
  for (const key in PRODUCT_IMAGES) {
    if (productName.includes(key)) {
      return PRODUCT_IMAGES[key];
    }
  }
  return null;
}

function getProductIcon(productName: string): keyof typeof Ionicons.glyphMap {
  for (const key in PRODUCT_ICONS) {
    if (productName.includes(key)) {
      return PRODUCT_ICONS[key];
    }
  }
  return PRODUCT_ICONS.default;
}

export function ProductCard({ product }: Props) {
  const theme = useAppTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const scale = useRef(new Animated.Value(1)).current;
  const [isHovered, setIsHovered] = useState(false);

  const name = product.name_ar;
  const localImage = getProductImage(name);
  const iconName = getProductIcon(name);

  const handlePressIn = () => {
    Animated.timing(scale, {
      toValue: PressScale.normal,
      duration: AnimDuration.fast,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 100,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ar-IQ", {
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => router.push(`/product/${product.id}`)}
        // @ts-ignore - Web-only props
        onMouseEnter={
          Platform.OS === "web" ? () => setIsHovered(true) : undefined
        }
        onMouseLeave={
          Platform.OS === "web" ? () => setIsHovered(false) : undefined
        }
        style={[
          styles.card,
          {
            backgroundColor: theme.surface,
            borderColor: theme.borderLight,
            // @ts-ignore - Web-only CSS
            transition:
              Platform.OS === "web" ? "all 300ms ease-out" : undefined,
            transform:
              Platform.OS === "web" && isHovered
                ? [{ scale: 1.02 }]
                : undefined,
          },
          Shadow.md,
          Platform.OS === "web" && isHovered && Shadow.xl,
        ]}
      >
        {/* Image */}
        <View
          style={[styles.imageContainer, { backgroundColor: theme.background }]}
        >
          {product.image_url ? (
            <Image
              source={{ uri: product.image_url }}
              style={styles.image}
              contentFit="contain"
              transition={AnimDuration.fast}
            />
          ) : localImage ? (
            <Image
              source={localImage}
              style={styles.image}
              contentFit="contain"
              transition={AnimDuration.fast}
            />
          ) : (
            <View style={styles.iconFallbackContainer}>
              <Ionicons name={iconName} size={40} color={theme.primary} />
            </View>
          )}

          {/* Featured badge - only shown for featured products */}
          {product.is_featured && (
            <View
              style={[
                styles.badge,
                styles.featuredBadge,
                { backgroundColor: "#F59E0B" },
              ]}
            >
              <Ionicons name="star" size={11} color="#fff" />
            </View>
          )}
        </View>

        {/* Info Section */}
        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={2}>
            {name}
          </Text>

          {/* Price Section */}
          <View style={styles.priceSection}>
            <View style={styles.priceColumn}>
              <View style={styles.currentPriceRow}>
                <Text style={[styles.price, { color: theme.primary }]}>
                  {formatPrice(Number(product.price))}
                </Text>
                <Text style={[styles.currency, { color: theme.primary }]}>
                  {t("currency")}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    overflow: "hidden",
    minWidth: 101,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.06)",
  },
  imageContainer: {
    height: 120,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  iconFallbackContainer: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  // Badges
  badge: {
    position: "absolute",
    top: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    ...Shadow.xs,
  },
  outOfStockBadge: {},
  featuredBadge: {
    right: Spacing.sm,
  },
  discountBadge: {
    display: "none",
  },
  badgeText: {
    color: "#fff",
    fontSize: FontSize.caption,
    fontWeight: FontWeight.bold,
  },
  discountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: FontWeight.heavy,
  },

  // Info - Premium spacing
  info: {
    padding: Spacing.sm,
    paddingTop: Spacing.sm,
    gap: Spacing.xs,
  },
  name: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.bold,
    lineHeight: FontSize.small * 1.3,
    letterSpacing: LetterSpacing.tight,
    minHeight: 32,
  },

  // Price - Bold and prominent
  priceSection: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: Spacing.xxs,
  },
  priceColumn: {
    flex: 1,
  },
  currentPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  price: {
    fontSize: 16,
    fontWeight: FontWeight.heavy,
    letterSpacing: LetterSpacing.tight,
  },
  currency: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.bold,
  },
  originalPrice: {
    fontSize: FontSize.small,
    textDecorationLine: "line-through",
    marginBottom: 3,
  },
});
