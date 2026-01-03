/**
 * New Venue Page
 *
 * Create a new venue.
 */

import { redirect } from "next/navigation";
import { requireAuthContext } from "@/lib/auth/guards";
import { canEditContent } from "@/lib/auth/permissions";
import { VenueForm } from "@/components/dashboard/venue-form";

export default async function NewVenuePage() {
  const context = await requireAuthContext();
  const canEdit = canEditContent(context.user.role);

  if (!canEdit) {
    redirect("/venues");
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Add Venue
        </h1>
        <p className="text-gray-500 mt-1">
          Create a new venue for events
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <VenueForm canEdit={canEdit} />
      </div>
    </div>
  );
}
