/**
 * Background Styles Hook
 *
 * Shared utility for generating background styles from BlockBackground config.
 * Resolves brand color references to actual hex values using the branding context,
 * or to CSS variables when used outside the branding context (public site).
 */

import { useMemo } from "react";
import type { BlockBackground } from "@/types/blocks";
import { useBranding } from "@/contexts/branding-context";
import { resolveColor, resolveColorToCssVar, type BrandColors } from "./resolve-colors";

export interface BackgroundStyleResult {
  style: React.CSSProperties;
  hasVideo: boolean;
  videoUrl?: string;
  overlay?: React.CSSProperties;
}

/**
 * Hook to generate background styles from BlockBackground config.
 * When inside BrandingProvider (admin), resolves to hex values.
 * When outside BrandingProvider (public site), resolves to CSS variables.
 */
export function useBackgroundStyles(
  background: BlockBackground | undefined,
  defaultColor: string = "brand:primary"
): BackgroundStyleResult {
  const brandingContext = useBranding();

  return useMemo(() => {
    // If we have branding context (admin dashboard), use hex resolution
    if (brandingContext) {
      const brandColors: BrandColors = {
        primary: brandingContext.colors.primary,
        secondary: brandingContext.colors.secondary,
        accent: brandingContext.colors.accent,
        background: brandingContext.colors.background,
        text: brandingContext.colors.text,
      };
      return getBackgroundStyles(background, brandColors, defaultColor);
    }

    // No branding context (public site) - use CSS variable resolution
    return getBackgroundStylesWithCssVars(background, defaultColor);
  }, [background, brandingContext, defaultColor]);
}

/**
 * Pure function to generate background styles.
 * Use this when you need to call it outside of React components.
 */
export function getBackgroundStyles(
  background: BlockBackground | undefined,
  brandColors: BrandColors,
  defaultColor: string = "#1e40af"
): BackgroundStyleResult {
  if (!background) {
    return {
      style: { backgroundColor: resolveColor(defaultColor, brandColors) },
      hasVideo: false,
    };
  }

  switch (background.type) {
    case "color":
      return {
        style: {
          backgroundColor: resolveColor(background.color, brandColors, defaultColor),
        },
        hasVideo: false,
      };

    case "gradient":
      return {
        style: {
          background: background.gradient || `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)`,
        },
        hasVideo: false,
      };

    case "image":
      return {
        style: {
          backgroundImage: background.imageUrl ? `url(${background.imageUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        },
        hasVideo: false,
        overlay: background.overlay
          ? { backgroundColor: resolveColor(background.overlay, brandColors) }
          : undefined,
      };

    case "video":
      return {
        style: {},
        hasVideo: true,
        videoUrl: background.videoUrl,
        overlay: background.overlay
          ? { backgroundColor: resolveColor(background.overlay, brandColors) }
          : undefined,
      };

    default:
      return {
        style: { backgroundColor: resolveColor(defaultColor, brandColors) },
        hasVideo: false,
      };
  }
}

/**
 * Generate background styles using CSS variables.
 * Used on public site where branding is set via CSS custom properties.
 */
export function getBackgroundStylesWithCssVars(
  background: BlockBackground | undefined,
  defaultColor: string = "brand:primary"
): BackgroundStyleResult {
  if (!background) {
    return {
      style: { backgroundColor: resolveColorToCssVar(defaultColor) },
      hasVideo: false,
    };
  }

  switch (background.type) {
    case "color":
      return {
        style: {
          backgroundColor: resolveColorToCssVar(background.color, resolveColorToCssVar(defaultColor)),
        },
        hasVideo: false,
      };

    case "gradient":
      return {
        style: {
          background: background.gradient || `linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)`,
        },
        hasVideo: false,
      };

    case "image":
      return {
        style: {
          backgroundImage: background.imageUrl ? `url(${background.imageUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        },
        hasVideo: false,
        overlay: background.overlay
          ? { backgroundColor: resolveColorToCssVar(background.overlay) }
          : undefined,
      };

    case "video":
      return {
        style: {},
        hasVideo: true,
        videoUrl: background.videoUrl,
        overlay: background.overlay
          ? { backgroundColor: resolveColorToCssVar(background.overlay) }
          : undefined,
      };

    default:
      return {
        style: { backgroundColor: resolveColorToCssVar(defaultColor) },
        hasVideo: false,
      };
  }
}

/**
 * Determine if a background should use light or dark text.
 * Returns true if the background is dark (should use light text).
 */
export function shouldUseLightText(
  background: BlockBackground | undefined,
  brandColors: BrandColors
): boolean {
  if (!background) return true; // Default to light text

  switch (background.type) {
    case "color": {
      const color = resolveColor(background.color, brandColors, "#1e40af");
      return isColorDark(color);
    }
    case "gradient":
      // Gradients typically need light text
      return true;
    case "image":
    case "video":
      // Images/videos with overlays typically need light text
      return true;
    default:
      return true;
  }
}

/**
 * Check if a hex color is dark (luminance < 0.5).
 */
function isColorDark(hex: string): boolean {
  const color = hex.replace(/^#/, "");
  const r = parseInt(color.slice(0, 2), 16);
  const g = parseInt(color.slice(2, 4), 16);
  const b = parseInt(color.slice(4, 6), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}
