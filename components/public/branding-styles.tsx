/**
 * Branding Styles Component
 *
 * Injects CSS custom properties and global styles based on church branding settings.
 * These variables are used throughout the public site for consistent branding.
 *
 * CSS Variable Architecture:
 * - Brand colors: --color-primary, --color-secondary, --color-accent
 * - On-colors (for text on brand backgrounds): --on-primary, --on-secondary, --on-accent
 * - Neutrals (fixed MVP): --color-surface, --color-surface-muted, --color-text, --color-text-muted, --color-border
 * - Spacing ramp: --space-1 through --space-8
 * - Typography: --font-heading, --font-body, --font-size-base, heading sizes
 * - Radius: --radius, --radius-sm, --radius-lg, --btn-radius
 *
 * IMPORTANT: All public components must use CSS variables, never hardcoded values.
 */

import type { BrandingData } from "@/lib/public/get-site-data";
import {
  FIXED_NEUTRALS,
  BASE_SPACING_RAMP,
  DENSITY_MULTIPLIERS,
  CONTENT_WIDTH_VALUES,
  type SpacingDensity,
  type ContentWidth,
} from "@/lib/theme/tokens";
import {
  getLuminance,
  getOnColor,
  calculateHeadingSizes,
  formatFontFamily,
} from "@/lib/theme/generate-css";

interface BrandingStylesProps {
  branding: BrandingData | null;
}

/**
 * Get button radius based on button style.
 */
function getButtonRadius(branding: BrandingData | null, baseRadius: number): string {
  if (!branding) return `${baseRadius}px`;

  switch (branding.buttonStyle) {
    case "pill":
      return "9999px";
    case "square":
      return "0px";
    case "rounded":
    default:
      return `${branding.buttonRadius ?? baseRadius}px`;
  }
}

/**
 * Calculate spacing ramp based on density.
 * Uses the density from branding settings, defaulting to "comfortable".
 */
function calculateSpacingRamp(density: SpacingDensity = "comfortable"): number[] {
  const multiplier = DENSITY_MULTIPLIERS[density];
  return BASE_SPACING_RAMP.map((value) => Math.round(value * multiplier));
}

/**
 * Generate Google Fonts URL for the specified fonts.
 */
function getGoogleFontsUrl(branding: BrandingData | null): string | null {
  if (!branding) return null;

  const fonts: string[] = [];

  if (branding.fontPrimary && branding.fontPrimary !== "system-ui") {
    fonts.push(`family=${encodeURIComponent(branding.fontPrimary)}:wght@400;500;600;700`);
  }

  if (
    branding.fontSecondary &&
    branding.fontSecondary !== "system-ui" &&
    branding.fontSecondary !== branding.fontPrimary
  ) {
    fonts.push(`family=${encodeURIComponent(branding.fontSecondary)}:wght@400;500;600`);
  }

  if (fonts.length === 0) return null;

  return `https://fonts.googleapis.com/css2?${fonts.join("&")}&display=swap`;
}

