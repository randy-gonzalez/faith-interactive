/**
 * Text Color Helper for Block Backgrounds
 *
 * Determines the appropriate text colors based on the block's textTheme setting
 * and background type. Used by block preview components.
 *
 * TEXT THEME VALUES:
 * - "light": White text (for dark/image backgrounds)
 * - "dark": Dark text (for light backgrounds)
 * - "auto": Uses --on-* tokens for brand colors, defaults to light for images/gradients
 *
 * IMPORTANT:
 * - When textTheme="auto" on a brand color background, use --on-primary/secondary/accent
 * - These tokens are calculated via luminance check in BrandingStyles
 * - Blocks should NOT implement per-block contrast logic
 */

import type { BlockBackground, TextTheme, ColorValue } from "@/types/blocks";
import { isBrandColorReference, getBrandColorName } from "@/types/blocks";
import { type ColorRole, isColorRole } from "@/lib/theme/tokens";
import { roleToTextVar, roleToMutedTextVar } from "@/lib/theme/role-helpers";

export interface TextColors {
  heading: string;
  text: string;
  subtext: string;
}

/**
 * Get the appropriate text colors based on textTheme and background.
 *
 * @param textTheme - The text theme setting ("light", "dark", or "auto")
 * @param backgroundType - The background type ("color", "gradient", "image", "video")
 * @param backgroundColor - Optional: the background color value (for auto detection)
 * @param useCssVars - Whether to return CSS variable references (true for public site, false for editor)
 */
export function getTextColors(
  textTheme: TextTheme | undefined,
  backgroundType: BlockBackground["type"] | undefined,
  backgroundColor?: ColorValue,
  useCssVars: boolean = true
): TextColors {
  // For "auto" textTheme with brand color backgrounds, use on-color tokens
  if (textTheme === "auto" && backgroundType === "color" && backgroundColor) {
    const onColorResult = getOnColorForBackground(backgroundColor, useCssVars);
    if (onColorResult) {
      return onColorResult;
    }
  }

  // Fallback to light/dark theme resolution
  const shouldUseLightTheme = resolveTextTheme(textTheme, backgroundType);

  if (useCssVars) {
    // Return CSS variable references for public site rendering
    return shouldUseLightTheme
      ? {
          heading: "var(--color-light-heading, #ffffff)",
          text: "var(--color-light-text, rgba(255, 255, 255, 0.9))",
          subtext: "var(--color-light-subtext, rgba(255, 255, 255, 0.7))",
        }
      : {
          heading: "var(--color-text)",
          text: "var(--color-text)",
          subtext: "var(--color-text-muted)",
        };
  }

  // Return static values for editor preview (where CSS vars might not be available)
  return shouldUseLightTheme
    ? {
        heading: "#ffffff",
        text: "rgba(255, 255, 255, 0.9)",
        subtext: "rgba(255, 255, 255, 0.7)",
      }
    : {
        heading: "#0f172a",
        text: "#0f172a",
        subtext: "#475569",
      };
}

/**
 * Get on-color tokens for a brand color background.
 * Returns null if the background is not a brand color.
 *
 * @param backgroundColor - The background color value
 * @param useCssVars - Whether to return CSS variable references
 */
function getOnColorForBackground(
  backgroundColor: ColorValue,
  useCssVars: boolean
): TextColors | null {
  // Check if it's a brand color reference (e.g., "brand:primary")
  if (isBrandColorReference(backgroundColor)) {
    const brandName = getBrandColorName(backgroundColor);
    if (brandName && isColorRole(brandName)) {
      const role = brandName as ColorRole;
      if (useCssVars) {
        return {
          heading: roleToTextVar(role),
          text: roleToTextVar(role),
          subtext: roleToMutedTextVar(role),
        };
      }
      // For editor preview, we can't easily resolve on-colors without context
      // Fall through to default behavior
    }
  }

  return null;
}

/**
 * Determine if light theme should be used based on textTheme setting and background type.
 */
export function resolveTextTheme(
  textTheme: TextTheme | undefined,
  backgroundType: BlockBackground["type"] | undefined
): boolean {
  // Explicit light/dark selection
  if (textTheme === "light") return true;
  if (textTheme === "dark") return false;

  // Auto-detection based on background type
  // Gradients, images, and videos typically need light text (white)
  // Color backgrounds default to light text (user should override if needed)
  if (!backgroundType || backgroundType === "color") {
    // For solid colors, default to light theme since most brand colors are dark
    return true;
  }

  // Gradients, images, and videos almost always need light text
  return true;
}

/**
 * Get Tailwind classes for text colors based on textTheme.
 * Uses CSS variables via arbitrary value syntax.
 */
export function getTextColorClasses(
  textTheme: TextTheme | undefined,
  backgroundType: BlockBackground["type"] | undefined
): { headingClass: string; textClass: string; subtextClass: string } {
  const shouldUseLightTheme = resolveTextTheme(textTheme, backgroundType);

  return shouldUseLightTheme
    ? {
        headingClass: "text-[var(--color-light-heading)]",
        textClass: "text-[var(--color-light-text)]",
        subtextClass: "text-[var(--color-light-subtext)]",
      }
    : {
        headingClass: "text-[var(--color-text)]",
        textClass: "text-[var(--color-text)]",
        subtextClass: "text-[var(--color-text-muted)]",
      };
}
