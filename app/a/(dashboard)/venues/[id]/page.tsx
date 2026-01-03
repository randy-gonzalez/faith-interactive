/**
 * Edit Venue Page
 *
 * Edit an existing venue.
 */

import { redirect, notFound } from "next/navigation";
import { getAuthContext } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { canEditContent } from "@/lib/auth/permissions";
import { VenueForm } from "@/components/dashboard/venue-form";

interface EditVenueProps {
  params: Promise<{ id: string }>;
}

export default async function EditVenuePage({ params }: EditVenueProps) {
  const { id } = await params;
  const context = await getAuthContext();
  if (!context) redirect("/login");

  const { user, church } = context;
  const db = getTenantPrisma(church.id);
  const canEdit = canEditContent(user.role);

  const venue = await db.venue.findUnique({
    where: { id },
    include: {
      _count: {
        select: { events: true },
      },
    },
  });

  if (!venue || !venue.isActive) {
    notFound();
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          {canEdit ? "Edit Venue" : "View Venue"}
        </h1>
        <p className="text-gray-500 mt-1">
          {venue.name}
          {venue._count.events > 0 && (
            <span className="ml-2 text-sm">
              ({venue._count.events} event{venue._count.events !== 1 ? "s" : ""})
            </span>
          )}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <VenueForm initialData={venue} canEdit={canEdit} />
      </div>
    </div>
  );
}
