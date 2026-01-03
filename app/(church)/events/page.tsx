/**
 * Public Events List
 *
 * Displays all published upcoming events.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteData } from "@/lib/public/get-site-data";
import { prisma } from "@/lib/db/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events",
};

export default async function EventsPage() {
  const siteData = await getSiteData();

  if (!siteData) {
    notFound();
  }

  const now = new Date();

  // Get upcoming events
  const upcomingEvents = await prisma.event.findMany({
    where: {
      churchId: siteData.church.id,
      status: "PUBLISHED",
      startDate: { gte: now },
    },
    orderBy: { startDate: "asc" },
  });

  // Get past events (last 10)
  const pastEvents = await prisma.event.findMany({
    where: {
      churchId: siteData.church.id,
      status: "PUBLISHED",
      startDate: { lt: now },
    },
    orderBy: { startDate: "desc" },
    take: 10,
  });

  const formatDate = (date: Date, endDate?: Date | null) => {
    const startStr = date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    if (endDate) {
      const endTimeStr = endDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
      return `${startStr} at ${timeStr} - ${endTimeStr}`;
    }

    return `${startStr} at ${timeStr}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Events
        </h1>
        <p className="mt-2 text-gray-600">
          What's happening at our church
        </p>
      </header>

      {/* Upcoming Events */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Upcoming Events
        </h2>

        {upcomingEvents.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              No upcoming events scheduled.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Date Badge */}
                  <div className="flex-shrink-0 text-center sm:text-left">
                    <div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-lg">
                      <div className="text-2xl font-bold">
                        {new Date(event.startDate).getDate()}
                      </div>
                      <div className="text-sm">
                        {new Date(event.startDate).toLocaleDateString("en-US", {
                          month: "short",
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {formatDate(event.startDate, event.endDate)}
                    </p>
                    {event.location && (
                      <p className="text-sm text-gray-600">
                        <span className="inline-block w-4 mr-1">📍</span>
                        {event.location}
                      </p>
                    )}
                    {event.description && (
                      <p className="mt-2 text-gray-600 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>

                  {/* Registration Badge */}
                  {event.registrationUrl && (
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-green-100 text-green-700 rounded-full">
                        Register →
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Past Events
          </h2>
          <div className="space-y-3">
            {pastEvents.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="block bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors opacity-75"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 flex-shrink-0 w-24">
                    {new Date(event.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-gray-700">
                    {event.title}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
