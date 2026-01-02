/**
 * Churches List Page
 *
 * List all churches with search and filter capabilities.
 */

import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { requirePlatformUserOrRedirect, isPlatformAdmin } from "@/lib/auth/guards";
import { ManageChurchButton } from "@/components/platform/manage-church-button";

export default async function ChurchesPage() {
  const user = await requirePlatformUserOrRedirect();
  const canCreate = isPlatformAdmin(user);

  const churches = await prisma.church.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      primaryContactEmail: true,
      createdAt: true,
      _count: {
        select: {
          memberships: { where: { isActive: true } },
          pages: true,
          customDomains: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Churches</h1>
          <p className="text-gray-600">
            Manage all church tenants on the platform.
          </p>
        </div>
        {canCreate && (
          <Link
            href="/platform/churches/new"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Create Church
          </Link>
        )}
      </div>

      {/* Churches table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {churches.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No churches yet.</p>
            {canCreate && (
              <Link
                href="/platform/churches/new"
                className="text-indigo-600 hover:text-indigo-800 mt-2 inline-block"
              >
                Create your first church
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Church
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Pages
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Domains
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {churches.map((church) => (
                <tr key={church.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{church.name}</p>
                      <p className="text-sm text-gray-500">{church.slug}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={church.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {church._count.memberships}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {church._count.pages}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {church._count.customDomains}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(church.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <ManageChurchButton
                      churchId={church.id}
                      churchName={church.name}
                    />
                    <Link
                      href={`/platform/churches/${church.id}`}
                      className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "ACTIVE";
  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
        isActive
          ? "bg-green-100 text-green-700"
          : "bg-yellow-100 text-yellow-700"
      }`}
    >
      {isActive ? "Active" : "Suspended"}
    </span>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
