import {
    FontSize,
    FontWeight,
    LetterSpacing,
    Radius,
    Shadow,
    Spacing,
} from "@/constants/layout";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
}

export function SearchBar({ value, onChangeText, onSubmit }: Props) {
  const theme = useAppTheme();
  const { t } = useTranslation();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface, // White surface
          borderColor: theme.border,
        },
        Shadow.md,
      ]}
    >
      <Ionicons
        name="search"
        size={20}
        color={theme.primary} // Orange brand color for search icon
        style={styles.icon}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={t("search_placeholder")}
        placeholderTextColor={theme.textTertiary}
        style={[styles.input, { color: theme.text }]}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText("")}
          style={styles.clearButton}
          activeOpacity={0.7}
        >
          <Ionicons name="close-circle" size={20} color={theme.textTertiary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radius.lg, // 20px rounded
    paddingHorizontal: Spacing.lg,
    height: 50,
    borderWidth: 0,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.bodyLarge,
    fontWeight: FontWeight.medium,
    letterSpacing: LetterSpacing.normal,
  },
  clearButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});
