/**
 * New Global Block Page
 *
 * Create a new reusable global block.
 */

import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/guards";
import { canEditContent } from "@/lib/auth/permissions";
import { GlobalBlockEditor } from "@/components/dashboard/global-block-editor";

export default async function NewGlobalBlockPage() {
  const context = await getAuthContext();
  if (!context) redirect("/login");

  const { user } = context;
  const canEdit = canEditContent(user.role);

  if (!canEdit) {
    redirect("/admin/global-blocks");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          New Global Block
        </h1>
        <p className="text-gray-500 mt-1">
          Create a reusable block that can be placed on any page
        </p>
      </div>

      {/* Editor */}
      <GlobalBlockEditor canEdit={canEdit} />
    </div>
  );
}
