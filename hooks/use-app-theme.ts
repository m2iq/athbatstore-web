import { DarkTheme, LightTheme, type AppTheme } from "@/constants/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme as _useColorScheme } from "react-native";

const THEME_STORAGE_KEY = "athbat_theme_mode";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: AppTheme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = _useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");

  // Load saved preference on mount
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
      if (saved === "light" || saved === "dark" || saved === "system") {
        setThemeModeState(saved);
      }
    });
  }, []);

  const isDark =
    themeMode === "system" ? systemScheme === "dark" : themeMode === "dark";

  const theme = isDark ? DarkTheme : LightTheme;

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  };

  return React.createElement(
    ThemeContext.Provider,
    { value: { theme, themeMode, setThemeMode, isDark } },
    children,
  );
}

/** Returns current theme object */
export function useAppTheme(): AppTheme {
  const context = useContext(ThemeContext);
  if (!context) {
    // Fallback for components outside provider
    const scheme = _useColorScheme();
    return scheme === "dark" ? DarkTheme : LightTheme;
  }
  return context.theme;
}

/** Returns full theme controls (theme, themeMode, setThemeMode, isDark) */
export function useThemeControls(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    // Fallback for components outside provider
    const scheme = _useColorScheme();
    return {
      theme: scheme === "dark" ? DarkTheme : LightTheme,
      themeMode: "system",
      setThemeMode: () => {},
      isDark: scheme === "dark",
    };
  }
  return context;
}
