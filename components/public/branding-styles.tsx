/**
 * Branding Styles Component
 *
 * Injects CSS custom properties and global styles based on church branding settings.
 * These variables are used throughout the public site for consistent branding.
 */

import type { BrandingData } from "@/lib/public/get-site-data";

interface BrandingStylesProps {
  branding: BrandingData | null;
}

function getButtonRadius(branding: BrandingData | null): string {
  if (!branding) return "6px";

  switch (branding.buttonStyle) {
    case "pill":
      return "9999px";
    case "square":
      return "0px";
    case "rounded":
    default:
      return `${branding.buttonRadius ?? 6}px`;
  }
}

/**
 * Generate Google Fonts URL for the specified fonts
 */
function getGoogleFontsUrl(branding: BrandingData | null): string | null {
  if (!branding) return null;

  const fonts: string[] = [];

  if (branding.fontPrimary) {
    // Request multiple weights for headings
    fonts.push(`family=${encodeURIComponent(branding.fontPrimary)}:wght@400;500;600;700`);
  }

  if (branding.fontSecondary && branding.fontSecondary !== branding.fontPrimary) {
    // Request weights for body text
    fonts.push(`family=${encodeURIComponent(branding.fontSecondary)}:wght@400;500;600`);
  }

  if (fonts.length === 0) return null;

  return `https://fonts.googleapis.com/css2?${fonts.join("&")}&display=swap`;
}

export function BrandingStyles({ branding }: BrandingStylesProps) {
  // Default colors
  const defaultPrimary = "#2563eb";
  const defaultSecondary = "#6b7280";
  const defaultAccent = "#f59e0b";

  const colorPrimary = branding?.colorPrimary || defaultPrimary;
  const colorSecondary = branding?.colorSecondary || defaultSecondary;
  const colorAccent = branding?.colorAccent || defaultAccent;
  const colorText = branding?.colorText || "#1f2937";
  const colorBackground = branding?.colorBackground || "#ffffff";

  // Typography defaults
  const fontSizeBase = branding?.fontSizeBase ?? 16;
  const headingScale = branding?.headingScale ?? 1.25;
  const lineHeight = branding?.lineHeight ?? 1.5;

  // Calculate heading sizes using modular scale
  const h1Size = fontSizeBase * Math.pow(headingScale, 4);
  const h2Size = fontSizeBase * Math.pow(headingScale, 3);
  const h3Size = fontSizeBase * Math.pow(headingScale, 2);
  const h4Size = fontSizeBase * Math.pow(headingScale, 1);

  // Font families
  const fontPrimary = branding?.fontPrimary
    ? `"${branding.fontPrimary}", system-ui, sans-serif`
    : "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  const fontSecondary = branding?.fontSecondary
    ? `"${branding.fontSecondary}", system-ui, sans-serif`
    : "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

  const googleFontsUrl = getGoogleFontsUrl(branding);

  const cssVars = `
    :root {
      /* Brand Colors */
      --color-primary: ${colorPrimary};
      --color-secondary: ${colorSecondary};
      --color-accent: ${colorAccent};
      --color-background: ${colorBackground};
      --color-text: ${colorText};

      /* Typography */
      --font-primary: ${fontPrimary};
      --font-secondary: ${fontSecondary};
      --font-size-base: ${fontSizeBase}px;
      --line-height: ${lineHeight};
      --heading-scale: ${headingScale};

      /* Heading sizes (modular scale) */
      --font-size-h1: ${h1Size.toFixed(2)}px;
      --font-size-h2: ${h2Size.toFixed(2)}px;
      --font-size-h3: ${h3Size.toFixed(2)}px;
      --font-size-h4: ${h4Size.toFixed(2)}px;

      /* Button Colors */
      --btn-primary-bg: ${branding?.buttonPrimaryBg || colorPrimary};
      --btn-primary-text: ${branding?.buttonPrimaryText || "#ffffff"};
      --btn-secondary-bg: ${branding?.buttonSecondaryBg || colorSecondary};
      --btn-secondary-text: ${branding?.buttonSecondaryText || "#ffffff"};
      --btn-outline-border: ${branding?.buttonOutlineBorder || colorPrimary};
      --btn-outline-text: ${branding?.buttonOutlineText || colorPrimary};
      --btn-accent-bg: ${branding?.buttonAccentBg || colorAccent};
      --btn-accent-text: ${branding?.buttonAccentText || "#ffffff"};

      /* Button Shape */
      --btn-radius: ${getButtonRadius(branding)};
      --border-radius: ${branding?.borderRadius ?? 8}px;

      /* Link Colors */
      --link-color: ${branding?.linkColor || colorPrimary};
      --link-hover-color: ${branding?.linkHoverColor || colorAccent};
    }

    /* Global Typography Styles */
    body {
      font-family: var(--font-secondary);
      font-size: var(--font-size-base);
      line-height: var(--line-height);
      color: var(--color-text);
      background-color: var(--color-background);
    }

    h1, h2, h3, h4, h5, h6 {
      font-family: var(--font-primary);
      line-height: 1.2;
    }

    h1 { font-size: var(--font-size-h1); }
    h2 { font-size: var(--font-size-h2); }
    h3 { font-size: var(--font-size-h3); }
    h4 { font-size: var(--font-size-h4); }

    /* Link Styles */
    a:not([class]) {
      color: var(--link-color);
      transition: color 0.15s ease;
    }
    a:not([class]):hover {
      color: var(--link-hover-color);
    }

    /* Prose content styling */
    .prose {
      font-family: var(--font-secondary);
      line-height: var(--line-height);
    }
    .prose h1, .prose h2, .prose h3, .prose h4 {
      font-family: var(--font-primary);
    }
  `;

  return (
    <>
      {/* Load Google Fonts if custom fonts are specified */}
      {googleFontsUrl && (
        <link
          rel="stylesheet"
          href={googleFontsUrl}
        />
      )}
      <style dangerouslySetInnerHTML={{ __html: cssVars }} />
    </>
  );
}
