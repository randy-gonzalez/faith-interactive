/**
 * Role Helper Utilities
 *
 * Maps semantic color roles to CSS variable references.
 * Blocks store roles (primary, secondary, accent, surface, surfaceMuted)
 * and these helpers convert them to CSS var() references.
 *
 * IMPORTANT:
 * - Blocks should NEVER store raw hex values for backgrounds
 * - Use roleToBgVar() for background colors
 * - Use roleToTextVar() for text colors (uses --on-* for brand roles)
 */

import { ColorRole, isColorRole } from "./tokens";

// =============================================================================
// BACKGROUND COLOR HELPERS
// =============================================================================

/**
 * Convert a color role to a CSS variable reference for background.
 *
 * @param role - Semantic color role
 * @returns CSS var() reference, e.g., "var(--color-primary)"
 *
 * @example
 * roleToBgVar("primary") // => "var(--color-primary)"
 * roleToBgVar("surface") // => "var(--color-surface)"
 * roleToBgVar("surfaceMuted") // => "var(--color-surface-muted)"
 */
export function roleToBgVar(role: ColorRole): string {
  switch (role) {
    case "primary":
      return "var(--color-primary)";
    case "secondary":
      return "var(--color-secondary)";
    case "accent":
      return "var(--color-accent)";
    case "surface":
      return "var(--color-surface)";
    case "surfaceMuted":
      return "var(--color-surface-muted)";
    default:
      // TypeScript exhaustiveness check
      const _exhaustive: never = role;
      return "var(--color-surface)";
  }
}

/**
 * Convert a role string to a background CSS variable, with validation.
 * Returns undefined for invalid roles.
 *
 * @param role - String that might be a color role
 * @returns CSS var() reference or undefined
 */
export function safeRoleToBgVar(role: string | undefined): string | undefined {
  if (!role || !isColorRole(role)) {
    return undefined;
  }
  return roleToBgVar(role);
}

// =============================================================================
// TEXT COLOR HELPERS
// =============================================================================

/**
 * Convert a color role to a CSS variable reference for text.
 *
 * For brand roles (primary, secondary, accent), returns the --on-* token
 * which has been calculated for proper contrast.
 *
 * For surface roles (surface, surfaceMuted), returns --color-text
 * since surfaces use the standard text color.
 *
 * @param role - Semantic color role (used as background)
 * @returns CSS var() reference for text on that background
 *
 * @example
 * roleToTextVar("primary") // => "var(--on-primary)"
 * roleToTextVar("surface") // => "var(--color-text)"
 */
export function roleToTextVar(role: ColorRole): string {
  switch (role) {
    case "primary":
      return "var(--on-primary)";
    case "secondary":
      return "var(--on-secondary)";
    case "accent":
      return "var(--on-accent)";
    case "surface":
    case "surfaceMuted":
      return "var(--color-text)";
    default:
      const _exhaustive: never = role;
      return "var(--color-text)";
  }
}

/**
 * Convert a role string to a text CSS variable, with validation.
 * Returns undefined for invalid roles.
 *
 * @param role - String that might be a color role
 * @returns CSS var() reference or undefined
 */
export function safeRoleToTextVar(role: string | undefined): string | undefined {
  if (!role || !isColorRole(role)) {
    return undefined;
  }
  return roleToTextVar(role);
}

// =============================================================================
// MUTED TEXT HELPERS
// =============================================================================

/**
 * Get muted/secondary text color for a background role.
 *
 * For brand roles, returns a slightly transparent version of the on-color.
 * For surface roles, returns --color-text-muted.
 *
 * @param role - Semantic color role (used as background)
 * @returns CSS for muted text on that background
 *
 * @example
 * roleToMutedTextVar("primary") // => "var(--on-primary)" with opacity
 * roleToMutedTextVar("surface") // => "var(--color-text-muted)"
 */
export function roleToMutedTextVar(role: ColorRole): string {
  switch (role) {
    case "primary":
    case "secondary":
    case "accent":
      // For brand colors, use the on-color (browser doesn't support opacity on vars directly)
      // Consider: could use color-mix() in modern browsers
      return roleToTextVar(role);
    case "surface":
    case "surfaceMuted":
      return "var(--color-text-muted)";
    default:
      const _exhaustive: never = role;
      return "var(--color-text-muted)";
  }
}

// =============================================================================
// BORDER COLOR HELPERS
// =============================================================================

/**
 * Get border color for a background role.
 *
 * @param role - Semantic color role (used as background)
 * @returns CSS var() reference for border on that background
 */
export function roleToBorderVar(role: ColorRole): string {
  switch (role) {
    case "primary":
    case "secondary":
    case "accent":
      // For brand colors, use a slightly transparent version of on-color
      return roleToTextVar(role);
    case "surface":
    case "surfaceMuted":
      return "var(--color-border)";
    default:
      const _exhaustive: never = role;
      return "var(--color-border)";
  }
}

// =============================================================================
// TAILWIND CLASS GENERATORS
// =============================================================================

/**
 * Generate Tailwind classes using CSS variables for a color role.
 * Uses arbitrary value syntax: bg-[var(--color-primary)]
 *
 * @param role - Semantic color role
 * @returns Object with Tailwind class strings
 *
 * @example
 * roleToTailwindClasses("primary")
 * // => {
 * //   bg: "bg-[var(--color-primary)]",
 * //   text: "text-[var(--on-primary)]",
 * //   border: "border-[var(--on-primary)]"
 * // }
 */
export function roleToTailwindClasses(role: ColorRole): {
  bg: string;
  text: string;
  textMuted: string;
  border: string;
} {
  return {
    bg: `bg-[${roleToBgVar(role)}]`,
    text: `text-[${roleToTextVar(role)}]`,
    textMuted: `text-[${roleToMutedTextVar(role)}]`,
    border: `border-[${roleToBorderVar(role)}]`,
  };
}

// =============================================================================
// SPACING HELPERS
// =============================================================================

/**
 * Get a spacing CSS variable reference.
 *
 * @param step - Spacing step (1-8)
 * @returns CSS var() reference
 *
 * @example
 * spaceVar(4) // => "var(--space-4)"
 */
export function spaceVar(step: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8): string {
  return `var(--space-${step})`;
}

/**
 * Generate Tailwind padding classes using spacing variables.
 *
 * @param step - Spacing step (1-8)
 * @returns Tailwind class string
 *
 * @example
 * spacingClass("p", 4) // => "p-[var(--space-4)]"
 * spacingClass("px", 6) // => "px-[var(--space-6)]"
 */
export function spacingClass(
  prefix: "p" | "px" | "py" | "pt" | "pr" | "pb" | "pl" | "m" | "mx" | "my" | "mt" | "mr" | "mb" | "ml" | "gap",
  step: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
): string {
  return `${prefix}-[var(--space-${step})]`;
}
