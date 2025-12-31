"use client";

/**
 * Dashboard Header
 *
 * Top header bar with user info and logout button.
 */

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getRoleLabel } from "@/lib/auth/permissions";
import type { UserRole } from "@prisma/client";

interface DashboardHeaderProps {
  userName: string | null;
  userEmail: string;
  userRole: UserRole;
}

export function DashboardHeader({
  userName,
  userEmail,
  userRole,
}: DashboardHeaderProps) {
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
    <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex items-center justify-between px-6">
      <div>{/* Placeholder for breadcrumbs or page title */}</div>

      <div className="flex items-center gap-4">
        {/* User info */}
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {displayName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {getRoleLabel(userRole)}
          </p>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loggingOut ? "..." : "Sign out"}
        </button>
      </div>
    </header>
  );
}
