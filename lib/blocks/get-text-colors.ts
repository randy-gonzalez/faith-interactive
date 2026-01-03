/**
 * Text Color Helper for Block Backgrounds
 *
 * Determines the appropriate text colors based on the block's textTheme setting
 * and background type. Used by block preview components.
 */

import type { BlockBackground, TextTheme } from "@/types/blocks";

export interface TextColors {
  heading: string;
  text: string;
  subtext: string;
}

/**
 * Get the appropriate text colors based on textTheme and background type.
 *
 * @param textTheme - The text theme setting ("light", "dark", or "auto")
 * @param backgroundType - The background type ("color", "gradient", "image", "video")
 * @param useCssVars - Whether to return CSS variable references (true for public site, false for editor)
 */
export function getTextColors(
  textTheme: TextTheme | undefined,
  backgroundType: BlockBackground["type"] | undefined,
  useCssVars: boolean = true
): TextColors {
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
          heading: "var(--color-text, #1f2937)",
          text: "var(--color-text, #1f2937)",
          subtext: "var(--color-secondary, #6b7280)",
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
        heading: "#1f2937",
        text: "#1f2937",
        subtext: "#6b7280",
      };
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
 * Use this for simple cases where CSS variables aren't needed.
 */
export function getTextColorClasses(
  textTheme: TextTheme | undefined,
  backgroundType: BlockBackground["type"] | undefined
): { headingClass: string; textClass: string; subtextClass: string } {
  const shouldUseLightTheme = resolveTextTheme(textTheme, backgroundType);

  return shouldUseLightTheme
    ? {
        headingClass: "text-white",
        textClass: "text-white/90",
        subtextClass: "text-white/70",
      }
    : {
        headingClass: "text-gray-900",
        textClass: "text-gray-800",
        subtextClass: "text-gray-600",
      };
}
