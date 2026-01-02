/**
 * Platform Audit Log Page
 *
 * View all platform-level audit log entries.
 */

import { prisma } from "@/lib/db/prisma";
import { requirePlatformUserOrRedirect } from "@/lib/auth/guards";

export default async function AuditLogPage() {
  await requirePlatformUserOrRedirect();

  const logs = await prisma.platformAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      action: true,
      entityType: true,
      entityId: true,
      targetChurchId: true,
      actorEmail: true,
      actorIp: true,
      metadata: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
        <p className="text-gray-600">
          Platform-level activity log for Fi staff actions.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No audit log entries yet.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actor
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDateTime(log.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <ActionBadge action={log.action} />
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="text-gray-600">{formatEntityType(log.entityType)}</span>
                    {log.entityId && (
                      <span className="text-gray-400 ml-1 text-xs">
                        ({log.entityId.slice(0, 8)}...)
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {log.actorEmail}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {log.metadata ? formatMetadata(log.metadata as Record<string, unknown>) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {logs.length === 100 && (
        <p className="text-sm text-gray-500 text-center">
          Showing most recent 100 entries.
        </p>
      )}
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const colorMap: Record<string, string> = {
    CHURCH_CREATED: "bg-green-100 text-green-700",
    CHURCH_UPDATED: "bg-blue-100 text-blue-700",
    CHURCH_SUSPENDED: "bg-yellow-100 text-yellow-700",
    CHURCH_UNSUSPENDED: "bg-green-100 text-green-700",
    CHURCH_DELETED: "bg-red-100 text-red-700",
    MARKETING_PAGE_CREATED: "bg-green-100 text-green-700",
    MARKETING_PAGE_PUBLISHED: "bg-green-100 text-green-700",
    MARKETING_PAGE_UNPUBLISHED: "bg-yellow-100 text-yellow-700",
    MARKETING_PAGE_DELETED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-medium rounded ${
        colorMap[action] || "bg-gray-100 text-gray-700"
      }`}
    >
      {formatAction(action)}
    </span>
  );
}

function formatAction(action: string): string {
  return action
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatEntityType(entityType: string): string {
  return entityType
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatMetadata(metadata: Record<string, unknown>): string {
  if (metadata.changes) {
    const changes = metadata.changes as Record<string, { from: unknown; to: unknown }>;
    return Object.entries(changes)
      .map(([key, { from, to }]) => `${key}: ${from} → ${to}`)
      .join(", ");
  }
  if (metadata.name) return `name: ${metadata.name}`;
  if (metadata.title) return `title: ${metadata.title}`;
  if (metadata.slug) return `slug: ${metadata.slug}`;
  return JSON.stringify(metadata).slice(0, 50);
}
