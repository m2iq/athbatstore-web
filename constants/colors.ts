/**
 * أثبات ستور - نظام الألوان 2026
 * Dark Blue + Teal fintech design
 * Professional: Facebook / LinkedIn tone + Dark Cyan accent
 */

/** Core Palette */
export const MarketplacePalette = {
  // ── Dark Blue (Primary Brand) ────────────────────
  blue50: "#eef4ff",
  blue100: "#dae6ff",
  blue200: "#bdd3ff",
  blue300: "#90b8ff",
  blue400: "#5c92ff",
  blue500: "#3b74f6",
  blue600: "#1d4ed8", // PRIMARY BRAND
  blue700: "#1a3fba",
  blue800: "#1a3494",
  blue900: "#1b2d6e",
  blue950: "#0f172a", // Deep dark

  // ── Teal / Dark Cyan (Secondary Accent) ──────────
  teal50: "#effefa",
  teal100: "#c7fff1",
  teal200: "#90ffe4",
  teal300: "#50f0d0",
  teal400: "#1cd9b8",
  teal500: "#06b6a0",
  teal600: "#019583", // SECONDARY ACCENT
  teal700: "#067769",
  teal800: "#0a5e55",
  teal900: "#0d4e47",

  // ── Navy (Headers & Depth) ──────────────────
  navy50: "#e8eaf0",
  navy100: "#c8cdd9",
  navy200: "#949db5",
  navy300: "#636e8e",
  navy400: "#3d4a6e",
  navy500: "#1e293b",
  navy600: "#162033",
  navy700: "#0f172a", // DEEP
  navy800: "#0b1120",
  navy900: "#060a14",

  // ── Neutral (Soft Grays) ─────────────────────────
  neutral50: "#f8fafc",
  neutral100: "#f1f5f9",
  neutral200: "#e2e8f0",
  neutral300: "#cbd5e1",
  neutral400: "#94a3b8",
  neutral500: "#64748b",
  neutral600: "#475569",
  neutral700: "#334155",
  neutral800: "#1e293b",
  neutral900: "#0f172a",

  // ── Pure ─────────────────────────────────────────
  white: "#FFFFFF",
  black: "#000000",

  // ── Semantic ─────────────────────────────────────
  success: "#10B981",
  successLight: "#D1FAE5",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  error: "#EF4444",
  errorLight: "#FEE2E2",
  info: "#3B82F6",
  infoLight: "#DBEAFE",
} as const;

export type MarketplaceColor = keyof typeof MarketplacePalette;

/** Light Theme - Dark Blue + Teal Fintech 2026 */
export const LightTheme = {
  // Primary = Dark Blue
  primary: MarketplacePalette.blue600,
  primaryLight: MarketplacePalette.blue500,
  primaryDark: MarketplacePalette.blue800,

  // Accent = Teal
  accent: MarketplacePalette.teal600,
  accentLight: MarketplacePalette.teal400,
  accentSoft: MarketplacePalette.teal50,

  // CTA = Blue
  cta: MarketplacePalette.blue600,
  ctaLight: MarketplacePalette.blue500,
  ctaPressed: MarketplacePalette.blue700,

  // Highlight = Teal for badges
  highlight: MarketplacePalette.teal500,

  // Navy = Headers & depth
  navy: MarketplacePalette.navy700,
  navyLight: MarketplacePalette.navy500,
  navyDark: MarketplacePalette.navy900,

  // Backgrounds
  background: MarketplacePalette.neutral50,
  surface: MarketplacePalette.white,
  surfaceElevated: MarketplacePalette.white,
  card: MarketplacePalette.white,

  // Text
  text: MarketplacePalette.neutral900,
  textSecondary: MarketplacePalette.neutral600,
  textTertiary: MarketplacePalette.neutral400,
  textInverted: MarketplacePalette.white,

  // Borders & Dividers
  border: MarketplacePalette.neutral200,
  borderLight: MarketplacePalette.neutral100,
  divider: MarketplacePalette.neutral200,

  // Tab Bar
  tabBar: MarketplacePalette.white,
  tabBarBorder: MarketplacePalette.neutral200,
  tabIconDefault: MarketplacePalette.neutral400,
  tabIconSelected: MarketplacePalette.blue600,

  // UI Elements
  tint: MarketplacePalette.blue600,
  tintLight: MarketplacePalette.blue50,
  icon: MarketplacePalette.neutral600,
  headerBackground: MarketplacePalette.navy700,
  headerText: MarketplacePalette.white,
  inputBackground: MarketplacePalette.white,
  inputBorder: MarketplacePalette.neutral200,
  placeholder: MarketplacePalette.neutral400,

  // Effects
  shadow: "rgba(29, 78, 216, 0.10)",
  shadowLight: "rgba(29, 78, 216, 0.05)",
  shadowNavy: "rgba(15, 23, 42, 0.08)",
  overlay: "rgba(15, 23, 42, 0.5)",
  overlayLight: "rgba(15, 23, 42, 0.2)",

  // Gradients
  gradient: [
    MarketplacePalette.blue600,
    MarketplacePalette.blue500,
  ] as readonly [string, string],
  gradientBanner: [
    MarketplacePalette.blue600,
    MarketplacePalette.teal600,
  ] as readonly [string, string],
  gradientHero: [
    MarketplacePalette.navy700,
    MarketplacePalette.navy500,
    MarketplacePalette.blue600,
  ] as readonly [string, string, string],
  gradientCTA: [
    MarketplacePalette.blue600,
    MarketplacePalette.blue500,
  ] as readonly [string, string],
  gradientNavy: [
    MarketplacePalette.navy700,
    MarketplacePalette.navy800,
  ] as readonly [string, string],

  // Full palette access
  ...MarketplacePalette,
};

