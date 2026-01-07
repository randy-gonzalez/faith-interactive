/**
 * Public Site Data Fetching
 *
 * Utilities for fetching church and site settings data for public pages.
 * These don't require authentication but do require valid tenant context.
 */

import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { cache } from "react";
import {
  HeaderTemplate,
  FooterTemplate,
  HeaderConfig,
  FooterConfig,
  NavLinkExtended,
  DEFAULT_HEADER_CONFIG,
  DEFAULT_FOOTER_CONFIG,
  parseHeaderConfig,
  parseFooterConfig,
} from "@/types/template";

export interface NavItem {
  pageId: string;
  label: string;
  order: number;
}

export interface BrandingData {
  // Colors
  colorPrimary: string | null;
  colorSecondary: string | null;
  colorAccent: string | null;
  colorBackground: string | null;
  colorText: string | null;
  // Typography
  fontPrimary: string | null;
  fontSecondary: string | null;
  fontSizeBase: number | null;
  headingScale: number | null;
  lineHeight: number | null;
  // Buttons
  buttonStyle: string | null;
  buttonRadius: number | null;
  buttonPrimaryBg: string | null;
  buttonPrimaryText: string | null;
  buttonSecondaryBg: string | null;
  buttonSecondaryText: string | null;
  buttonOutlineBorder: string | null;
  buttonOutlineText: string | null;
  buttonAccentBg: string | null;
  buttonAccentText: string | null;
  // Spacing
  spacingDensity: string | null;
  contentWidth: string | null;
  // Other styles
  borderRadius: number | null;
  linkColor: string | null;
  linkHoverColor: string | null;
  // Light theme colors (for text on dark backgrounds)
  lightHeadingColor: string | null;
  lightTextColor: string | null;
  lightSubtextColor: string | null;
  // Logos
  logoHeaderUrl: string | null;
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
  faviconUrl: string | null;
}

export interface TemplateSettings {
  headerTemplate: HeaderTemplate;
  headerConfig: HeaderConfig;
  footerTemplate: FooterTemplate;
  footerConfig: FooterConfig;
  headerNavigation: NavLinkExtended[];
  footerNavigation: NavLinkExtended[];
}

export interface SiteData {
  church: {
    id: string;
    slug: string;
    name: string;
  };
  settings: {
    logoUrl: string | null;
    headerNavigation: NavItem[];
    footerText: string | null;
    footerNavigation: NavItem[];
    facebookUrl: string | null;
    instagramUrl: string | null;
    youtubeUrl: string | null;
    serviceTimes: string | null;
    address: string | null;
    phone: string | null;
    contactEmail: string | null;
    metaTitle: string | null;
    metaDescription: string | null;
    faviconUrl: string | null;
    mapEmbedUrl: string | null;
    homePageId: string | null;
  };
  branding: BrandingData | null;
  template: TemplateSettings;
}

/**
 * Get site data for public pages.
 * Cached per request to avoid multiple database calls.
 */
