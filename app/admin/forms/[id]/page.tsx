/**
 * Form Editor Page
 *
 * Edit form fields, settings, notifications, and view submissions.
 */

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { canEditContent } from "@/lib/auth/permissions";
import { FormEditor } from "@/components/dashboard/form-editor";
import { FormType } from "@prisma/client";

// Form type display names
const FORM_TYPE_LABELS: Record<FormType, string> = {
  CONTACT: "Contact Form",
  PRAYER_REQUEST: "Prayer Request",
  VOLUNTEER: "Volunteer Application",
  CUSTOM: "Custom Form",
};

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function FormEditorPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { tab } = await searchParams;

  const context = await getAuthContext();
  if (!context) redirect("/login");

  const { user, church } = context;
  const db = getTenantPrisma(church.id);
  const canEdit = canEditContent(user.role);

  // Get the form with submission counts
  const form = await db.form.findFirst({
    where: { id },
  });

  if (!form) {
    notFound();
  }

  // Get submission counts
  const submissionCount = await db.formSubmission.count({
    where: { formId: id },
  });

  const unreadCount = await db.formSubmission.count({
    where: { formId: id, isRead: false },
  });

  const formWithCounts = {
    ...form,
    submissionCount,
    unreadCount,
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/forms" className="hover:text-gray-700">
          Forms
        </Link>
        <span>/</span>
        <span className="text-gray-900">{form.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {form.name}
          </h1>
          <p className="text-gray-500 mt-1">
            {FORM_TYPE_LABELS[form.type]} &middot; /{form.slug}
          </p>
        </div>
      </div>

      {/* Form Editor */}
      <FormEditor
        form={formWithCounts}
        canEdit={canEdit}
        initialTab={tab}
      />
    </div>
  );
}
