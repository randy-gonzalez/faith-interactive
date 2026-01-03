/**
 * Forms List Page
 *
 * Shows all configurable forms with submission counts and actions.
 */

import Link from "next/link";
import { getAuthContext } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { redirect } from "next/navigation";
import { canEditContent } from "@/lib/auth/permissions";
import { Button } from "@/components/ui/button";
import { FormType } from "@prisma/client";

// Form type display names and icons
const FORM_TYPE_CONFIG: Record<FormType, { label: string; color: string }> = {
  CONTACT: { label: "Contact", color: "bg-blue-100 text-blue-700" },
  PRAYER_REQUEST: { label: "Prayer Request", color: "bg-purple-100 text-purple-700" },
  VOLUNTEER: { label: "Volunteer", color: "bg-green-100 text-green-700" },
  CUSTOM: { label: "Custom", color: "bg-gray-100 text-gray-700" },
};

interface FormWithCounts {
  id: string;
  name: string;
  slug: string;
  type: FormType;
  isActive: boolean;
  updatedAt: Date;
  _count: {
    submissions: number;
  };
  unreadCount: number;
}

export default async function FormsListPage() {
  const context = await getAuthContext();
  if (!context) redirect("/login");

  const { user, church } = context;
  const db = getTenantPrisma(church.id);
  const canEdit = canEditContent(user.role);

  // Get all forms with submission counts
  const forms = await db.form.findMany({
    orderBy: [{ type: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      isActive: true,
      updatedAt: true,
      _count: {
        select: {
          submissions: true,
        },
      },
    },
  });

  // Get unread counts for each form
  const formsWithUnread: FormWithCounts[] = await Promise.all(
    forms.map(async (form) => {
      const unreadCount = await db.formSubmission.count({
        where: {
          formId: form.id,
          isRead: false,
        },
      });
      return {
        ...form,
        unreadCount,
      };
    })
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Forms</h1>
          <p className="text-gray-500 mt-1">
            Manage contact forms, prayer requests, and custom forms
          </p>
        </div>
        {canEdit && (
          <Link href="/forms/new">
            <Button>New Form</Button>
          </Link>
        )}
      </div>

      {/* Forms list */}
      {forms.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No forms yet</p>
          {canEdit && (
            <Link
              href="/forms/new"
              className="text-blue-600 hover:underline mt-2 inline-block"
            >
              Create your first form
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Form
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {formsWithUnread.map((form) => {
                const typeConfig = FORM_TYPE_CONFIG[form.type];
                return (
                  <tr key={form.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {form.name}
                        </div>
                        <div className="text-sm text-gray-500">/{form.slug}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${typeConfig.color}`}
                      >
                        {typeConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">
                          {form._count.submissions}
                        </span>
                        {form.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
                            {form.unreadCount}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {form.isActive ? (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(form.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-3">
                      <Link
                        href={`/forms/${form.id}?tab=submissions`}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        Submissions
                      </Link>
                      {canEdit ? (
                        <Link
                          href={`/forms/${form.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </Link>
                      ) : (
                        <Link
                          href={`/forms/${form.id}`}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          View
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
