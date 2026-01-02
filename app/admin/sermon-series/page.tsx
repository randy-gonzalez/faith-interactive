/**
 * Sermon Series List Page
 *
 * Displays all sermon series for the church with status and actions.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { canEditContent } from "@/lib/auth/permissions";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function SermonSeriesPage() {
  const context = await getAuthContext();
  if (!context) redirect("/login");

  const { user, church } = context;
  const db = getTenantPrisma(church.id);
  const canEdit = canEditContent(user.role);

  const series = await db.sermonSeries.findMany({
    orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }],
    include: {
      _count: {
        select: { sermons: true },
      },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Sermon Series
          </h1>
          <p className="text-gray-500 mt-1">
            {series.length} series
          </p>
        </div>
        {canEdit && (
          <Link href="/admin/sermon-series/new">
            <Button>Add Series</Button>
          </Link>
        )}
      </div>

      {series.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">
            No sermon series yet.{" "}
            {canEdit && (
              <Link
                href="/admin/sermon-series/new"
                className="text-blue-600 hover:underline"
              >
                Create your first series
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
                  Series
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sermons
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
              {series.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {s.artworkUrl ? (
                        <img
                          src={s.artworkUrl}
                          alt={s.name}
                          className="w-12 h-12 rounded object-cover mr-3"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-gray-200 mr-3 flex items-center justify-center">
                          <span className="text-gray-500 text-xs font-medium">
                            No Art
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {s.name}
                        </div>
                        {s.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {s.description.slice(0, 60)}
                            {s.description.length > 60 ? "..." : ""}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {s.startDate ? (
                      <>
                        {new Date(s.startDate).toLocaleDateString()}
                        {s.endDate && (
                          <> - {new Date(s.endDate).toLocaleDateString()}</>
                        )}
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {s._count.sermons} sermon{s._count.sermons !== 1 ? "s" : ""}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/sermon-series/${s.id}/edit`}
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
