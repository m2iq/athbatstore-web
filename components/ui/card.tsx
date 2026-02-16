import { Radius, Shadow, Spacing } from "@/constants/layout";
import { useAppTheme } from "@/hooks/use-app-theme";
import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  padded?: boolean;
}

export function Card({
  children,
  style,
  elevated = true,
  padded = true,
}: Props) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
        elevated && Shadow.md,
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  padded: {
    padding: Spacing.lg,
  },
});
