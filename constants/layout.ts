import { Dimensions, Platform } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/** Premium Spacing Scale (8pt grid system) */
export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
  massive: 64,
  giant: 80,
} as const;

/** Unified Border Radius (18px primary) */
export const Radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 18, // Primary card radius (unified 18px)
  xl: 24,
  xxl: 28,
  full: 9999,
} as const;

/** Premium Typography Scale */
export const FontSize = {
  caption: 12,
  small: 13,
  body: 15,
  bodyLarge: 17,
  subtitle: 19,
  title: 22,
  titleLarge: 26,
  heading: 30,
  headingLarge: 36,
  hero: 42,
  display: 52,
} as const;

/** Font Weights */
export const FontWeight = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  heavy: "800" as const,
  black: "900" as const,
};

/** Letter Spacing */
export const LetterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
  widest: 1.5,
} as const;

/** Line Heights */
export const LineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2,
} as const;

/** Premium Shadow System (blue-tinted for brand) */
export const Shadow = {
  xs: Platform.select({
    ios: {
      shadowColor: "#1d4ed8",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
    },
    android: { elevation: 1 },
    default: {},
  }),
  sm: Platform.select({
    ios: {
      shadowColor: "#1d4ed8",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    android: { elevation: 2 },
    default: {},
  }),
  md: Platform.select({
    ios: {
      shadowColor: "#1d4ed8",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    android: { elevation: 4 },
    default: {},
  }),
  lg: Platform.select({
    ios: {
      shadowColor: "#023047",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
    },
    android: { elevation: 8 },
    default: {},
  }),
  xl: Platform.select({
    ios: {
      shadowColor: "#023047",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
    },
    android: { elevation: 12 },
    default: {},
  }),
};

/** Screen metrics */
export const Screen = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmall: SCREEN_WIDTH < 375,
  isMedium: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414,
  isLarge: SCREEN_WIDTH >= 414,
};

/** Animation Durations */
export const AnimDuration = {
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
  slower: 700,
};

/** Animation Easing */
export const AnimEasing = {
  easeOut: [0.4, 0.0, 0.2, 1],
  easeIn: [0.4, 0.0, 1, 1],
  easeInOut: [0.4, 0.0, 0.2, 1],
  sharp: [0.4, 0.0, 0.6, 1],
};

/** Press Animation Scale */
export const PressScale = {
  subtle: 0.98,
  normal: 0.97,
  strong: 0.95,
};
