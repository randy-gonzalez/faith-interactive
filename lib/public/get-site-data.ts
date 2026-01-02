/**
 * Public Site Data Fetching
 *
 * Utilities for fetching church and site settings data for public pages.
 * These don't require authentication but do require valid tenant context.
 */

import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { cache } from "react";

export interface NavItem {
  pageId: string;
  label: string;
  order: number;
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

  // Parse navigation JSON
  const parseNav = (value: unknown): NavItem[] => {
    if (!value || !Array.isArray(value)) return [];
    return value as NavItem[];
  };

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
