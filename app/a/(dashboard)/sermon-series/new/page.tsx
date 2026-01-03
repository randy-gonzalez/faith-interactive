/**
 * New Sermon Series Page
 *
 * Create a new sermon series.
 */

import { redirect } from "next/navigation";
import { requireAuthContext } from "@/lib/auth/guards";
import { canEditContent } from "@/lib/auth/permissions";
import { SermonSeriesForm } from "@/components/dashboard/sermon-series-form";

export default async function NewSermonSeriesPage() {
  const context = await requireAuthContext();
  const canEdit = canEditContent(context.user.role);

  if (!canEdit) {
    redirect("/sermon-series");
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Create Sermon Series
        </h1>
        <p className="text-gray-500 mt-1">
          Create a new sermon series to group related sermons
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <SermonSeriesForm canEdit={canEdit} />
      </div>
    </div>
  );
}
