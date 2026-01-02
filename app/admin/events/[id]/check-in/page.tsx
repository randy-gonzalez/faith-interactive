/**
 * Event Check-in Page
 *
 * Full-screen check-in interface for event day.
 * Optimized for tablet/kiosk use.
 */

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireContentEditor } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { CheckInInterface } from "@/components/dashboard/check-in-interface";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function CheckInContent({ params }: PageProps) {
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
    },
  });

  if (!event) {
    redirect("/admin/events");
  }

  return <CheckInInterface eventId={eventId} eventTitle={event.title} />;
}

export default function CheckInPage(props: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-xl text-gray-500">Loading...</div>
        </div>
      }
    >
      <CheckInContent {...props} />
    </Suspense>
  );
}
