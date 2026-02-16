import { FontSize, FontWeight, Radius, Spacing } from "@/constants/layout";
import { useAppTheme } from "@/hooks/use-app-theme";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
    ActivityIndicator,
    Text,
    TouchableOpacity,
    type TextStyle,
    type ViewStyle,
} from "react-native";

interface Props {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "whatsapp";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}: Props) {
  const theme = useAppTheme();

  const sizeMap = {
    sm: {
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.lg,
      fontSize: FontSize.small,
    },
    md: {
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.xl,
      fontSize: FontSize.body,
    },
    lg: {
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.xxl,
      fontSize: FontSize.bodyLarge,
    },
  };

  const isDisabled = disabled || loading;

  const baseStyle: ViewStyle = {
    borderRadius: Radius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    opacity: isDisabled ? 0.5 : 1,
    ...sizeMap[size],
    ...(fullWidth ? { width: "100%" } : {}),
  };

  const content = (
    <>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === "primary" || variant === "whatsapp"
              ? "#fff"
              : theme.tint
          }
        />
      ) : (
        icon
      )}
      <Text
        style={[
          {
            fontWeight: FontWeight.semibold,
            fontSize: sizeMap[size].fontSize,
            color:
              variant === "primary" || variant === "whatsapp"
                ? "#fff"
                : variant === "outline" || variant === "ghost"
                  ? theme.tint
                  : theme.text,
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </>
  );

  if (variant === "primary" || variant === "whatsapp") {
    const colors =
      variant === "whatsapp"
        ? (["#25D366", "#20BA5A"] as [string, string]) // WhatsApp green gradient
        : (theme.gradient as unknown as [string, string]);

    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[
          { borderRadius: Radius.lg },
          fullWidth && { width: "100%" },
          style,
        ]}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[baseStyle, { borderRadius: Radius.lg }]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyles: Record<string, ViewStyle> = {
    secondary: { backgroundColor: theme.tintLight },
    outline: {
      borderWidth: 1.5,
      borderColor: theme.tint,
      backgroundColor: "transparent",
    },
    ghost: { backgroundColor: "transparent" },
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[baseStyle, variantStyles[variant], style]}
    >
      {content}
    </TouchableOpacity>
  );
}
