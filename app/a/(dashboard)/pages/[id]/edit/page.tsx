/**
 * Edit Page
 *
 * Edit an existing page.
 */

import { redirect, notFound } from "next/navigation";
import { getAuthContext } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { canEditContent } from "@/lib/auth/permissions";
import { PageEditor } from "@/components/dashboard/page-editor";
import { StatusBadge } from "@/components/ui/status-badge";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPagePage({ params }: EditPageProps) {
  const { id } = await params;
  const context = await getAuthContext();
  if (!context) redirect("/login");

  const { user, church } = context;
  const db = getTenantPrisma(church.id);
  const canEdit = canEditContent(user.role);

  const page = await db.page.findUnique({
    where: { id },
  });

  if (!page) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {canEdit ? "Edit Page" : "View Page"}
          </h1>
          <p className="text-gray-500 mt-1">
            {page.title}
          </p>
        </div>
        <StatusBadge status={page.status} />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <PageEditor initialData={page} canEdit={canEdit} churchSlug={church.slug} />
      </div>
    </div>
  );
}
