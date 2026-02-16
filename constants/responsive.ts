/**
 * Responsive Design System
 * Mobile-first with web breakpoints
 */

import { Dimensions, Platform } from "react-native";

const { width } = Dimensions.get("window");

// Breakpoints
export const Breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

// Current breakpoint
export const getCurrentBreakpoint = () => {
  if (width >= Breakpoints.wide) return "wide";
  if (width >= Breakpoints.desktop) return "desktop";
  if (width >= Breakpoints.tablet) return "tablet";
  return "mobile";
};

// Grid columns
export const GridColumns = {
  mobile: 2,
  tablet: 3,
  desktop: 4,
  wide: 5,
} as const;

// Responsive padding
export const ResponsivePadding = {
  mobile: 16,
  tablet: 24,
  desktop: 32,
  wide: 40,
} as const;

// Category card dimensions (square 1:1)
export const CategoryCardSize = {
  mobile: (width - 48) / 2, // 2 columns with padding
  tablet: (width - 72) / 3, // 3 columns
  desktop: (width - 128) / 4, // 4 columns
  wide: (width - 160) / 5, // 5 columns
};

// Utility functions
export const getColumns = () => {
  const breakpoint = getCurrentBreakpoint();
  return GridColumns[breakpoint];
};

export const getPadding = () => {
  const breakpoint = getCurrentBreakpoint();
  return ResponsivePadding[breakpoint];
};

export const getCategoryCardSize = () => {
  const breakpoint = getCurrentBreakpoint();
  return CategoryCardSize[breakpoint];
};

// Web-specific utilities
export const isWeb = Platform.OS === "web";
export const isMobile = Platform.OS === "ios" || Platform.OS === "android";
