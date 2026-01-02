/**
 * Leadership Profiles List Page
 *
 * Displays all leadership profiles for the church with status and actions.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { canEditContent } from "@/lib/auth/permissions";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function LeadershipPage() {
  const context = await getAuthContext();
  if (!context) redirect("/login");

  const { user, church } = context;
  const db = getTenantPrisma(church.id);
  const canEdit = canEditContent(user.role);

  const profiles = await db.leadershipProfile.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Leadership
          </h1>
          <p className="text-gray-500 mt-1">
            {profiles.length} profile{profiles.length !== 1 ? "s" : ""}
          </p>
        </div>
        {canEdit && (
          <Link href="/admin/leadership/new">
            <Button>Add Profile</Button>
          </Link>
        )}
      </div>

      {profiles.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">
            No leadership profiles yet.{" "}
            {canEdit && (
              <Link
                href="/admin/leadership/new"
                className="text-blue-600 hover:underline"
              >
                Add your first profile
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
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
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
              {profiles.map((profile) => (
                <tr
                  key={profile.id}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {profile.photoUrl ? (
                        <img
                          src={profile.photoUrl}
                          alt={profile.name}
                          className="w-10 h-10 rounded-full object-cover mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                          <span className="text-gray-500 text-sm font-medium">
                            {profile.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </span>
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-900">
                        {profile.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {profile.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {profile.email || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={profile.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/leadership/${profile.id}/edit`}
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
