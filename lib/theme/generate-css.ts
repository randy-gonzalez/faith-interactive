/**
 * CSS Variable Generator
 *
 * Generates CSS custom properties from ThemeTokens for :root injection.
 * Includes:
 * - Brand colors with auto-generated on-color tokens
 * - Fixed neutral colors (MVP - not customizable)
 * - Spacing ramp (--space-1 through --space-8)
 * - Typography variables
 * - Border radius and button styling
 */

import {
  ThemeTokens,
  DEFAULT_THEME_TOKENS,
  FIXED_NEUTRALS,
  BASE_SPACING_RAMP,
  DENSITY_MULTIPLIERS,
} from "./tokens";

// =============================================================================
// LUMINANCE & CONTRAST UTILITIES
// =============================================================================

/**
 * Calculate relative luminance of a hex color.
 * Uses the WCAG formula for perceptual brightness.
 *
 * @param hex - Hex color string (with or without #)
 * @returns Luminance value between 0 (black) and 1 (white)
 */
export function getLuminance(hex: string): number {
  const color = hex.replace(/^#/, "");

  // Handle shorthand hex (e.g., #fff -> #ffffff)
  const fullHex =
    color.length === 3
      ? color
          .split("")
          .map((c) => c + c)
          .join("")
      : color;

  const r = parseInt(fullHex.slice(0, 2), 16) / 255;
  const g = parseInt(fullHex.slice(2, 4), 16) / 255;
  const b = parseInt(fullHex.slice(4, 6), 16) / 255;

  // Apply sRGB gamma correction
  const [rs, gs, bs] = [r, g, b].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );

  // Calculate luminance
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Determine the best on-color (text color) for a background.
 * Returns white for dark backgrounds, dark text for light backgrounds.
 *
 * @param backgroundColor - Hex color of the background
 * @returns "#ffffff" for dark backgrounds, dark color for light backgrounds
 */
export function getOnColor(backgroundColor: string): string {
  const luminance = getLuminance(backgroundColor);

  // Use white text if background is dark (luminance < 0.5)
  // Use dark text if background is light
  return luminance < 0.5 ? "#ffffff" : FIXED_NEUTRALS.text;
}

// =============================================================================
// SPACING CALCULATION
// =============================================================================

/**
 * Calculate the spacing ramp based on density.
 *
 * @param density - The density setting
 * @returns Array of 8 spacing values in pixels
 */
export function calculateSpacingRamp(
  density: ThemeTokens["density"]
): number[] {
  const multiplier = DENSITY_MULTIPLIERS[density];
  return BASE_SPACING_RAMP.map((value) => Math.round(value * multiplier));
}

// =============================================================================
// TYPOGRAPHY CALCULATION
// =============================================================================

/**
 * Calculate heading sizes using modular scale.
 *
 * @param baseFontSize - Base font size in pixels
 * @param scale - Scale ratio (e.g., 1.25)
 * @returns Object with h1-h4 sizes
 */
export function calculateHeadingSizes(
  baseFontSize: number,
  scale: number
): { h1: number; h2: number; h3: number; h4: number } {
  return {
    h4: Math.round(baseFontSize * Math.pow(scale, 1) * 100) / 100,
    h3: Math.round(baseFontSize * Math.pow(scale, 2) * 100) / 100,
    h2: Math.round(baseFontSize * Math.pow(scale, 3) * 100) / 100,
    h1: Math.round(baseFontSize * Math.pow(scale, 4) * 100) / 100,
  };
}

// =============================================================================
// BUTTON RADIUS
// =============================================================================

/**
 * Get button radius based on button style.
 *
 * @param buttonStyle - The button style setting
 * @param baseRadius - The base radius value
 * @returns CSS radius value
 */
export function getButtonRadius(
  buttonStyle: ThemeTokens["buttonStyle"],
  baseRadius: number
): string {
  switch (buttonStyle) {
    case "pill":
      return "9999px";
    case "square":
      return "0px";
    case "rounded":
    default:
      return `${baseRadius}px`;
  }
}

// =============================================================================
// FONT FAMILY FORMATTING
// =============================================================================

/**
 * Format font family for CSS.
 * Adds quotes if font name contains spaces and appends fallbacks.
 *
 * @param fontName - Google Fonts name or system font
 * @returns Formatted CSS font-family value
 */
export function formatFontFamily(fontName: string): string {
  if (!fontName || fontName === "system-ui") {
    return "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  }

  // Quote font names that contain spaces or special characters
  const quotedName = fontName.includes(" ") ? `"${fontName}"` : fontName;
  return `${quotedName}, system-ui, sans-serif`;
}

// =============================================================================
// CSS GENERATION
// =============================================================================

/**
 * Generate CSS custom properties string from ThemeTokens.
 * This is injected into :root on the public church site.
 *
 * @param tokens - Theme tokens (uses defaults for missing values)
 * @returns CSS string for injection via <style>
 */
export function generateCssVariables(
  tokens: Partial<ThemeTokens> = {}
): string {
  // Merge with defaults
  const mergedTokens: ThemeTokens = {
    colors: {
      ...DEFAULT_THEME_TOKENS.colors,
      ...tokens.colors,
    },
    typography: {
      ...DEFAULT_THEME_TOKENS.typography,
      ...tokens.typography,
    },
    density: tokens.density ?? DEFAULT_THEME_TOKENS.density,
    contentWidth: tokens.contentWidth ?? DEFAULT_THEME_TOKENS.contentWidth,
    radius: tokens.radius ?? DEFAULT_THEME_TOKENS.radius,
    buttonStyle: tokens.buttonStyle ?? DEFAULT_THEME_TOKENS.buttonStyle,
  };

  // Calculate derived values
  const spacing = calculateSpacingRamp(mergedTokens.density);
  const headings = calculateHeadingSizes(
    mergedTokens.typography.baseFontSize,
    mergedTokens.typography.scale
  );

  // Calculate on-colors (contrast text for brand backgrounds)
  const onPrimary = getOnColor(mergedTokens.colors.primary);
  const onSecondary = getOnColor(mergedTokens.colors.secondary);
  const onAccent = getOnColor(mergedTokens.colors.accent);

  // Format font families
  const fontHeading = formatFontFamily(mergedTokens.typography.fontHeading);
  const fontBody = formatFontFamily(mergedTokens.typography.fontBody);

  // Button radius
  const btnRadius = getButtonRadius(
    mergedTokens.buttonStyle,
    mergedTokens.radius
  );

  return `
:root {
  /* ========================================
   * BRAND COLORS
   * ======================================== */
  --color-primary: ${mergedTokens.colors.primary};
  --color-secondary: ${mergedTokens.colors.secondary};
  --color-accent: ${mergedTokens.colors.accent};

  /* On-colors (text on brand backgrounds) */
  --on-primary: ${onPrimary};
  --on-secondary: ${onSecondary};
  --on-accent: ${onAccent};

  /* ========================================
   * NEUTRAL COLORS (FIXED - MVP)
   * ======================================== */
  --color-surface: ${FIXED_NEUTRALS.surface};
  --color-surface-muted: ${FIXED_NEUTRALS.surfaceMuted};
  --color-text: ${FIXED_NEUTRALS.text};
  --color-text-muted: ${FIXED_NEUTRALS.textMuted};
  --color-border: ${FIXED_NEUTRALS.border};

  /* ========================================
   * SPACING RAMP
   * Density: ${mergedTokens.density} (${DENSITY_MULTIPLIERS[mergedTokens.density]}x)
   * ======================================== */
  --space-1: ${spacing[0]}px;
  --space-2: ${spacing[1]}px;
  --space-3: ${spacing[2]}px;
  --space-4: ${spacing[3]}px;
  --space-5: ${spacing[4]}px;
  --space-6: ${spacing[5]}px;
  --space-7: ${spacing[6]}px;
  --space-8: ${spacing[7]}px;

  /* ========================================
   * TYPOGRAPHY
   * Scale: ${mergedTokens.typography.scale} (${mergedTokens.typography.baseFontSize}px base)
   * ======================================== */
  --font-heading: ${fontHeading};
  --font-body: ${fontBody};
  --font-size-base: ${mergedTokens.typography.baseFontSize}px;
  --line-height: ${mergedTokens.typography.lineHeight};

  /* Heading sizes (modular scale) */
  --font-size-h1: ${headings.h1}px;
  --font-size-h2: ${headings.h2}px;
  --font-size-h3: ${headings.h3}px;
  --font-size-h4: ${headings.h4}px;

  /* ========================================
   * BORDER RADIUS
   * ======================================== */
  --radius: ${mergedTokens.radius}px;
  --radius-sm: ${Math.round(mergedTokens.radius * 0.5)}px;
  --radius-lg: ${Math.round(mergedTokens.radius * 1.5)}px;
  --radius-full: 9999px;

  /* Button-specific radius */
  --btn-radius: ${btnRadius};

  /* ========================================
   * BUTTON COLORS
   * ======================================== */
  /* Primary button */
  --btn-primary-bg: ${mergedTokens.colors.primary};
  --btn-primary-text: ${onPrimary};

  /* Secondary button */
  --btn-secondary-bg: ${mergedTokens.colors.secondary};
  --btn-secondary-text: ${onSecondary};

  /* Outline button */
  --btn-outline-text: ${mergedTokens.colors.primary};
  --btn-outline-border: ${mergedTokens.colors.primary};

  /* ========================================
   * ON-DARK BUTTONS (for image/gradient backgrounds)
   * These are used when buttons appear over dark backgrounds
   * ======================================== */
  --on-dark-btn-bg: #ffffff;
  --on-dark-btn-text: ${FIXED_NEUTRALS.text};
  --on-dark-btn-secondary-bg: rgba(255, 255, 255, 0.2);
  --on-dark-btn-secondary-text: #ffffff;
  --on-dark-btn-outline-text: #ffffff;
  --on-dark-btn-outline-border: #ffffff;

  /* ========================================
   * LIVE INDICATOR (for watch-live block)
   * ======================================== */
  --color-live-bg: #dc2626;
  --color-live-text: #ffffff;
}
`.trim();
}

/**
 * Generate the global typography styles that should accompany the CSS variables.
 * These apply the variables to HTML elements.
 */
export function generateGlobalStyles(): string {
  return `
/* Global Typography */
body {
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  line-height: var(--line-height);
  color: var(--color-text);
  background-color: var(--color-surface);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  line-height: 1.2;
  color: var(--color-text);
}

h1 { font-size: var(--font-size-h1); }
h2 { font-size: var(--font-size-h2); }
h3 { font-size: var(--font-size-h3); }
h4 { font-size: var(--font-size-h4); }

/* Prose content */
.prose {
  font-family: var(--font-body);
  line-height: var(--line-height);
}

.prose h1, .prose h2, .prose h3, .prose h4 {
  font-family: var(--font-heading);
}
`.trim();
}