export function BrandingStyles({ branding }: BrandingStylesProps) {
  // ==========================================================================
  // BRAND COLORS
  // ==========================================================================
  const defaultPrimary = "#2563eb";
  const defaultSecondary = "#6b7280";
  const defaultAccent = "#f59e0b";

  const colorPrimary = branding?.colorPrimary || defaultPrimary;
  const colorSecondary = branding?.colorSecondary || defaultSecondary;
  const colorAccent = branding?.colorAccent || defaultAccent;

  // Calculate on-colors (contrast text for brand backgrounds)
  const onPrimary = getOnColor(colorPrimary);
  const onSecondary = getOnColor(colorSecondary);
  const onAccent = getOnColor(colorAccent);

  // ==========================================================================
  // TYPOGRAPHY
  // ==========================================================================
  const fontSizeBase = branding?.fontSizeBase ?? 16;
  const headingScale = branding?.headingScale ?? 1.25;
  const lineHeight = branding?.lineHeight ?? 1.5;

  // Calculate heading sizes using modular scale
  const headings = calculateHeadingSizes(fontSizeBase, headingScale);

  // Format font families
  const fontHeading = formatFontFamily(branding?.fontPrimary || "system-ui");
  const fontBody = formatFontFamily(branding?.fontSecondary || "system-ui");

  // ==========================================================================
  // SPACING & LAYOUT
  // ==========================================================================
  const density = (branding?.spacingDensity as SpacingDensity) || "comfortable";
  const spacing = calculateSpacingRamp(density);
  const contentWidth = (branding?.contentWidth as ContentWidth) || "normal";
  const containerMax = CONTENT_WIDTH_VALUES[contentWidth];

  // ==========================================================================
  // RADIUS
  // ==========================================================================
  const baseRadius = branding?.borderRadius ?? 8;
  const btnRadius = getButtonRadius(branding, baseRadius);

  // Google Fonts URL
  const googleFontsUrl = getGoogleFontsUrl(branding);

  // ==========================================================================
  // GENERATE CSS
  // ==========================================================================
  const cssVars = `
:root {
  /* ========================================
   * BRAND COLORS
   * ======================================== */
  --color-primary: ${colorPrimary};
  --color-secondary: ${colorSecondary};
  --color-accent: ${colorAccent};

  /* On-colors (text on brand backgrounds - auto-calculated for contrast) */
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

  /* Legacy aliases for backward compatibility */
  --color-background: ${FIXED_NEUTRALS.surface};

  /* ========================================
   * SPACING RAMP (8-step, density-adjusted)
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
   * ======================================== */
  --font-heading: ${fontHeading};
  --font-body: ${fontBody};
  --font-size-base: ${fontSizeBase}px;
  --line-height: ${lineHeight};

  /* Heading sizes (modular scale: ${headingScale}) */
  --font-size-h1: ${headings.h1}px;
  --font-size-h2: ${headings.h2}px;
  --font-size-h3: ${headings.h3}px;
  --font-size-h4: ${headings.h4}px;

  /* Legacy aliases for backward compatibility */
  --font-primary: ${fontHeading};
  --font-secondary: ${fontBody};
  --heading-scale: ${headingScale};

  /* ========================================
   * CONTAINER WIDTH
   * ======================================== */
  --container-max: ${containerMax};

  /* ========================================
   * BORDER RADIUS
   * ======================================== */
  --radius: ${baseRadius}px;
  --radius-sm: ${Math.round(baseRadius * 0.5)}px;
  --radius-lg: ${Math.round(baseRadius * 1.5)}px;
  --radius-full: 9999px;
  --btn-radius: ${btnRadius};

  /* Legacy alias */
  --border-radius: ${baseRadius}px;

  /* ========================================
   * BUTTON COLORS (for themed buttons)
   * ======================================== */
  --btn-primary-bg: ${branding?.buttonPrimaryBg || colorPrimary};
  --btn-primary-text: ${branding?.buttonPrimaryText || onPrimary};
  --btn-secondary-bg: ${branding?.buttonSecondaryBg || colorSecondary};
  --btn-secondary-text: ${branding?.buttonSecondaryText || onSecondary};
  --btn-outline-border: ${branding?.buttonOutlineBorder || colorPrimary};
  --btn-outline-text: ${branding?.buttonOutlineText || colorPrimary};
  --btn-accent-bg: ${branding?.buttonAccentBg || colorAccent};
  --btn-accent-text: ${branding?.buttonAccentText || onAccent};

  /* ========================================
   * LINK COLORS
   * ======================================== */
  --link-color: ${branding?.linkColor || colorPrimary};
  --link-hover-color: ${branding?.linkHoverColor || colorAccent};

  /* ========================================
   * LIGHT THEME COLORS (for text on dark/image backgrounds)
   * Used when textTheme="light" is selected on blocks
   * ======================================== */
  --color-light-heading: ${branding?.lightHeadingColor || "#ffffff"};
  --color-light-text: ${branding?.lightTextColor || "rgba(255, 255, 255, 0.9)"};
  --color-light-subtext: ${branding?.lightSubtextColor || "rgba(255, 255, 255, 0.7)"};
}

/* ========================================
 * GLOBAL TYPOGRAPHY STYLES
 * ======================================== */
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

/* ========================================
 * LINK STYLES
 * ======================================== */
a:not([class]) {
  color: var(--link-color);
  transition: color 0.15s ease;
}
a:not([class]):hover {
  color: var(--link-hover-color);
}

/* ========================================
 * PROSE CONTENT
 * ======================================== */
.prose {
  font-family: var(--font-body);
  line-height: var(--line-height);
}
.prose h1, .prose h2, .prose h3, .prose h4 {
  font-family: var(--font-heading);
}
  `.trim();

  return (
    <>
      {/* Load Google Fonts if custom fonts are specified */}
      {googleFontsUrl && <link rel="stylesheet" href={googleFontsUrl} />}
      <style dangerouslySetInnerHTML={{ __html: cssVars }} />
    </>
  );
}
