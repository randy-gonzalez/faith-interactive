/**
 * Public Event Detail
 *
 * Displays a single published event with full details.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteData } from "@/lib/public/get-site-data";
import { prisma } from "@/lib/db/prisma";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getEvent(churchId: string, id: string) {
  return prisma.event.findFirst({
    where: {
      id,
      churchId,
      status: "PUBLISHED",
    },
  });
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const siteData = await getSiteData();

  if (!siteData) {
    return { title: "Event Not Found" };
  }

  const event = await getEvent(siteData.church.id, id);

  if (!event) {
    return { title: "Event Not Found" };
  }

  return {
    title: event.title,
    description: event.description || `${event.title} at ${siteData.church.name}`,
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const siteData = await getSiteData();

  if (!siteData) {
    notFound();
  }

  const event = await getEvent(siteData.church.id, id);

  if (!event) {
    notFound();
  }

  const isPast = new Date(event.startDate) < new Date();

  const formatDateTime = (date: Date) => {
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    };
  };

  const start = formatDateTime(event.startDate);
  const end = event.endDate ? formatDateTime(event.endDate) : null;

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link
          href="/events"
          className="text-blue-600 hover:underline"
        >
          ← Back to Events
        </Link>
      </nav>

      {/* Featured Image */}
      {event.featuredImageUrl && (
        <img
          src={event.featuredImageUrl}
          alt={event.title}
          className="w-full h-64 sm:h-96 object-cover rounded-lg mb-8"
        />
      )}

      {/* Header */}
      <header className="mb-8">
        {isPast && (
          <span className="inline-block bg-gray-200 text-gray-600 px-3 py-1 rounded text-sm mb-4">
            Past Event
          </span>
        )}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          {event.title}
        </h1>
      </header>

      {/* Event Details Card */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Date & Time */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              When
            </h3>
            <p className="text-gray-900 font-medium">
              {start.date}
            </p>
            <p className="text-gray-600">
              {start.time}
              {end && ` - ${end.time}`}
            </p>
          </div>

          {/* Location */}
          {event.location && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Where
              </h3>
              <p className="text-gray-900 font-medium">
                {event.location}
              </p>
            </div>
          )}
        </div>

        {/* Registration Button */}
        {event.registrationUrl && !isPast && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <a
              href={event.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors"
            >
              Register for This Event
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        )}
      </div>

      {/* Description */}
      {event.description && (
        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            About This Event
          </h2>
          <p className="text-gray-700 whitespace-pre-line">
            {event.description}
          </p>
        </div>
      )}

      {/* Add to Calendar (simple link) */}
      {!isPast && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Don't forget!{" "}
            <a
              href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatGoogleDate(event.startDate)}/${formatGoogleDate(event.endDate || new Date(event.startDate.getTime() + 2 * 60 * 60 * 1000))}&location=${encodeURIComponent(event.location || "")}&details=${encodeURIComponent(event.description || "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Add to Google Calendar
            </a>
          </p>
        </div>
      )}
    </article>
  );
}

function formatGoogleDate(date: Date): string {
  return date.toISOString().replace(/-|:|\.\d{3}/g, "");
}
