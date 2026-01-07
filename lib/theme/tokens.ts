/**
 * Theme Tokens
 *
 * Design tokens for the church CMS theming system.
 * Tokens are global design values stored per church:
 * - Colors (primary, secondary, accent)
 * - Typography (font families, modular scale)
 * - Spacing (8-step ramp with density multiplier)
 * - Radius (global border radius)
 *
 * IMPORTANT:
 * - Neutrals are fixed and NOT editable (MVP)
 * - Blocks store semantic roles (primary/secondary/accent/surface/muted) - never raw hex
 * - All public components use CSS variables (var(--...))
 */

// =============================================================================
// SEMANTIC COLOR ROLES
// =============================================================================

/**
 * Semantic color roles for block backgrounds.
 * Blocks store these roles, not raw hex values.
 */
export type ColorRole = "primary" | "secondary" | "accent" | "surface" | "surfaceMuted";

/**
 * Check if a value is a valid color role.
 */
export function isColorRole(value: string): value is ColorRole {
  return ["primary", "secondary", "accent", "surface", "surfaceMuted"].includes(value);
}

// =============================================================================
// TYPOGRAPHY
// =============================================================================

/**
 * Typography configuration using modular scale.
 * Headings are computed from: baseSize * scale^n
 * where n = 1 for h4, 2 for h3, 3 for h2, 4 for h1
 */
export interface TypographyTokens {
  /** Primary font for headings (Google Fonts name or system font) */
  fontHeading: string;
  /** Secondary font for body text */
  fontBody: string;
  /** Base font size in pixels (typically 16) */
  baseFontSize: number;
  /** Modular scale ratio (e.g., 1.25 for "Major Third") */
  scale: number;
  /** Line height for body text (e.g., 1.5) */
  lineHeight: number;
}

// =============================================================================
// SPACING
// =============================================================================

/**
 * Spacing density options.
 * Multiplies the base 8-step spacing ramp.
 */
export type SpacingDensity = "compact" | "comfortable" | "spacious";

/**
 * Density multipliers for the spacing ramp.
 * - compact: 0.85x (noticeably tighter)
 * - comfortable: 1x (default)
 * - spacious: 1.25x (noticeably more breathing room)
 *
 * Values chosen to produce visible differences when toggling density.
 */
export const DENSITY_MULTIPLIERS: Record<SpacingDensity, number> = {
  compact: 0.85,
  comfortable: 1,
  spacious: 1.25,
};

/**
 * Base spacing ramp (in pixels).
 * Each step is roughly 1.5x the previous.
 * Multiplied by density to get final values.
 */
export const BASE_SPACING_RAMP = [4, 8, 12, 16, 24, 32, 48, 64] as const;

// =============================================================================
// LAYOUT
// =============================================================================

/**
 * Content width options for the main container.
 * Controls how wide content appears on large screens.
 */
export type ContentWidth = "narrow" | "normal" | "wide";

/**
 * Content width values in rem.
 * - narrow: 56rem (896px) - reading focused, blog-style
 * - normal: 72rem (1152px) - balanced default
 * - wide: 88rem (1408px) - fills large screens
 */
export const CONTENT_WIDTH_VALUES: Record<ContentWidth, string> = {
  narrow: "56rem",
  normal: "72rem",
  wide: "88rem",
};

// =============================================================================
// NEUTRAL COLORS (FIXED - NOT EDITABLE IN MVP)
// =============================================================================

/**
 * Fixed neutral colors for MVP.
 * These are NOT stored in the database - they're constants.
 */
export const FIXED_NEUTRALS = {
  surface: "#ffffff",
  surfaceMuted: "#f8fafc",
  text: "#0f172a",
  textMuted: "#475569",
  border: "#e2e8f0",
} as const;

// =============================================================================
// THEME TOKENS
// =============================================================================

/**
 * Complete theme tokens stored per church.
 * Used to generate CSS variables for :root.
 */
export interface ThemeTokens {
  /**
   * Brand colors - the core customizable palette.
   * On-color tokens are auto-generated using luminance check.
   */
  colors: {
    /** Primary brand color (e.g., "#1e40af") */
    primary: string;
    /** Secondary brand color */
    secondary: string;
    /** Accent color for highlights */
    accent: string;
  };

  /** Typography settings */
  typography: TypographyTokens;

  /** Global spacing density */
  density: SpacingDensity;

  /** Global content width for containers */
  contentWidth: ContentWidth;

  /** Global border radius in pixels */
  radius: number;

  /** Button-specific styling */
  buttonStyle: "rounded" | "pill" | "square";
}

// =============================================================================
// DEFAULT TOKENS
// =============================================================================

/**
 * Default theme tokens used as fallback.
 */
export const DEFAULT_THEME_TOKENS: ThemeTokens = {
  colors: {
    primary: "#2563eb", // Blue-600
    secondary: "#6b7280", // Gray-500
    accent: "#f59e0b", // Amber-500
  },
  typography: {
    fontHeading: "system-ui",
    fontBody: "system-ui",
    baseFontSize: 16,
    scale: 1.25,
    lineHeight: 1.5,
  },
  density: "comfortable",
  contentWidth: "normal",
  radius: 8,
  buttonStyle: "rounded",
};

// =============================================================================
// EXAMPLE TOKEN JSON
// =============================================================================

/**
 * Example token JSON for documentation.
 * This is what would be stored in the database.
 */
export const EXAMPLE_THEME_TOKENS: ThemeTokens = {
  colors: {
    primary: "#1e40af", // Deep blue
    secondary: "#64748b", // Slate
    accent: "#f59e0b", // Amber
  },
  typography: {
    fontHeading: "Montserrat",
    fontBody: "Open Sans",
    baseFontSize: 16,
    scale: 1.25,
    lineHeight: 1.6,
  },
  density: "comfortable",
  contentWidth: "normal",
  radius: 8,
  buttonStyle: "rounded",
};
