/**
 * Block Styles Utility
 *
 * Shared CSS variable-based styles for all blocks.
 * Ensures consistent use of design tokens across the block system.
 *
 * IMPORTANT: All blocks MUST use CSS variables for:
 * - Colors (--color-*, --on-*)
 * - Spacing (--space-*)
 * - Typography (--font-*, --font-size-*)
 * - Radius (--radius, --btn-radius)
 * - Borders (--color-border)
 */

// =============================================================================
// CONTAINER
// Centered container with max-width from CSS variable
// =============================================================================

/**
 * Container classes for centered content.
 * Uses --container-max CSS variable for width (narrow: 56rem, normal: 72rem, wide: 88rem).
 */
export const CONTAINER = "w-full max-w-(--container-max) mx-auto";

/**
 * Container with horizontal padding.
 * For sections where the container needs its own padding.
 */
export const CONTAINER_PADDED = "w-full max-w-(--container-max) mx-auto px-[var(--space-5)]";

// =============================================================================
// SECTION PADDING
// Standard section padding using CSS spacing variables
// Uses higher tokens for more noticeable density impact
// =============================================================================

/**
 * Base section classes with spacing CSS variables.
 * - Top/bottom: var(--space-8) = 64px at comfortable density
 * - Left/right: var(--space-6) = 32px at comfortable density
 *
 * Higher tokens amplify the effect of density changes.
 */
export const SECTION_PADDING = "py-[var(--space-8)] px-[var(--space-6)]";

/**
 * Compact section padding for smaller blocks.
 * - Top/bottom: var(--space-7) = 48px at comfortable density
 * - Left/right: var(--space-5) = 24px at comfortable density
 */
export const SECTION_PADDING_COMPACT = "py-[var(--space-7)] px-[var(--space-5)]";

/**
 * Large section padding for hero-style blocks.
 * - Top/bottom: var(--space-8) = 64px at comfortable density
 * - Left/right: var(--space-6) = 32px at comfortable density
 */
export const SECTION_PADDING_LARGE = "py-[var(--space-8)] px-[var(--space-6)]";

// =============================================================================
// INTERNAL SPACING
// Spacing between elements within blocks
// =============================================================================

/**
 * Gap sizes using CSS variables
 */
export const GAP = {
  xs: "gap-[var(--space-1)]", // 4px
  sm: "gap-[var(--space-2)]", // 8px
  md: "gap-[var(--space-3)]", // 12px
  lg: "gap-[var(--space-4)]", // 16px
  xl: "gap-[var(--space-5)]", // 24px
  "2xl": "gap-[var(--space-6)]", // 32px
  "3xl": "gap-[var(--space-7)]", // 48px
} as const;

/**
 * Margin-bottom sizes using CSS variables
 */
export const MARGIN_BOTTOM = {
  xs: "mb-[var(--space-1)]",
  sm: "mb-[var(--space-2)]",
  md: "mb-[var(--space-3)]",
  lg: "mb-[var(--space-4)]",
  xl: "mb-[var(--space-5)]",
  "2xl": "mb-[var(--space-6)]",
  "3xl": "mb-[var(--space-7)]",
} as const;

/**
 * Margin-top sizes using CSS variables
 */
export const MARGIN_TOP = {
  xs: "mt-[var(--space-1)]",
  sm: "mt-[var(--space-2)]",
  md: "mt-[var(--space-3)]",
  lg: "mt-[var(--space-4)]",
  xl: "mt-[var(--space-5)]",
  "2xl": "mt-[var(--space-6)]",
  "3xl": "mt-[var(--space-7)]",
} as const;

/**
 * Padding sizes using CSS variables
 */
export const PADDING = {
  xs: "p-[var(--space-1)]",
  sm: "p-[var(--space-2)]",
  md: "p-[var(--space-3)]",
  lg: "p-[var(--space-4)]",
  xl: "p-[var(--space-5)]",
  "2xl": "p-[var(--space-6)]",
} as const;

// =============================================================================
// CARD STYLES
// =============================================================================

/**
 * Card background for surface (light) theme.
 * Uses CSS variable for surface color.
 */
export const CARD_SURFACE = "bg-[var(--color-surface)] rounded-[var(--radius)]";

