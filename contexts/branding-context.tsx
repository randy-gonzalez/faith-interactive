/**
 * Branding Context
 *
 * Provides branding colors and presets throughout the admin dashboard.
 * Fetches branding data once and caches it for all child components.
 */

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

export interface ColorPreset {
  name: string;
  value: string;
}

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface BrandFonts {
  primary: string | null;
  secondary: string | null;
  sizeBase: number;
  headingScale: number;
  lineHeight: number;
}

export interface BrandingContextValue {
  colors: BrandColors;
  fonts: BrandFonts;
  colorPresets: ColorPreset[];
  gradientPresets: ColorPreset[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const defaultColors: BrandColors = {
  primary: "#1e40af",
  secondary: "#64748b",
  accent: "#f59e0b",
  background: "#ffffff",
  text: "#1f2937",
};

const defaultFonts: BrandFonts = {
  primary: null,
  secondary: null,
  sizeBase: 16,
  headingScale: 1.25,
  lineHeight: 1.5,
};

const BrandingContext = createContext<BrandingContextValue | null>(null);

interface BrandingProviderProps {
  children: ReactNode;
}

export function BrandingProvider({ children }: BrandingProviderProps) {
  const [colors, setColors] = useState<BrandColors>(defaultColors);
  const [fonts, setFonts] = useState<BrandFonts>(defaultFonts);
  const [colorPresets, setColorPresets] = useState<ColorPreset[]>([]);
  const [gradientPresets, setGradientPresets] = useState<ColorPreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBranding = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/branding");
      if (!response.ok) {
        throw new Error("Failed to fetch branding");
      }

      const result = await response.json();
      if (result.success && result.data?.branding) {
        const branding = result.data.branding;

        setColors({
          primary: branding.colorPrimary || defaultColors.primary,
          secondary: branding.colorSecondary || defaultColors.secondary,
          accent: branding.colorAccent || defaultColors.accent,
          background: branding.colorBackground || defaultColors.background,
          text: branding.colorText || defaultColors.text,
        });

        setFonts({
          primary: branding.fontPrimary || null,
          secondary: branding.fontSecondary || null,
          sizeBase: branding.fontSizeBase ?? defaultFonts.sizeBase,
          headingScale: branding.headingScale ?? defaultFonts.headingScale,
          lineHeight: branding.lineHeight ?? defaultFonts.lineHeight,
        });

        setColorPresets(branding.colorPresets || []);
        setGradientPresets(branding.gradientPresets || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Failed to load branding:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranding();
  }, [fetchBranding]);

  return (
    <BrandingContext.Provider
      value={{
        colors,
        fonts,
        colorPresets,
        gradientPresets,
        isLoading,
        error,
        refetch: fetchBranding,
      }}
    >
      <PreviewBrandingStylesInner fonts={fonts} />
      {children}
    </BrandingContext.Provider>
  );
}

/**
 * Generate Google Fonts URL for the specified fonts
 */
function getGoogleFontsUrl(fonts: BrandFonts): string | null {
  const fontList: string[] = [];

  if (fonts.primary) {
    fontList.push(`family=${encodeURIComponent(fonts.primary)}:wght@400;500;600;700`);
  }

  if (fonts.secondary && fonts.secondary !== fonts.primary) {
    fontList.push(`family=${encodeURIComponent(fonts.secondary)}:wght@400;500;600`);
  }

  if (fontList.length === 0) return null;

  return `https://fonts.googleapis.com/css2?${fontList.join("&")}&display=swap`;
}

/**
 * Internal component for rendering font styles inside the provider.
 * This is separate from PreviewBrandingStyles to avoid context dependency issues.
 */
function PreviewBrandingStylesInner({ fonts }: { fonts: BrandFonts }) {
  const fontPrimary = fonts.primary
    ? `"${fonts.primary}", system-ui, sans-serif`
    : "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  const fontSecondary = fonts.secondary
    ? `"${fonts.secondary}", system-ui, sans-serif`
    : "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

  const googleFontsUrl = getGoogleFontsUrl(fonts);

  // Calculate heading sizes using modular scale
  const h1Size = fonts.sizeBase * Math.pow(fonts.headingScale, 4);
  const h2Size = fonts.sizeBase * Math.pow(fonts.headingScale, 3);
  const h3Size = fonts.sizeBase * Math.pow(fonts.headingScale, 2);
  const h4Size = fonts.sizeBase * Math.pow(fonts.headingScale, 1);

  const cssVars = `
    :root {
      /* Typography for preview panes */
      --font-primary: ${fontPrimary};
      --font-secondary: ${fontSecondary};
      --font-size-base: ${fonts.sizeBase}px;
      --line-height: ${fonts.lineHeight};
      --heading-scale: ${fonts.headingScale};

      /* Heading sizes (modular scale) */
      --font-size-h1: ${h1Size.toFixed(2)}px;
      --font-size-h2: ${h2Size.toFixed(2)}px;
      --font-size-h3: ${h3Size.toFixed(2)}px;
      --font-size-h4: ${h4Size.toFixed(2)}px;
    }

    /* Block preview typography */
    .block-preview h1, .block-preview h2, .block-preview h3, .block-preview h4, .block-preview h5, .block-preview h6 {
      font-family: var(--font-primary);
      line-height: 1.2;
    }

    .block-preview h1 { font-size: var(--font-size-h1); }
    .block-preview h2 { font-size: var(--font-size-h2); }
    .block-preview h3 { font-size: var(--font-size-h3); }
    .block-preview h4 { font-size: var(--font-size-h4); }

    .block-preview p, .block-preview span, .block-preview div {
      font-family: var(--font-secondary);
    }
  `;

  return (
    <>
      {googleFontsUrl && (
        <link rel="stylesheet" href={googleFontsUrl} />
      )}
      <style dangerouslySetInnerHTML={{ __html: cssVars }} />
    </>
  );
}

/**
 * Hook to access branding colors and presets.
 * Returns null if used outside of BrandingProvider.
 */
export function useBranding(): BrandingContextValue | null {
  return useContext(BrandingContext);
}

/**
 * Hook to access branding colors and presets with fallback defaults.
 * Safe to use even outside of BrandingProvider.
 */
export function useBrandingWithDefaults(): BrandingContextValue {
  const context = useContext(BrandingContext);

  if (!context) {
    return {
      colors: defaultColors,
      fonts: defaultFonts,
      colorPresets: [],
      gradientPresets: [],
      isLoading: false,
      error: null,
      refetch: async () => {},
    };
  }

  return context;
}

