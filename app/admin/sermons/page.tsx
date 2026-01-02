/**
 * Sermons List Page
 *
 * Displays all sermons for the church with status and actions.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { canEditContent } from "@/lib/auth/permissions";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function SermonsPage() {
  const context = await getAuthContext();
  if (!context) redirect("/login");

  const { user, church } = context;
  const db = getTenantPrisma(church.id);
  const canEdit = canEditContent(user.role);

  const sermons = await db.sermon.findMany({
    orderBy: { date: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Sermons
          </h1>
          <p className="text-gray-500 mt-1">
            {sermons.length} sermon{sermons.length !== 1 ? "s" : ""}
          </p>
        </div>
        {canEdit && (
          <Link href="/admin/sermons/new">
            <Button>Add Sermon</Button>
          </Link>
        )}
      </div>

      {sermons.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">
            No sermons yet.{" "}
            {canEdit && (
              <Link
                href="/admin/sermons/new"
                className="text-blue-600 hover:underline"
              >
                Add your first sermon
              </Link>
            )}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Speaker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sermons.map((sermon) => (
                <tr
                  key={sermon.id}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {sermon.title}
                    </div>
                    {sermon.scripture && (
                      <div className="text-sm text-gray-500">
                        {sermon.scripture}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {sermon.speakerName || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(sermon.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={sermon.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/sermons/${sermon.id}/edit`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {canEdit ? "Edit" : "View"}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