/**
 * Card background for dark/image backgrounds (glassmorphism effect).
 */
export const CARD_GLASS = "bg-white/10 backdrop-blur-sm rounded-[var(--radius)]";

/**
 * Card with shadow for elevated appearance.
 */
export const CARD_ELEVATED = "bg-[var(--color-surface)] rounded-[var(--radius)] shadow-md";

/**
 * Get appropriate card style based on theme.
 * @param useLightTheme - Whether the background is dark (needs light text)
 */
export function getCardClasses(useLightTheme: boolean): string {
  return useLightTheme ? CARD_GLASS : CARD_ELEVATED;
}

// =============================================================================
// BUTTON STYLES
// =============================================================================

/**
 * Primary button using CSS variables.
 */
export const BUTTON_PRIMARY = `
  bg-[var(--btn-primary-bg)]
  text-[var(--btn-primary-text)]
  px-[var(--space-5)]
  py-[var(--space-3)]
  font-semibold
  rounded-[var(--btn-radius)]
  transition-opacity
  hover:opacity-90
`.replace(/\s+/g, " ").trim();

/**
 * Secondary button using CSS variables.
 */
export const BUTTON_SECONDARY = `
  bg-[var(--btn-secondary-bg)]
  text-[var(--btn-secondary-text)]
  px-[var(--space-5)]
  py-[var(--space-3)]
  font-semibold
  rounded-[var(--btn-radius)]
  transition-opacity
  hover:opacity-90
`.replace(/\s+/g, " ").trim();

/**
 * Outline button using CSS variables.
 */
export const BUTTON_OUTLINE = `
  bg-transparent
  text-[var(--btn-outline-text)]
  border-2
  border-[var(--btn-outline-border)]
  px-[var(--space-5)]
  py-[var(--space-3)]
  font-semibold
  rounded-[var(--btn-radius)]
  transition-all
  hover:bg-[var(--btn-outline-border)]
  hover:text-[var(--btn-primary-text)]
`.replace(/\s+/g, " ").trim();

/**
 * Accent button using CSS variables.
 */
export const BUTTON_ACCENT = `
  bg-[var(--btn-accent-bg)]
  text-[var(--btn-accent-text)]
  px-[var(--space-5)]
  py-[var(--space-3)]
  font-semibold
  rounded-[var(--btn-radius)]
  transition-opacity
  hover:opacity-90
`.replace(/\s+/g, " ").trim();

/**
 * Get button classes by variant.
 */
export function getButtonClasses(variant: "primary" | "secondary" | "outline" | "accent"): string {
  switch (variant) {
    case "primary":
      return BUTTON_PRIMARY;
    case "secondary":
      return BUTTON_SECONDARY;
    case "outline":
      return BUTTON_OUTLINE;
    case "accent":
      return BUTTON_ACCENT;
    default:
      return BUTTON_PRIMARY;
  }
}

// =============================================================================
// TYPOGRAPHY
// =============================================================================

/**
 * Heading classes using CSS variables.
 */
export const HEADING = {
  h1: "font-[var(--font-heading)] text-[length:var(--font-size-h1)] leading-tight",
  h2: "font-[var(--font-heading)] text-[length:var(--font-size-h2)] leading-tight",
  h3: "font-[var(--font-heading)] text-[length:var(--font-size-h3)] leading-tight",
  h4: "font-[var(--font-heading)] text-[length:var(--font-size-h4)] leading-tight",
} as const;

/**
 * Body text class using CSS variables.
 */
export const BODY_TEXT = "font-[var(--font-body)] text-[length:var(--font-size-base)] leading-[var(--line-height)]";

// =============================================================================
// BORDER / DIVIDER
// =============================================================================

/**
 * Border using CSS variable.
 */
export const BORDER = "border-[var(--color-border)]";

/**
 * Divider line using CSS variable.
 */
export const DIVIDER = "border-t border-[var(--color-border)]";

/**
 * Divide-y using CSS variable.
 */
export const DIVIDE_Y = "divide-y divide-[var(--color-border)]";

// =============================================================================
// FORM INPUTS
// =============================================================================

/**
 * Form input styles using CSS variables.
 */
