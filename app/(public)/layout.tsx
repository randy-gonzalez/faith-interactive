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
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const siteData = await getSiteData();

  if (!siteData) {
    return {
      title: "Church Website",
    };
  }

  const { church, settings } = siteData;

  return {
    title: {
      default: settings.metaTitle || church.name,
      template: `%s | ${church.name}`,
    },
    description: settings.metaDescription || `Welcome to ${church.name}`,
    icons: settings.faviconUrl
      ? { icon: settings.faviconUrl }
      : undefined,
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

  const { church, settings } = siteData;

  // Resolve navigation pages
  const headerNav = await getNavigationPages(
    church.id,
    settings.headerNavigation
  );
  const footerNav = await getNavigationPages(
    church.id,
    settings.footerNavigation
  );

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <PublicHeader
        churchName={church.name}
        logoUrl={settings.logoUrl}
        navigation={headerNav}
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
      />
    </div>
  );
}
