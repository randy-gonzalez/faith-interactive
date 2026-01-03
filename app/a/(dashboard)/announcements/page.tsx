/**
 * Announcements List Page
 *
 * Displays all announcements for the church with status and actions.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { canEditContent } from "@/lib/auth/permissions";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function AnnouncementsPage() {
  const context = await getAuthContext();
  if (!context) redirect("/login");

  const { user, church } = context;
  const db = getTenantPrisma(church.id);
  const canEdit = canEditContent(user.role);

  const announcements = await db.announcement.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Announcements
          </h1>
          <p className="text-gray-500 mt-1">
            {announcements.length} announcement
            {announcements.length !== 1 ? "s" : ""}
          </p>
        </div>
        {canEdit && (
          <Link href="/announcements/new">
            <Button>Add Announcement</Button>
          </Link>
        )}
      </div>

      {announcements.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">
            No announcements yet.{" "}
            {canEdit && (
              <Link
                href="/announcements/new"
                className="text-blue-600 hover:underline"
              >
                Add your first announcement
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
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires
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
              {announcements.map((announcement) => {
                const isExpired =
                  announcement.expiresAt &&
                  new Date(announcement.expiresAt) < new Date();
                return (
                  <tr
                    key={announcement.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {announcement.title}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {announcement.body.substring(0, 60)}
                        {announcement.body.length > 60 ? "..." : ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(announcement.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {announcement.expiresAt ? (
                        <span className={isExpired ? "text-red-500" : ""}>
                          {new Date(announcement.expiresAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                          {isExpired && " (Expired)"}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={announcement.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/announcements/${announcement.id}/edit`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {canEdit ? "Edit" : "View"}
                      </Link>
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
