/**
 * Church Home Page Component
 *
 * Displays the public-facing home page for a church:
 * - A designated home page (if configured in Site Settings)
 * - Or a default welcome page with service times and upcoming events
 *
 * This is used by the root page.tsx when on a church subdomain.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteData, getNavigationPages } from "@/lib/public/get-site-data";
import { prisma } from "@/lib/db/prisma";
import { BlockRenderer } from "@/components/blocks/block-renderer";
import { resolveGlobalBlocks } from "@/lib/blocks/resolve-global-blocks";
import type { Block } from "@/types/blocks";
import { PublicHeader } from "./header";
import { PublicFooter } from "./footer";
import { BrandingStyles } from "./branding-styles";

export async function ChurchHomePage() {
  const siteData = await getSiteData();

  if (!siteData) {
    notFound();
  }

  const { church, settings, branding, template } = siteData;

  // Use template navigation if available, otherwise fall back to legacy navigation
  let headerNav = template.headerNavigation;
  let footerNav = template.footerNavigation;

  if (headerNav.length === 0 && settings.headerNavigation.length > 0) {
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

  // Check for homepage - prefer isHomePage flag, then fallback to homePageId
  let homePageContent = null;

  // First, check for a page with isHomePage flag set (preferred method)
  let homePage = await prisma.page.findFirst({
    where: {
      churchId: church.id,
      isHomePage: true,
      status: "PUBLISHED",
    },
  });

  // Fallback: check legacy homePageId in SiteSettings
  if (!homePage && settings.homePageId) {
    homePage = await prisma.page.findUnique({
      where: {
        id: settings.homePageId,
        churchId: church.id,
        status: "PUBLISHED",
      },
    });
  }

  if (homePage) {
    const resolvedBlocks = await resolveGlobalBlocks(
      homePage.blocks as unknown as Block[],
      church.id
    );
    homePageContent = <BlockRenderer blocks={resolvedBlocks} />;
  }

  // Default welcome page content
  if (!homePageContent) {
    // Get upcoming events
    const upcomingEvents = await prisma.event.findMany({
      where: {
        churchId: church.id,
        status: "PUBLISHED",
        startDate: { gte: new Date() },
      },
      orderBy: { startDate: "asc" },
      take: 3,
    });

    // Get recent sermons
    const recentSermons = await prisma.sermon.findMany({
      where: {
        churchId: church.id,
        status: "PUBLISHED",
      },
      orderBy: { date: "desc" },
      take: 3,
    });

    // Get active announcements
    const announcements = await prisma.announcement.findMany({
      where: {
        churchId: church.id,
        status: "PUBLISHED",
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      },
      orderBy: { createdAt: "desc" },
      take: 2,
    });

    homePageContent = (
      <div>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Welcome to {church.name}
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              {settings.metaDescription || "Join us for worship and community."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-block bg-white text-blue-700 px-6 py-3 rounded-md font-semibold hover:bg-blue-50 transition-colors"
              >
                Plan Your Visit
              </Link>
              {recentSermons.length > 0 && (
                <Link
                  href="/sermons"
                  className="inline-block border-2 border-white text-white px-6 py-3 rounded-md font-semibold hover:bg-white hover:text-blue-700 transition-colors"
                >
                  Watch Sermons
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Service Times */}
        {settings.serviceTimes && (
          <section className="bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Join Us for Worship
              </h2>
              <div className="text-lg text-gray-600 whitespace-pre-line">
                {settings.serviceTimes}
              </div>
              {settings.address && (
                <p className="mt-4 text-gray-500">
                  {settings.address}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Announcements */}
        {announcements.length > 0 && (
          <section className="py-12 px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Announcements
              </h2>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="bg-yellow-50 border border-yellow-200 rounded-lg p-6"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {announcement.title}
                    </h3>
                    <p className="text-gray-600">
                      {announcement.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <section className="bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Upcoming Events
                </h2>
                <Link
                  href="/events"
                  className="text-blue-600 hover:underline"
                >
                  View All →
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {upcomingEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="text-sm text-blue-600 font-medium mb-2">
                      {new Date(event.startDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {event.title}
                    </h3>
                    {event.location && (
                      <p className="text-sm text-gray-500">
                        {event.location}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Recent Sermons */}
        {recentSermons.length > 0 && (
          <section className="py-12 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Recent Sermons
                </h2>
                <Link
                  href="/sermons"
                  className="text-blue-600 hover:underline"
                >
                  View All →
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {recentSermons.map((sermon) => (
                  <Link
                    key={sermon.id}
                    href={`/sermons/${sermon.id}`}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="text-sm text-gray-500 mb-2">
                      {new Date(sermon.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {sermon.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {sermon.speakerName || "Unknown Speaker"}
                    </p>
                    {sermon.scripture && (
                      <p className="text-sm text-blue-600 mt-2">
                        {sermon.scripture}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="bg-gray-900 text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Have Questions?</h2>
            <p className="text-gray-300 mb-8">
              We'd love to hear from you. Reach out and let us know how we can
              help.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-semibold transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </section>
      </div>
    );
  }

  // Get logo from branding first, then fall back to site settings
  const logoUrl = branding?.logoHeaderUrl || settings.logoUrl;

  return (
    <>
      {/* Inject CSS variables and global styles for branding */}
      <BrandingStyles branding={branding} />

      <div className="min-h-screen flex flex-col">
        <PublicHeader
          churchName={church.name}
          logoUrl={logoUrl}
          navigation={headerNav}
          template={template.headerTemplate}
          config={template.headerConfig}
        />

        <main className="flex-1">{homePageContent}</main>

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
