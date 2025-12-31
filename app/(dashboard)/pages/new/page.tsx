/**
 * New Page
 *
 * Create a new page.
 */

import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/guards";
import { canEditContent } from "@/lib/auth/permissions";
import { PageForm } from "@/components/dashboard/page-form";

export default async function NewPagePage() {
  const context = await getAuthContext();
  if (!context) redirect("/login");

  const { user } = context;
  const canEdit = canEditContent(user.role);

  // Viewers can't create pages
  if (!canEdit) {
    redirect("/pages");
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          New Page
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Create a new website page
        </p>
      </div>

      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
        <PageForm canEdit={canEdit} />
      </div>
    </div>
  );
}
