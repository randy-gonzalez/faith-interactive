/**
 * New Leadership Profile Page
 *
 * Create a new leadership profile.
 */

import { redirect } from "next/navigation";
import { requireAuthContext } from "@/lib/auth/guards";
import { canEditContent } from "@/lib/auth/permissions";
import { LeadershipForm } from "@/components/dashboard/leadership-form";

export default async function NewLeadershipPage() {
  const context = await requireAuthContext();
  const canEdit = canEditContent(context.user.role);

  if (!canEdit) {
    redirect("/leadership");
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Add Leadership Profile
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Create a new leadership profile
        </p>
      </div>

      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <LeadershipForm canEdit={canEdit} />
      </div>
    </div>
  );
}
