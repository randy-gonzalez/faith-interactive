/**
 * Edit Event Page
 *
 * Edit an existing event.
 */

import { redirect, notFound } from "next/navigation";
import { getAuthContext } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { canEditContent } from "@/lib/auth/permissions";
import { EventForm } from "@/components/dashboard/event-form";
import { StatusBadge } from "@/components/ui/status-badge";

interface EditEventProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: EditEventProps) {
  const { id } = await params;
  const context = await getAuthContext();
  if (!context) redirect("/login");

  const { user, church } = context;
  const db = getTenantPrisma(church.id);
  const canEdit = canEditContent(user.role);

  const event = await db.event.findUnique({
    where: { id },
  });

  if (!event) {
    notFound();
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {canEdit ? "Edit Event" : "View Event"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {event.title}
          </p>
        </div>
        <StatusBadge status={event.status} />
      </div>

      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <EventForm initialData={event} canEdit={canEdit} />
      </div>
    </div>
  );
}
