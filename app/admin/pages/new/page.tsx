/**
 * New Page
 *
 * Create a new page.
 */

import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/guards";
import { canEditContent } from "@/lib/auth/permissions";
import { PageEditor } from "@/components/dashboard/page-editor";

export default async function NewPagePage() {
  const context = await getAuthContext();
  if (!context) redirect("/login");

  const { user, church } = context;
  const canEdit = canEditContent(user.role);

  // Viewers can't create pages
  if (!canEdit) {
    redirect("/admin/pages");
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          New Page
        </h1>
        <p className="text-gray-500 mt-1">
          Create a new website page
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <PageEditor canEdit={canEdit} churchSlug={church.slug} />
      </div>
    </div>
  );
}
