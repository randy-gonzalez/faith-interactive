// ==============================================================================
// Template Settings Types
// ==============================================================================
// Type definitions for header and footer template customization.
// ==============================================================================

// ==============================================================================
// HEADER TEMPLATES
// ==============================================================================

export type HeaderTemplate = "classic" | "centered" | "minimal" | "split" | "transparent" | "boxed" | "full-width" | "double-row";

export interface HeaderCtaButton {
  show: boolean;
  label: string;
  href: string;
  isExternal: boolean;
  style: "primary" | "secondary" | "outline";
}

export interface HeaderConfig {
  // Desktop layout options
  logoPosition: "left" | "center";
  navAlignment: "left" | "center" | "right";
  showNavigation: boolean;
  sticky: boolean;
  background: "solid" | "transparent" | "blur";
  backgroundColor?: string; // Override branding color (hex)

  // CTA Button
  ctaButton: HeaderCtaButton;

  // Mobile options
  mobileBreakpoint: number; // pixels (default 768)
  mobileMenuStyle: "slide" | "dropdown" | "fullscreen";
  mobileLogoUrl?: string; // null = use desktop logo
  showCtaOnMobile: boolean;
  mobileMenuBgColor?: string; // hex color
}

export const DEFAULT_HEADER_CONFIG: HeaderConfig = {
  logoPosition: "left",
  navAlignment: "right",
  showNavigation: true,
  sticky: true,
  background: "solid",
  backgroundColor: undefined,
  ctaButton: {
    show: true,
    label: "Contact Us",
    href: "/contact",
    isExternal: false,
    style: "primary",
  },
  mobileBreakpoint: 768,
  mobileMenuStyle: "slide",
  mobileLogoUrl: undefined,
  showCtaOnMobile: true,
  mobileMenuBgColor: undefined,
};

export const HEADER_TEMPLATES: {
  value: HeaderTemplate;
  label: string;
  description: string;
}[] = [
  {
    value: "classic",
    label: "Classic",
    description: "Logo left, navigation right with CTA button",
  },
  {
    value: "centered",
    label: "Centered",
    description: "Logo centered above, navigation centered below",
  },
  {
    value: "minimal",
    label: "Minimal",
    description: "Logo only with hamburger menu for all screen sizes",
  },
  {
    value: "split",
    label: "Split",
    description: "Logo left, navigation center, CTA button right",
  },
  {
    value: "transparent",
    label: "Transparent",
    description: "Overlays hero with glass-like transparent background",
  },
  {
    value: "boxed",
    label: "Boxed",
    description: "Centered container with rounded corners and shadow",
  },
  {
    value: "full-width",
    label: "Full Width",
    description: "Logo and CTA on edges, navigation centered",
  },
  {
    value: "double-row",
    label: "Double Row",
    description: "Top bar with contact info, main header below",
  },
];

// ==============================================================================
// FOOTER TEMPLATES
// ==============================================================================

export type FooterTemplate =
  | "4-column"
  | "3-column"
  | "2-column"
  | "stacked"
  | "minimal";

export interface FooterConfig {
  // Section visibility
  showChurchInfo: boolean;
  showServiceTimes: boolean;
  showContactInfo: boolean;
  showQuickLinks: boolean;
  showSocialIcons: boolean;

  // Styling
  backgroundColor?: string; // null = use --color-secondary
  backgroundImage?: string;
  socialIconStyle: "filled" | "outline" | "monochrome";

  // Content customization
  customCopyrightText?: string; // null = auto-generate "© {year} {churchName}"
  columnOrder: ("info" | "contact" | "links" | "social")[];
}

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  showChurchInfo: true,
  showServiceTimes: true,
  showContactInfo: true,
  showQuickLinks: true,
  showSocialIcons: true,
  backgroundColor: undefined,
  backgroundImage: undefined,
  socialIconStyle: "filled",
  customCopyrightText: undefined,
  columnOrder: ["info", "contact", "links", "social"],
};

export const FOOTER_TEMPLATES: {
  value: FooterTemplate;
  label: string;
  description: string;
}[] = [
  {
    value: "4-column",
    label: "4-Column",
    description: "Info, Contact, Links, and Social in separate columns",
  },
  {
    value: "3-column",
    label: "3-Column",
    description: "Condensed layout with combined sections",
  },
  {
    value: "2-column",
    label: "2-Column",
    description: "Logo and info on left, links on right",
  },
  {
    value: "stacked",
    label: "Stacked",
    description: "Single column with sections stacked vertically",
  },
  {
    value: "minimal",
    label: "Minimal",
    description: "Just navigation links and copyright",
  },
];