export const INPUT_BASE = `
  bg-[var(--color-surface)]
  border
  border-[var(--color-border)]
  rounded-[var(--radius)]
  px-[var(--space-3)]
  py-[var(--space-2)]
  text-[var(--color-text)]
  placeholder:text-[var(--color-text-muted)]
  focus:outline-none
  focus:ring-2
  focus:ring-[var(--color-primary)]
  focus:border-transparent
`.replace(/\s+/g, " ").trim();

/**
 * Form textarea styles using CSS variables.
 */
export const TEXTAREA_BASE = `
  ${INPUT_BASE}
  min-h-[120px]
  resize-y
`.replace(/\s+/g, " ").trim();

// =============================================================================
// EMPTY STATE
// =============================================================================

/**
 * Empty state placeholder styling.
 */
export const EMPTY_STATE = `
  border-2
  border-dashed
  border-[var(--color-border)]
  rounded-[var(--radius)]
  p-[var(--space-6)]
  text-center
  text-[var(--color-text-muted)]
  italic
`.replace(/\s+/g, " ").trim();

// =============================================================================
// LINK STYLES
// =============================================================================

/**
 * Primary link color using CSS variables.
 */
export const LINK = "text-[var(--link-color)] hover:text-[var(--link-hover-color)] transition-colors";

/**
 * Primary brand link color.
 */
export const LINK_PRIMARY = "text-[var(--color-primary)] hover:opacity-80 transition-opacity";

// =============================================================================
// HERO BLOCK LAYOUT
// Height modes, vertical alignment, and responsive padding presets
// =============================================================================

import type { HeroHeightMode, HeroVerticalAlign, HeroPaddingPreset } from "@/types/blocks";

/**
 * Hero height mode classes.
 * - content: No min-height, collapses to content (default/backward compatible)
 * - large: ~70vh for tall but not full-screen heroes
 * - screen: Full viewport minus optional header offset
 */
export const HERO_HEIGHT_CLASSES: Record<HeroHeightMode, string> = {
  content: "",
  large: "min-h-[70vh]",
  screen: "min-h-[calc(100vh-var(--header-offset,0px))]",
};

/**
 * Hero vertical alignment classes (using flexbox).
 * Applied to the outer hero container.
 */
export const HERO_VERTICAL_ALIGN_CLASSES: Record<HeroVerticalAlign, string> = {
  top: "justify-start",
  center: "justify-center",
  bottom: "justify-end",
};

/**
 * Hero padding presets - token-based responsive padding.
 * Each preset has mobile and desktop (lg+) values.
 * Uses CSS calc() with spacing variables for consistency with density settings.
 *
 * Tight: Minimal padding for image-heavy heroes
 * Standard: Default balanced padding
 * Roomy: Extra breathing room for text-focused heroes
 */
export const HERO_PADDING_PRESETS: Record<HeroPaddingPreset, {
  mobile: string;
  desktop: string;
}> = {
  tight: {
    mobile: "py-[var(--space-7)] px-[var(--space-5)]",
    desktop: "lg:py-[var(--space-8)] lg:px-[var(--space-6)]",
  },
  standard: {
    mobile: "py-[var(--space-8)] px-[var(--space-6)]",
    desktop: "lg:py-[calc(var(--space-8)+var(--space-4))] lg:px-[var(--space-7)]",
  },
  roomy: {
    mobile: "py-[calc(var(--space-8)+var(--space-3))] px-[var(--space-6)]",
    desktop: "lg:py-[calc(var(--space-8)+var(--space-6))] lg:px-[var(--space-7)]",
  },
};

/**
 * Get combined hero layout classes based on settings.
 * Returns a single string of Tailwind classes.
 */
export function getHeroLayoutClasses(
  heightMode: HeroHeightMode = "content",
  verticalAlign: HeroVerticalAlign = "center",
  paddingPreset: HeroPaddingPreset = "standard"
): string {
  const height = HERO_HEIGHT_CLASSES[heightMode];
  const align = HERO_VERTICAL_ALIGN_CLASSES[verticalAlign];
  const padding = HERO_PADDING_PRESETS[paddingPreset];

  return [
    height,
    align,
    padding.mobile,
    padding.desktop,
  ].filter(Boolean).join(" ");
}