export const getSiteData = cache(async (): Promise<SiteData | null> => {
  const headerStore = await headers();
  const churchSlug = headerStore.get("x-church-slug");

  if (!churchSlug) {
    return null;
  }

  const church = await prisma.church.findUnique({
    where: { slug: churchSlug },
    include: {
      siteSettings: true,
      branding: true,
    },
  });

  if (!church) {
    return null;
  }

  // Get or create default settings
  let settings = church.siteSettings;
  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: {
        churchId: church.id,
        headerNavigation: [],
        footerNavigation: [],
      },
    });
  }

  // Parse navigation JSON (legacy format)
  const parseNav = (value: unknown): NavItem[] => {
    if (!value || !Array.isArray(value)) return [];
    return value as NavItem[];
  };

  // Parse extended navigation JSON (new format with external URLs and children)
  const parseNavExtended = (value: unknown): NavLinkExtended[] => {
    if (!value || !Array.isArray(value)) return [];
    return value as NavLinkExtended[];
  };

  // Parse template settings
  const headerTemplate = (settings.headerTemplate as HeaderTemplate) || "classic";
  const footerTemplate = (settings.footerTemplate as FooterTemplate) || "4-column";
  const headerConfig = parseHeaderConfig(settings.headerConfig);
  const footerConfig = parseFooterConfig(settings.footerConfig);

  // Extract branding data
  const branding = church.branding
    ? {
        // Colors
        colorPrimary: church.branding.colorPrimary,
        colorSecondary: church.branding.colorSecondary,
        colorAccent: church.branding.colorAccent,
        colorBackground: church.branding.colorBackground,
        colorText: church.branding.colorText,
        // Typography
        fontPrimary: church.branding.fontPrimary,
        fontSecondary: church.branding.fontSecondary,
        fontSizeBase: church.branding.fontSizeBase,
        headingScale: church.branding.headingScale,
        lineHeight: church.branding.lineHeight,
        // Buttons
        buttonStyle: church.branding.buttonStyle,
        buttonRadius: church.branding.buttonRadius,
        buttonPrimaryBg: church.branding.buttonPrimaryBg,
        buttonPrimaryText: church.branding.buttonPrimaryText,
        buttonSecondaryBg: church.branding.buttonSecondaryBg,
        buttonSecondaryText: church.branding.buttonSecondaryText,
        buttonOutlineBorder: church.branding.buttonOutlineBorder,
        buttonOutlineText: church.branding.buttonOutlineText,
        buttonAccentBg: church.branding.buttonAccentBg,
        buttonAccentText: church.branding.buttonAccentText,
        // Spacing
        spacingDensity: church.branding.spacingDensity,
        contentWidth: church.branding.contentWidth,
        // Other styles
        borderRadius: church.branding.borderRadius,
        linkColor: church.branding.linkColor,
        linkHoverColor: church.branding.linkHoverColor,
        // Light theme colors
        lightHeadingColor: church.branding.lightHeadingColor,
        lightTextColor: church.branding.lightTextColor,
        lightSubtextColor: church.branding.lightSubtextColor,
        // Logos
        logoHeaderUrl: church.branding.logoHeaderUrl,
        logoLightUrl: church.branding.logoLightUrl,
        logoDarkUrl: church.branding.logoDarkUrl,
        faviconUrl: church.branding.faviconUrl,
      }
    : null;

  return {
    church: {
      id: church.id,
      slug: church.slug,
      name: church.name,
    },
    settings: {
      logoUrl: settings.logoUrl,
      headerNavigation: parseNav(settings.headerNavigation),
      footerText: settings.footerText,
      footerNavigation: parseNav(settings.footerNavigation),
      facebookUrl: settings.facebookUrl,
      instagramUrl: settings.instagramUrl,
      youtubeUrl: settings.youtubeUrl,
      serviceTimes: settings.serviceTimes,
      address: settings.address,
      phone: settings.phone,
      contactEmail: settings.contactEmail,
      metaTitle: settings.metaTitle,
      metaDescription: settings.metaDescription,
      faviconUrl: settings.faviconUrl,
      mapEmbedUrl: settings.mapEmbedUrl,
      homePageId: settings.homePageId,
    },
    branding,
    template: {
      headerTemplate,
      headerConfig,
      footerTemplate,
      footerConfig,
      headerNavigation: parseNavExtended(settings.headerNavigation),
      footerNavigation: parseNavExtended(settings.footerNavigation),
    },
  };
});

/**
 * Get navigation pages with their URLs.
 * Resolves page IDs to actual page data.
 */
export async function getNavigationPages(
  churchId: string,
  navItems: NavItem[]
): Promise<Array<{ label: string; href: string; order: number }>> {
  if (navItems.length === 0) return [];

  const pageIds = navItems.map((item) => item.pageId);

  const pages = await prisma.page.findMany({
    where: {
      id: { in: pageIds },
      churchId,
      status: "PUBLISHED",
    },
    select: {
      id: true,
      urlPath: true,
    },
  });

  const pageMap = new Map(pages.map((p) => [p.id, p]));

  return navItems
    .filter((item) => pageMap.has(item.pageId))
    .map((item) => {
      const page = pageMap.get(item.pageId)!;
      return {
        label: item.label,
        href: page.urlPath ? `/${page.urlPath}` : `/${page.id}`,
        order: item.order,
      };
    })
    .sort((a, b) => a.order - b.order);
}

/**
 * Get a form by type for public pages.
 * Used for standard forms like Contact, Prayer Request, Volunteer.
 */
export async function getFormByType(
  churchId: string,
  formType: "CONTACT" | "PRAYER_REQUEST" | "VOLUNTEER"
): Promise<{
  id: string;
  name: string;
  slug: string;
  description: string | null;
  fields: unknown;
  settings: unknown;
  isActive: boolean;
} | null> {
  const form = await prisma.form.findFirst({
    where: {
      churchId,
      type: formType,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      fields: true,
      settings: true,
      isActive: true,
    },
  });

  return form;
}

/**
 * Get a form by slug for public pages.
 * Used for custom forms accessed via /forms/[slug].
 */
export async function getFormBySlug(
  churchId: string,
  slug: string
): Promise<{
  id: string;
  name: string;
  slug: string;
  description: string | null;
  fields: unknown;
  settings: unknown;
  isActive: boolean;
} | null> {
  const form = await prisma.form.findFirst({
    where: {
      churchId,
      slug,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      fields: true,
      settings: true,
      isActive: true,
    },
  });

  return form;
}
