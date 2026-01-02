/**
 * Event Registrations Admin Page
 *
 * Manage registrations for an event: view attendees, check-in, export.
 */

import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { requireContentEditor } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { AttendeeList } from "@/components/dashboard/attendee-list";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function EventRegistrationsContent({ params }: PageProps) {
  const { id: eventId } = await params;
  const { churchId } = await requireContentEditor();
  const db = getTenantPrisma(churchId);

  const event = await db.event.findFirst({
    where: { id: eventId, churchId },
    select: {
      id: true,
      title: true,
      startDate: true,
      registrationEnabled: true,
      capacity: true,
      waitlistEnabled: true,
    },
  });

  if (!event) {
    redirect("/admin/events");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/events"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Events
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {event.title}
          </h1>
          <p className="text-gray-500">
            {new Date(event.startDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/admin/events/${eventId}/check-in`}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Check-in Mode
          </Link>
          <Link
            href={`/admin/events/${eventId}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Edit Event
          </Link>
        </div>
      </div>

      {/* Registration status */}
      {!event.registrationEnabled && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Registration is not enabled for this event.{" "}
            <Link href={`/admin/events/${eventId}/edit`} className="underline">
              Enable it in event settings
            </Link>
          </p>
        </div>
      )}

      {/* Attendee List */}
      <AttendeeList
        eventId={eventId}
        eventTitle={event.title}
        capacity={event.capacity}
      />
    </div>
  );
}

export default function EventRegistrationsPage(props: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-gray-500">Loading...</div>
      }
    >
      <EventRegistrationsContent {...props} />
    </Suspense>
  );
}