// ==============================================================================
// EXTENDED NAVIGATION TYPES
// ==============================================================================

export interface NavLinkChild {
  id: string;
  label: string;
  href: string;
  isExternal: boolean;
  order: number;
}

export interface NavLinkExtended {
  id: string;
  label: string;
  href: string;
  isExternal: boolean;
  order: number;
  // For page links, this references the page ID
  pageId?: string;
  // Nested navigation items (for dropdowns)
  children?: NavLinkChild[];
}

// Legacy nav link format (for migration compatibility)
export interface NavLinkLegacy {
  pageId: string;
  label: string;
  order: number;
}

// ==============================================================================
// HELPER FUNCTIONS
// ==============================================================================

export function parseHeaderConfig(config: unknown): HeaderConfig {
  if (!config || typeof config !== "object") {
    return { ...DEFAULT_HEADER_CONFIG };
  }

  const parsed = config as Partial<HeaderConfig>;

  return {
    logoPosition: parsed.logoPosition ?? DEFAULT_HEADER_CONFIG.logoPosition,
    navAlignment: parsed.navAlignment ?? DEFAULT_HEADER_CONFIG.navAlignment,
    showNavigation:
      parsed.showNavigation ?? DEFAULT_HEADER_CONFIG.showNavigation,
    sticky: parsed.sticky ?? DEFAULT_HEADER_CONFIG.sticky,
    background: parsed.background ?? DEFAULT_HEADER_CONFIG.background,
    backgroundColor: parsed.backgroundColor,
    ctaButton: {
      show: parsed.ctaButton?.show ?? DEFAULT_HEADER_CONFIG.ctaButton.show,
      label: parsed.ctaButton?.label ?? DEFAULT_HEADER_CONFIG.ctaButton.label,
      href: parsed.ctaButton?.href ?? DEFAULT_HEADER_CONFIG.ctaButton.href,
      isExternal:
        parsed.ctaButton?.isExternal ??
        DEFAULT_HEADER_CONFIG.ctaButton.isExternal,
      style: parsed.ctaButton?.style ?? DEFAULT_HEADER_CONFIG.ctaButton.style,
    },
    mobileBreakpoint:
      parsed.mobileBreakpoint ?? DEFAULT_HEADER_CONFIG.mobileBreakpoint,
    mobileMenuStyle:
      parsed.mobileMenuStyle ?? DEFAULT_HEADER_CONFIG.mobileMenuStyle,
    mobileLogoUrl: parsed.mobileLogoUrl,
    showCtaOnMobile:
      parsed.showCtaOnMobile ?? DEFAULT_HEADER_CONFIG.showCtaOnMobile,
    mobileMenuBgColor: parsed.mobileMenuBgColor,
  };
}

export function parseFooterConfig(config: unknown): FooterConfig {
  if (!config || typeof config !== "object") {
    return { ...DEFAULT_FOOTER_CONFIG };
  }

  const parsed = config as Partial<FooterConfig>;

  return {
    showChurchInfo:
      parsed.showChurchInfo ?? DEFAULT_FOOTER_CONFIG.showChurchInfo,
    showServiceTimes:
      parsed.showServiceTimes ?? DEFAULT_FOOTER_CONFIG.showServiceTimes,
    showContactInfo:
      parsed.showContactInfo ?? DEFAULT_FOOTER_CONFIG.showContactInfo,
    showQuickLinks:
      parsed.showQuickLinks ?? DEFAULT_FOOTER_CONFIG.showQuickLinks,
    showSocialIcons:
      parsed.showSocialIcons ?? DEFAULT_FOOTER_CONFIG.showSocialIcons,
    backgroundColor: parsed.backgroundColor,
    backgroundImage: parsed.backgroundImage,
    socialIconStyle:
      parsed.socialIconStyle ?? DEFAULT_FOOTER_CONFIG.socialIconStyle,
    customCopyrightText: parsed.customCopyrightText,
    columnOrder: parsed.columnOrder ?? DEFAULT_FOOTER_CONFIG.columnOrder,
  };
}

export function isValidHeaderTemplate(value: string): value is HeaderTemplate {
  return ["classic", "centered", "minimal", "split", "transparent", "boxed", "full-width", "double-row"].includes(value);
}

export function isValidFooterTemplate(value: string): value is FooterTemplate {
  return ["4-column", "3-column", "2-column", "stacked", "minimal"].includes(
    value
  );
}
