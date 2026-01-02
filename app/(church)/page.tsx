/**
 * Public Home Page
 *
 * Displays either:
 * - A designated home page (page with isHomePage: true)
 * - A fallback via Site Settings homePageId (legacy support)
 * - A default welcome page with service times and upcoming events
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteData } from "@/lib/public/get-site-data";
import { prisma } from "@/lib/db/prisma";
import { BlockRenderer } from "@/components/blocks/block-renderer";

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
    return <BlockRenderer blocks={homePage.blocks} />;
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
      return <BlockRenderer blocks={legacyHomePage.blocks} />;
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
        <section className="bg-gray-50 dark:bg-gray-900 py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Join Us for Worship
            </h2>
            <div className="text-lg text-gray-600 dark:text-gray-300 whitespace-pre-line">
              {settings.serviceTimes}
            </div>
            {settings.address && (
              <p className="mt-4 text-gray-500 dark:text-gray-400">
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Announcements
            </h2>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {announcement.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
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
        <section className="bg-gray-50 dark:bg-gray-900 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Upcoming Events
              </h2>
              <Link
                href="/events"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                View All →
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
                    {new Date(event.startDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {event.title}
                  </h3>
                  {event.location && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Recent Sermons
              </h2>
              <Link
                href="/sermons"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                View All →
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {recentSermons.map((sermon) => (
                <Link
                  key={sermon.id}
                  href={`/sermons/${sermon.id}`}
                  className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {new Date(sermon.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {sermon.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {sermon.speakerName || "Unknown Speaker"}
                  </p>
                  {sermon.scripture && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
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
            We'd love to hear from you. Reach out and let us know how we can help.
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
