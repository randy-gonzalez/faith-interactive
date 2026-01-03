/**
 * Public Home Page
 *
 * Displays either:
 * - A designated home page (page with isHomePage: true)
 * - A fallback via Site Settings homePageId (legacy support)
 * - A default welcome page with service times and upcoming events
 */

// Force dynamic rendering - homepage can change at any time
export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteData } from "@/lib/public/get-site-data";
import { prisma } from "@/lib/db/prisma";
import { BlockRenderer } from "@/components/blocks/block-renderer";
import { resolveGlobalBlocks } from "@/lib/blocks/resolve-global-blocks";
import type { Block } from "@/types/blocks";

export default async function HomePage() {
  const siteData = await getSiteData();

  if (!siteData) {
    notFound();
  }

  const { church, settings } = siteData;

  // First, check for a page with isHomePage flag set (preferred method)
  const homePage = await prisma.page.findFirst({
    where: {
      churchId: church.id,
      isHomePage: true,
      status: "PUBLISHED",
    },
  });

  if (homePage) {
    const resolvedBlocks = await resolveGlobalBlocks(
      homePage.blocks as unknown as Block[],
      church.id
    );
    return <BlockRenderer blocks={resolvedBlocks} />;
  }

  // Fallback: check legacy homePageId in SiteSettings
  if (settings.homePageId) {
    const legacyHomePage = await prisma.page.findUnique({
      where: {
        id: settings.homePageId,
        churchId: church.id,
        status: "PUBLISHED",
      },
    });

    if (legacyHomePage) {
      const resolvedBlocks = await resolveGlobalBlocks(
        legacyHomePage.blocks as unknown as Block[],
        church.id
      );
      return <BlockRenderer blocks={resolvedBlocks} />;
    }
  }

  // Default welcome page
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
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 2,
  });

  return (
    <div>
      {/* Hero Section - uses primary brand color */}
      <section
        className="text-white py-20 px-4"
        style={{
          background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary, var(--color-primary)))",
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            Welcome to {church.name}
          </h1>
          <p className="text-xl opacity-90 mb-8">
            {settings.metaDescription || "Join us for worship and community."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-block px-6 py-3 font-semibold transition-opacity hover:opacity-90"
              style={{
                backgroundColor: "#ffffff",
                color: "var(--color-primary)",
                borderRadius: "var(--btn-radius, 6px)",
              }}
            >
              Plan Your Visit
            </Link>
            {recentSermons.length > 0 && (
              <Link
                href="/sermons"
                className="inline-block px-6 py-3 font-semibold transition-colors hover:bg-white/10"
                style={{
                  backgroundColor: "transparent",
                  color: "#ffffff",
                  border: "2px solid #ffffff",
                  borderRadius: "var(--btn-radius, 6px)",
                }}
              >
                Watch Sermons
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Service Times */}
      {settings.serviceTimes && (
        <section className="py-12 px-4" style={{ backgroundColor: "var(--color-background)" }}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--color-text)" }}>
              Join Us for Worship
            </h2>
            <div className="text-lg whitespace-pre-line" style={{ color: "var(--color-text)", opacity: 0.7 }}>
              {settings.serviceTimes}
            </div>
            {settings.address && (
              <p className="mt-4" style={{ color: "var(--color-text)", opacity: 0.5 }}>
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
            <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--color-text)" }}>
              Announcements
            </h2>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="rounded-lg p-6 bg-amber-50 border border-amber-200"
                  style={{ borderRadius: "var(--border-radius, 8px)" }}
                >
                  <h3 className="font-semibold mb-2" style={{ color: "var(--color-text)" }}>
                    {announcement.title}
                  </h3>
                  <p style={{ color: "var(--color-text)", opacity: 0.7 }}>
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
        <section className="py-12 px-4" style={{ backgroundColor: "var(--color-background)" }}>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
                Upcoming Events
              </h2>
              <Link
                href="/events"
                style={{ color: "var(--link-color)" }}
                className="hover:underline"
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
                  style={{ borderRadius: "var(--border-radius, 8px)" }}
                >
                  <div className="text-sm font-medium mb-2" style={{ color: "var(--color-primary)" }}>
                    {new Date(event.startDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <h3 className="font-semibold mb-2" style={{ color: "var(--color-text)" }}>
                    {event.title}
                  </h3>
                  {event.location && (
                    <p className="text-sm" style={{ color: "var(--color-text)", opacity: 0.5 }}>
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
              <h2 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
                Recent Sermons
              </h2>
              <Link
                href="/sermons"
                style={{ color: "var(--link-color)" }}
                className="hover:underline"
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
                  style={{ borderRadius: "var(--border-radius, 8px)" }}
                >
                  <div className="text-sm mb-2" style={{ color: "var(--color-text)", opacity: 0.5 }}>
                    {new Date(sermon.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <h3 className="font-semibold mb-1" style={{ color: "var(--color-text)" }}>
                    {sermon.title}
                  </h3>
                  <p className="text-sm" style={{ color: "var(--color-text)", opacity: 0.5 }}>
                    {sermon.speakerName || "Unknown Speaker"}
                  </p>
                  {sermon.scripture && (
                    <p className="text-sm mt-2" style={{ color: "var(--color-primary)" }}>
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
      <section
        className="text-white py-16 px-4"
        style={{ backgroundColor: "var(--color-secondary, #1f2937)" }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Have Questions?</h2>
          <p className="opacity-70 mb-8">
            We'd love to hear from you. Reach out and let us know how we can help.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 font-semibold transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--btn-primary-bg)",
              color: "var(--btn-primary-text)",
              borderRadius: "var(--btn-radius, 6px)",
            }}
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}
