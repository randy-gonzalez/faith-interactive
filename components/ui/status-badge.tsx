/**
 * Status Badge Component
 *
 * Displays content status (Draft/Published) and expiration state.
 */

import type { ContentStatus } from "@prisma/client";

interface StatusBadgeProps {
  status: ContentStatus;
  expiresAt?: Date | null;
}

export function StatusBadge({ status, expiresAt }: StatusBadgeProps) {
  const isExpired = expiresAt && new Date(expiresAt) < new Date();

  if (isExpired) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
        Expired
      </span>
    );
  }

  if (status === "PUBLISHED") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
        Published
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
      Draft
    </span>
  );
}
