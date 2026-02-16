import { Radius, Spacing } from "@/constants/layout";
import { useAppTheme } from "@/hooks/use-app-theme";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Platform,
    StyleSheet,
    View,
    type ViewStyle,
} from "react-native";

interface Props {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = "100%",
  height = 16,
  borderRadius = Radius.sm,
  style,
}: Props) {
  const theme = useAppTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: theme.border,
          opacity,
        },
        style,
      ]}
    />
  );
}

/** Pre-built skeleton for product cards */
export function ProductCardSkeleton() {
  return (
    <View style={skeletonStyles.productCard}>
      <Skeleton height={120} borderRadius={Radius.md} />
      <View style={{ padding: Spacing.md, gap: Spacing.sm }}>
        <Skeleton height={14} width="70%" />
        <Skeleton height={12} width="40%" />
        <Skeleton height={16} width="30%" />
      </View>
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  productCard: {
    borderRadius: Radius.lg,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
});
