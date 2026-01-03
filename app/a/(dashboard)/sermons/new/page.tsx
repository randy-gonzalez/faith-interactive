/**
 * New Sermon Page
 *
 * Create a new sermon.
 */

import { redirect } from "next/navigation";
import { requireAuthContext } from "@/lib/auth/guards";
import { canEditContent } from "@/lib/auth/permissions";
import { SermonForm } from "@/components/dashboard/sermon-form";

export default async function NewSermonPage() {
  const context = await requireAuthContext();
  const canEdit = canEditContent(context.user.role);

  if (!canEdit) {
    redirect("/sermons");
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Add Sermon
        </h1>
        <p className="text-gray-500 mt-1">
          Create a new sermon entry
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <SermonForm canEdit={canEdit} />
      </div>
    </div>
  );
}
