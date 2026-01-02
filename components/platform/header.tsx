"use client";

/**
 * Platform Header
 *
 * Top header bar for the Fi Staff Platform panel.
 * Shows a distinct banner to make it clear this is the internal admin.
 */

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PlatformRole } from "@prisma/client";

interface PlatformHeaderProps {
  userName: string | null;
  userEmail: string;
  platformRole: PlatformRole;
  /** If user has a church, allow them to go back to church dashboard */
  hasChurchAccess?: boolean;
}

export function PlatformHeader({
  userName,
  userEmail,
  platformRole,
  hasChurchAccess,
}: PlatformHeaderProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  const displayName = userName || userEmail;

  return (
    <header className="h-16 border-b border-indigo-200 bg-indigo-50 flex items-center justify-between px-6">
      {/* Staff Admin Banner */}
      <div className="flex items-center gap-3">
        <div className="px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-full uppercase tracking-wide">
          Staff Admin
        </div>
        <span className="text-sm text-indigo-600">
          Internal use only - Faith Interactive
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Link back to church dashboard if applicable */}
        {hasChurchAccess && (
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-300 rounded-md hover:bg-indigo-100 transition-colors"
          >
            Church Dashboard
          </button>
        )}

        {/* User info */}
        <div className="text-right">
          <p className="text-sm font-medium text-indigo-900">{displayName}</p>
          <p className="text-xs text-indigo-600">
            {platformRole === "PLATFORM_ADMIN" ? "Platform Admin" : "Platform Staff"}
          </p>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="px-3 py-1.5 text-sm text-indigo-600 hover:text-indigo-900 border border-indigo-300 rounded-md hover:bg-indigo-100 transition-colors disabled:opacity-50"
        >
          {loggingOut ? "..." : "Sign out"}
        </button>
      </div>
    </header>
  );
}
