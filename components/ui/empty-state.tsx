import { FontSize, FontWeight, Spacing } from "@/constants/layout";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Package } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "./button";

interface Props {
  icon?: React.ComponentType<any>;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: IconComponent = Package,
  title,
  description,
  actionLabel,
  onAction,
}: Props) {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <View
        style={[styles.iconContainer, { backgroundColor: theme.tintLight }]}
      >
        <IconComponent size={48} color={theme.primary} strokeWidth={1.5} />
      </View>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {description && (
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          size="md"
          style={{ marginTop: Spacing.lg }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xxxl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: FontWeight.bold,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: FontSize.body,
    textAlign: "center",
    lineHeight: 22,
  },
});
