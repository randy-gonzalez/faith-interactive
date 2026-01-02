/**
 * Super Admin Overview Page
 *
 * Landing page for Fi staff showing quick stats and recent activity.
 */

import { prisma } from "@/lib/db/prisma";
import Link from "next/link";

export default async function SuperAdminPage() {
  // Fetch quick stats (non-tenant-scoped queries)
  const [churchCount, activeChurchCount, suspendedChurchCount, marketingPageCount] =
    await Promise.all([
      prisma.church.count({ where: { deletedAt: null } }),
      prisma.church.count({ where: { status: "ACTIVE", deletedAt: null } }),
      prisma.church.count({ where: { status: "SUSPENDED", deletedAt: null } }),
      prisma.marketingPage.count(),
    ]);

  // Get recently created churches
  const recentChurches = await prisma.church.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      createdAt: true,
    },
  });

  // Get recent platform audit log entries
  const recentAuditLogs = await prisma.platformAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      action: true,
      entityType: true,
      actorEmail: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-gray-600">
          Welcome to the Faith Interactive Staff Admin panel.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Churches"
          value={churchCount}
          href="/platform/churches"
        />
        <StatCard
          label="Active Churches"
          value={activeChurchCount}
          color="green"
        />
        <StatCard
          label="Suspended Churches"
          value={suspendedChurchCount}
          color={suspendedChurchCount > 0 ? "yellow" : "gray"}
        />
        <StatCard
          label="Marketing Pages"
          value={marketingPageCount}
          href="/platform/marketing/pages"
        />
      </div>

      {/* Recent activity grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent churches */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Churches
            </h2>
            <Link
              href="/platform/churches"
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              View all
            </Link>
          </div>

          {recentChurches.length === 0 ? (
            <p className="text-gray-500 text-sm">No churches yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentChurches.map((church) => (
                <li key={church.id}>
                  <Link
                    href={`/platform/churches/${church.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{church.name}</p>
                      <p className="text-sm text-gray-500">{church.slug}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={church.status} />
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(church.createdAt)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent audit log */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h2>
            <Link
              href="/platform/audit-log"
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              View all
            </Link>
          </div>

          {recentAuditLogs.length === 0 ? (
            <p className="text-gray-500 text-sm">No activity yet.</p>
          ) : (
            <ul className="space-y-2">
              {recentAuditLogs.map((log) => (
                <li
                  key={log.id}
                  className="flex items-center justify-between p-2 text-sm"
                >
                  <div>
                    <span className="font-medium text-gray-700">
                      {formatAction(log.action)}
                    </span>
                    <span className="text-gray-500 ml-2">by {log.actorEmail}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatDate(log.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/platform/churches/new"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Create New Church
          </Link>
          <Link
            href="/platform/marketing/pages/new"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Create Marketing Page
          </Link>
        </div>
      </div>
    </div>
  );
}

// Helper components

function StatCard({
  label,
  value,
  href,
  color = "gray",
}: {
  label: string;
  value: number;
  href?: string;
  color?: "gray" | "green" | "yellow" | "red";
}) {
  const colorClasses = {
    gray: "bg-gray-50 border-gray-200",
    green: "bg-green-50 border-green-200",
    yellow: "bg-yellow-50 border-yellow-200",
    red: "bg-red-50 border-red-200",
  };

  const valueClasses = {
    gray: "text-gray-900",
    green: "text-green-700",
    yellow: "text-yellow-700",
    red: "text-red-700",
  };

  const content = (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <p className="text-sm text-gray-600">{label}</p>
      <p className={`text-3xl font-bold ${valueClasses[color]}`}>{value}</p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "ACTIVE";
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
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

function formatAction(action: string): string {
  // Convert SNAKE_CASE to Title Case
  return action
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