/** Dark Theme - Dark Blue + Teal Fintech 2026 */
export const DarkTheme = {
  // Primary = Lighter blue for dark mode
  primary: MarketplacePalette.blue500,
  primaryLight: MarketplacePalette.blue400,
  primaryDark: MarketplacePalette.blue700,

  // Accent
  accent: MarketplacePalette.teal400,
  accentLight: MarketplacePalette.teal300,
  accentSoft: MarketplacePalette.teal900,

  // CTA
  cta: MarketplacePalette.blue500,
  ctaLight: MarketplacePalette.blue400,
  ctaPressed: MarketplacePalette.blue600,

  // Highlight
  highlight: MarketplacePalette.teal400,

  // Navy
  navy: MarketplacePalette.navy800,
  navyLight: MarketplacePalette.navy700,
  navyDark: MarketplacePalette.navy900,

  // Backgrounds
  background: "#0b1120",
  surface: MarketplacePalette.neutral800,
  surfaceElevated: MarketplacePalette.neutral700,
  card: MarketplacePalette.neutral800,

  // Text
  text: MarketplacePalette.neutral50,
  textSecondary: MarketplacePalette.neutral300,
  textTertiary: MarketplacePalette.neutral500,
  textInverted: MarketplacePalette.neutral900,

  // Borders & Dividers
  border: MarketplacePalette.neutral700,
  borderLight: MarketplacePalette.neutral800,
  divider: MarketplacePalette.neutral700,

  // Tab Bar
  tabBar: MarketplacePalette.neutral800,
  tabBarBorder: MarketplacePalette.neutral700,
  tabIconDefault: MarketplacePalette.neutral500,
  tabIconSelected: MarketplacePalette.blue400,

  // UI Elements
  tint: MarketplacePalette.blue400,
  tintLight: "#1a2744",
  icon: MarketplacePalette.neutral400,
  headerBackground: MarketplacePalette.neutral800,
  headerText: MarketplacePalette.neutral50,
  inputBackground: MarketplacePalette.neutral700,
  inputBorder: MarketplacePalette.neutral600,
  placeholder: MarketplacePalette.neutral500,

  // Effects
  shadow: "rgba(0, 0, 0, 0.4)",
  shadowLight: "rgba(0, 0, 0, 0.2)",
  shadowNavy: "rgba(0, 0, 0, 0.3)",
  overlay: "rgba(0, 0, 0, 0.7)",
  overlayLight: "rgba(0, 0, 0, 0.4)",

  // Gradients
  gradient: [
    MarketplacePalette.blue600,
    MarketplacePalette.blue500,
  ] as readonly [string, string],
  gradientBanner: [
    MarketplacePalette.blue700,
    MarketplacePalette.teal700,
  ] as readonly [string, string],
  gradientHero: [
    MarketplacePalette.neutral800,
    MarketplacePalette.neutral700,
    MarketplacePalette.blue800,
  ] as readonly [string, string, string],
  gradientCTA: [
    MarketplacePalette.blue500,
    MarketplacePalette.blue400,
  ] as readonly [string, string],
  gradientNavy: [
    MarketplacePalette.neutral800,
    MarketplacePalette.neutral900,
  ] as readonly [string, string],

  // Full palette access
  ...MarketplacePalette,
};

export type AppTheme = typeof LightTheme;
