/**
 * أثبات ستور - نظام التصميم الاحترافي 2026
 * Orange-dominant Arabic-first marketplace
 */

import { Platform } from "react-native";

/** Orange-Dominant Color System */
export const Colors = {
  light: {
    // Primary = Orange Dominant
    primary: "#fb8500",
    primaryLight: "#ff9f33",
    primaryDark: "#c96a00",

    // Navy for depth
    navy: "#023047",
    navyLight: "#007d97",

    // Accent (secondary)
    accent: "#219ebc",
    accentLight: "#8ecae6",
    accentSoft: "#dff3f7",

    // CTA = Orange
    cta: "#fb8500",
    ctaLight: "#ff9f33",
    highlight: "#ffb703",

    // Backgrounds
    background: "#f8fafc",
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",

    // Text
    text: "#111827",
    textSecondary: "#4b5563",
    textTertiary: "#9ca3af",
    textInverted: "#FFFFFF",

    // Borders
    border: "#e5e7eb",
    borderLight: "#f3f4f6",
    divider: "#e5e7eb",

    // Semantic
    success: "#10B981",
    successLight: "#D1FAE5",
    warning: "#F59E0B",
    warningLight: "#FEF3C7",
    error: "#EF4444",
    errorLight: "#FEE2E2",
    info: "#219ebc",
    infoLight: "#e8f7fb",

    // Tab Bar
    tabIconDefault: "#9ca3af",
    tabIconSelected: "#fb8500",
    tabBackground: "#FFFFFF",

    // Gradients
    gradientPrimary: ["#fb8500", "#ff9f33"],
    gradientBanner: ["#fb8500", "#fdba74"],
    gradientHero: ["#023047", "#007d97", "#219ebc"],
    gradientCTA: ["#fb8500", "#ff9f33"],
    gradientNavy: ["#023047", "#022638"],

    // Overlays
    overlay: "rgba(17, 24, 39, 0.5)",
    overlayLight: "rgba(17, 24, 39, 0.2)",
  },
  dark: {
    // Dark mode
    primary: "#ff9f33",
    primaryLight: "#fdba74",
    primaryDark: "#ea7600",

    navy: "#022638",
    navyLight: "#023047",

    accent: "#47bfdf",
    accentLight: "#bfe7ef",
    accentSoft: "#39515c",

    cta: "#ff9f33",
    ctaLight: "#fdba74",
    highlight: "#ffcf33",

    background: "#111827",
    surface: "#1f2937",
    surfaceElevated: "#374151",

    text: "#f8fafc",
    textSecondary: "#d1d5db",
    textTertiary: "#6b7280",
    textInverted: "#111827",

    border: "#374151",
    borderLight: "#1f2937",
    divider: "#374151",

    success: "#34D399",
    successLight: "#064E3B",
    warning: "#FBBF24",
    warningLight: "#78350F",
    error: "#F87171",
    errorLight: "#7F1D1D",
    info: "#47bfdf",
    infoLight: "#1a7e96",

    tabIconDefault: "#6b7280",
    tabIconSelected: "#ff9f33",
    tabBackground: "#1f2937",

    gradientPrimary: ["#ea7600", "#ff9f33"],
    gradientBanner: ["#ea7600", "#ff9f33"],
    gradientHero: ["#1f2937", "#374151", "#145f71"],
    gradientCTA: ["#ff9f33", "#fdba74"],
    gradientNavy: ["#1f2937", "#111827"],

    overlay: "rgba(0, 0, 0, 0.7)",
    overlayLight: "rgba(0, 0, 0, 0.4)",
  },
};

/** Premium Typography System (Tajawal font) */
export const Fonts = {
  family: {
    arabic: "Tajawal",
    english: Platform.select({
      ios: "SF Pro Display",
      android: "Roboto",
      default: "system-ui",
    }),
  },
  system: Platform.select({
    ios: "system-ui",
    android: "Roboto",
    default: "system-ui",
  }),
};
