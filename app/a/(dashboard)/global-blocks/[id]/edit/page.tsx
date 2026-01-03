/**
 * Edit Global Block Page
 *
 * Edit an existing global block.
 */

import { redirect, notFound } from "next/navigation";
import { getAuthContext } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { canEditContent } from "@/lib/auth/permissions";
import { GlobalBlockEditor } from "@/components/dashboard/global-block-editor";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditGlobalBlockPage({ params }: PageProps) {
  const { id } = await params;
  const context = await getAuthContext();
  if (!context) redirect("/login");

  const { user, church } = context;
  const db = getTenantPrisma(church.id);
  const canEdit = canEditContent(user.role);

  // Load the global block
  const globalBlock = await db.globalBlock.findFirst({
    where: { id, isActive: true },
  });

  if (!globalBlock) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {canEdit ? "Edit Global Block" : "View Global Block"}
        </h1>
        <p className="text-gray-500 mt-1">
          {canEdit
            ? "Changes will apply everywhere this block is used"
            : "You have view-only access to this global block"}
        </p>
      </div>

      {/* Editor */}
      <GlobalBlockEditor
        initialData={{
          id: globalBlock.id,
          name: globalBlock.name,
          description: globalBlock.description,
          blockContent: globalBlock.blockContent,
        }}
        canEdit={canEdit}
      />
    </div>
  );
}
