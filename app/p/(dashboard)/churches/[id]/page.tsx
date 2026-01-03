/**
 * Church Detail Page
 *
 * View and manage a specific church.
 */

import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  requirePlatformUserOrRedirect,
  isPlatformAdmin,
} from "@/lib/auth/guards";
import { ChurchActions } from "@/components/platform/church-actions";
import { ManageChurchButton } from "@/components/platform/manage-church-button";

type PageProps = { params: Promise<{ id: string }> };

export default async function ChurchDetailPage({ params }: PageProps) {
  const user = await requirePlatformUserOrRedirect();
  const { id } = await params;
  const canEdit = isPlatformAdmin(user);

  const church = await prisma.church.findUnique({
    where: { id },
    include: {
      siteSettings: {
        select: {
          maintenanceMode: true,
        },
      },
      _count: {
        select: {
          memberships: { where: { isActive: true } },
          pages: true,
          sermons: true,
          events: true,
          announcements: true,
          leadershipProfiles: true,
          customDomains: true,
          redirectRules: true,
          media: { where: { deletedAt: null } },
        },
      },
    },
  });

  if (!church) {
    notFound();
  }

  // Get memberships (users) for this church
  const memberships = await prisma.churchMembership.findMany({
    where: { churchId: id, isActive: true },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
        },
      },
    },
  });

  // Transform to user format for display
  const users = memberships.map((m) => ({
    id: m.user.id,
    name: m.user.name,
    email: m.user.email,
    role: m.role,
    isActive: m.user.isActive,
    createdAt: m.createdAt,
  }));

  // Get domains for this church
  const domains = await prisma.customDomain.findMany({
    where: { churchId: id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      hostname: true,
      status: true,
      verifiedAt: true,
    },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/churches"
              className="text-indigo-600 hover:text-indigo-800"
            >
              Churches
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">{church.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{church.name}</h1>
          <p className="text-gray-600">{church.slug}.faithinteractive.com</p>
        </div>
        <div className="flex items-center gap-3">
          <ManageChurchButton
            churchId={church.id}
            churchName={church.name}
            variant="button"
          />
          {canEdit && <ChurchActions church={church} />}
        </div>
      </div>

      {/* Status and info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoCard
          label="Status"
          value={
            <StatusBadge status={church.status} />
          }
        />
        <InfoCard
          label="Created"
          value={formatDate(church.createdAt)}
        />
        <InfoCard
          label="Maintenance Mode"
          value={church.siteSettings?.maintenanceMode ? "Enabled" : "Disabled"}
        />
      </div>

      {/* Content stats */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Content Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <StatItem label="Pages" value={church._count.pages} />
          <StatItem label="Sermons" value={church._count.sermons} />
          <StatItem label="Events" value={church._count.events} />
          <StatItem label="Announcements" value={church._count.announcements} />
          <StatItem label="Leadership" value={church._count.leadershipProfiles} />
          <StatItem label="Media" value={church._count.media} />
        </div>
      </div>

      {/* Users section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Team Members ({users.length})
          </h2>
          {canEdit && (
            <Link
              href={`/churches/${id}/users/invite`}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Invite User
            </Link>
          )}
        </div>

        {users.length === 0 ? (
          <p className="text-gray-500 text-sm">No users yet.</p>
        ) : (
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left py-2 text-sm font-medium text-gray-600">
                  User
                </th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">
                  Role
                </th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">
                  Status
                </th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="py-3">
                    <p className="font-medium text-gray-900">
                      {user.name || "No name"}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </td>
                  <td className="py-3">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="py-3">
                    <span
                      className={`text-sm ${
                        user.isActive ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-gray-600">
                    {formatDate(user.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Domains section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Custom Domains ({domains.length})
          </h2>
        </div>

        {domains.length === 0 ? (
          <p className="text-gray-500 text-sm">No custom domains configured.</p>
        ) : (
          <ul className="space-y-2">
            {domains.map((domain) => (
              <li
                key={domain.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="font-medium text-gray-900">
                  {domain.hostname}
                </span>
                <DomainStatusBadge status={domain.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// Helper components

function InfoCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <div className="text-lg font-medium text-gray-900">{value}</div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "ACTIVE";
  return (
    <span
      className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
        isActive
          ? "bg-green-100 text-green-700"
          : "bg-yellow-100 text-yellow-700"
      }`}
    >
      {isActive ? "Active" : "Suspended"}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    ADMIN: "bg-purple-100 text-purple-700",
    EDITOR: "bg-blue-100 text-blue-700",
    VIEWER: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
        colors[role] || colors.VIEWER
      }`}
    >
      {role}
    </span>
  );
}

function DomainStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    ERROR: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
        colors[status] || colors.PENDING
      }`}
    >
      {status}
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
