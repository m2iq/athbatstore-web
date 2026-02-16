import {
    FontSize,
    FontWeight,
    Radius,
    Shadow,
    Spacing,
} from "@/constants/layout";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { Category } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
    Animated,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface Props {
  category: Category;
  /** Number of columns in the grid — used for width calculation */
  columns?: number;
}

export function CategoryCard({ category, columns = 3 }: Props) {
  const theme = useAppTheme();
  const router = useRouter();
  const scale = useRef(new Animated.Value(1)).current;
  const [isHovered, setIsHovered] = useState(false);

  const name = category.name_ar;

  // Dynamic width: percentage-based so it responds to container
  const itemWidth = `${100 / columns - 2}%` as any;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      tension: 100,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() =>
          router.push({
            pathname: "/category/[id]",
            params: { id: category.id, name },
          })
        }
        // @ts-ignore - Web-only props
        onMouseEnter={
          Platform.OS === "web" ? () => setIsHovered(true) : undefined
        }
        onMouseLeave={
          Platform.OS === "web" ? () => setIsHovered(false) : undefined
        }
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.surface,
              borderColor: theme.borderLight,
              width: itemWidth,
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
          {category.image_url ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: category.image_url }}
                style={styles.categoryImage}
                contentFit="cover"
                transition={200}
                placeholder={undefined}
              />
            </View>
          ) : (
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${theme.primary}10` },
              ]}
            >
              <Ionicons name="grid-outline" size={28} color={theme.primary} />
            </View>
          )}
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={2}>
            {name}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.06)",
    aspectRatio: 1,
    minHeight: 100,
    minWidth: 100,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: Radius.sm,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  categoryImage: {
    width: "100%",
    height: "100%",
    borderRadius: Radius.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.bold,
    textAlign: "center",
    lineHeight: 14,
  },
});
