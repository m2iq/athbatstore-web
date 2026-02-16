import { FontSize, FontWeight, Radius, Spacing } from "@/constants/layout";
import { useAppTheme } from "@/hooks/use-app-theme";
import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    View,
    type TextInputProps,
    type ViewStyle,
} from "react-native";

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  icon,
  containerStyle,
  style,
  ...rest
}: Props) {
  const theme = useAppTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: theme.inputBackground,
            borderColor: error
              ? theme.error
              : focused
                ? theme.tint
                : theme.inputBorder,
            borderWidth: focused ? 1.5 : 1,
          },
        ]}
      >
        {icon && <View style={styles.iconWrapper}>{icon}</View>}
        <TextInput
          placeholderTextColor={theme.placeholder}
          style={[
            styles.input,
            { color: theme.text },
            icon ? { paddingLeft: 0 } : {},
            style,
          ]}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          {...rest}
        />
      </View>
      {error && (
        <Text style={[styles.error, { color: theme.error }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.lg },
  label: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
  },
  iconWrapper: { marginRight: Spacing.sm },
  input: {
    flex: 1,
    fontSize: FontSize.body,
    paddingVertical: Spacing.md,
  },
  error: {
    fontSize: FontSize.caption,
    marginTop: Spacing.xs,
  },
});
