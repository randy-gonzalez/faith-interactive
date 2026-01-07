/**
 * Color Resolution Utility
 *
 * Resolves background roles and legacy brand color references to actual values.
 * Used by block previews and public rendering to support dynamic brand colors.
 *
 * NEW: Prefers role-based resolution (primary, secondary, accent, surface, muted)
 * LEGACY: Still supports brand:* references for backwards compatibility
 */

import {
  isBrandColorReference,
  getBrandColorName,
  type BrandColorName,
  type ColorValue,
  type BackgroundRole,
  BACKGROUND_ROLE_CSS_VAR,
} from "@/types/blocks";

/**
 * Brand colors structure matching the branding context.
 */
export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

/**
 * Default brand colors used as fallback.
 */
export const DEFAULT_BRAND_COLORS: BrandColors = {
  primary: "#1e40af",
  secondary: "#64748b",
  accent: "#f59e0b",
  background: "#ffffff",
  text: "#1f2937",
};

/**
 * Resolve a color value to an actual hex color.
 * If the color is a brand reference (e.g., "brand:primary"), it will be resolved
 * using the provided brand colors. Otherwise, the color is returned as-is.
 *
 * @param color - The color value to resolve (hex or brand reference)
 * @param brandColors - The brand colors to use for resolution
 * @param fallback - Fallback color if resolution fails
 * @returns The resolved hex color
 */
export function resolveColor(
  color: ColorValue | undefined,
  brandColors: BrandColors = DEFAULT_BRAND_COLORS,
  fallback: string = DEFAULT_BRAND_COLORS.primary
): string {
  if (!color) return fallback;

  // Check if it's a brand reference
  if (isBrandColorReference(color)) {
    const brandName = getBrandColorName(color);
    if (brandName && brandName in brandColors) {
      return brandColors[brandName];
    }
    // Invalid brand reference, return fallback
    return fallback;
  }

  // It's a hex value, return as-is
  return color;
}

/**
 * Resolve a color to a CSS variable reference for public site rendering.
 * This returns a var() reference that will be resolved by the browser using
 * the CSS custom properties set by BrandingStyles.
 *
 * @param color - The color value to resolve
 * @param fallback - Fallback color if not a brand reference
 * @returns CSS value (either var(--color-*) or the hex color)
 */
export function resolveColorToCssVar(
  color: ColorValue | undefined,
  fallback: string = "var(--color-primary)"
): string {
  if (!color) return fallback;

  // Check if it's a brand reference
  if (isBrandColorReference(color)) {
    const brandName = getBrandColorName(color);
    if (brandName) {
      return `var(--color-${brandName})`;
    }
    return fallback;
  }

  // It's a hex value, return as-is
  return color;
}

/**
 * Map brand color name to CSS variable name.
 */
export function brandColorToCssVar(name: BrandColorName): string {
  return `var(--color-${name})`;
}

/**
 * Check if a color value matches a specific brand color.
 * Compares both by reference and by hex value.
 */
export function colorMatchesBrand(
  color: ColorValue | undefined,
  brandName: BrandColorName,
  brandColors: BrandColors
): boolean {
  if (!color) return false;

  // Check if it's a direct brand reference
  if (isBrandColorReference(color)) {
    return getBrandColorName(color) === brandName;
  }

  // Check if the hex value matches the brand color
  return color.toLowerCase() === brandColors[brandName].toLowerCase();
}

/**
 * Get the brand color name that a hex color matches, if any.
 * Useful for detecting when a user selected a brand color by hex.
 */
export function getMatchingBrandColor(
  color: ColorValue | undefined,
  brandColors: BrandColors
): BrandColorName | null {
  if (!color) return null;

  // If it's already a brand reference, return the name
  if (isBrandColorReference(color)) {
    return getBrandColorName(color);
  }

  // Check against each brand color
  const normalizedColor = color.toLowerCase();
  for (const [name, brandHex] of Object.entries(brandColors)) {
    if (normalizedColor === brandHex.toLowerCase()) {
      return name as BrandColorName;
    }
  }

  return null;
}

/**
 * Brand color metadata for UI display.
 */
export const BRAND_COLOR_LABELS: Record<BrandColorName, string> = {
  primary: "Primary",
  secondary: "Secondary",
  accent: "Accent",
  background: "Background",
  text: "Text",
};

/**
 * Resolve a background role to actual hex color using brand colors.
 * Used in admin dashboard for preview rendering.
 */
export function resolveRoleToHex(
  role: BackgroundRole | undefined,
  brandColors: BrandColors = DEFAULT_BRAND_COLORS
): string {
  if (!role) return brandColors.primary;

  switch (role) {
    case "primary":
      return brandColors.primary;
    case "secondary":
      return brandColors.secondary;
    case "accent":
      return brandColors.accent;
    case "surface":
      return brandColors.background;
    case "muted":
      // Muted is a lighter shade - create a simple approximation
      // In practice, this should come from the theme
      return "#f3f4f6";
    default:
      return brandColors.primary;
  }
}

/**
 * Resolve a background role to CSS variable.
 * Used on public site where colors are defined via CSS custom properties.
 */
export function resolveRoleToCssVar(role: BackgroundRole | undefined): string {
  if (!role) return "var(--color-primary)";
  return BACKGROUND_ROLE_CSS_VAR[role] || "var(--color-primary)";
}
