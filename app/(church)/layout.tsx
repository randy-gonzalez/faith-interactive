/**
 * Public Website Layout
 *
 * Wraps all public-facing pages with header, footer, and SEO metadata.
 * No authentication required - just valid tenant context.
 */

import { notFound } from "next/navigation";
import { getSiteData, getNavigationPages } from "@/lib/public/get-site-data";
import { PublicHeader } from "@/components/public/header";
import { PublicFooter } from "@/components/public/footer";
import { BrandingStyles } from "@/components/public/branding-styles";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const siteData = await getSiteData();

  if (!siteData) {
    return {
      title: "Church Website",
    };
  }

  const { church, settings, branding } = siteData;

  // Favicon: prefer branding, fall back to site settings
  const faviconUrl = branding?.faviconUrl || settings.faviconUrl;

  return {
    title: {
      default: settings.metaTitle || church.name,
      template: `%s | ${church.name}`,
    },
    description: settings.metaDescription || `Welcome to ${church.name}`,
    icons: faviconUrl ? { icon: faviconUrl } : undefined,
  };
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteData = await getSiteData();

  if (!siteData) {
    notFound();
  }

  const { church, settings, branding, template } = siteData;

  // Use template navigation if available, otherwise fall back to legacy navigation
  // For backwards compatibility: if template navigation is empty, resolve legacy page-based navigation
  let headerNav = template.headerNavigation;
  let footerNav = template.footerNavigation;

  if (headerNav.length === 0 && settings.headerNavigation.length > 0) {
    // Fall back to legacy navigation
    const legacyHeaderNav = await getNavigationPages(
      church.id,
      settings.headerNavigation
    );
    headerNav = legacyHeaderNav.map((nav, index) => ({
      id: `legacy-header-${index}`,
      label: nav.label,
      href: nav.href,
      isExternal: false,
      order: nav.order,
    }));
  }

  if (footerNav.length === 0 && settings.footerNavigation.length > 0) {
    // Fall back to legacy navigation
    const legacyFooterNav = await getNavigationPages(
      church.id,
      settings.footerNavigation
    );
    footerNav = legacyFooterNav.map((nav, index) => ({
      id: `legacy-footer-${index}`,
      label: nav.label,
      href: nav.href,
      isExternal: false,
      order: nav.order,
    }));
  }

  // Get logo from branding first, then fall back to site settings
  const logoUrl = branding?.logoHeaderUrl || settings.logoUrl;

  return (
    <>
      {/* Inject CSS variables and global styles for branding */}
      <BrandingStyles branding={branding} />

      {/* Background color is set via --color-background CSS variable */}
      <div className="min-h-screen flex flex-col">
        <PublicHeader
          churchName={church.name}
          logoUrl={logoUrl}
          navigation={headerNav}
          template={template.headerTemplate}
          config={template.headerConfig}
        />

        <main className="flex-1">{children}</main>

        <PublicFooter
          churchName={church.name}
          footerText={settings.footerText}
          navigation={footerNav}
          serviceTimes={settings.serviceTimes}
          address={settings.address}
          phone={settings.phone}
          contactEmail={settings.contactEmail}
          facebookUrl={settings.facebookUrl}
          instagramUrl={settings.instagramUrl}
          youtubeUrl={settings.youtubeUrl}
          template={template.footerTemplate}
          config={template.footerConfig}
        />
      </div>
    </>
  );
}
