import { useMemo } from "react";
import { Platform, useWindowDimensions } from "react-native";

export interface ResponsiveInfo {
  /** Current window width */
  width: number;
  /** Current window height */
  height: number;
  /** Web platform */
  isWeb: boolean;
  /** Tablet: width >= 768 */
  isTablet: boolean;
  /** Desktop/large: width >= 1024 */
  isDesktop: boolean;
  /** Small phone: width < 375 */
  isSmall: boolean;
  /** Max content width for web layouts */
  maxContentWidth: number;
  /** Category grid columns */
  categoryColumns: number;
  /** Product grid columns */
  productColumns: number;
  /** Content horizontal padding */
  contentPadding: number;
  /** Gap between grid items */
  gridGap: number;
}

/**
 * Dynamic responsive hook that updates on window resize.
 * Replaces static Dimensions.get("window") calculations.
 */
export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  return useMemo(() => {
    const isSmall = width < 375;
    const isTablet = width >= 768;
    const isDesktop = width >= 1024;
    const maxContentWidth = 1200;

    // Category columns: 3 mobile, 4 tablet, 5 desktop-web
    let categoryColumns: number;
    if (isWeb && isDesktop) categoryColumns = 5;
    else if (isTablet) categoryColumns = 4;
    else if (width > 480) categoryColumns = 4;
    else categoryColumns = 3;

    // Product columns: 2 small, 3 mobile, 4 tablet, 5 desktop
    let productColumns: number;
    if (isWeb && isDesktop) productColumns = 5;
    else if (isTablet) productColumns = 4;
    else if (isSmall) productColumns = 3;
    else productColumns = 3;

    // Content padding: more on larger screens
    const contentPadding = isDesktop ? 32 : isTablet ? 24 : 20;

    // Grid gap
    const gridGap = isDesktop ? 20 : isTablet ? 16 : 8;

    return {
      width,
      height,
      isWeb,
      isTablet,
      isDesktop,
      isSmall,
      maxContentWidth,
      categoryColumns,
      productColumns,
      contentPadding,
      gridGap,
    };
  }, [width, height, isWeb]);
}
