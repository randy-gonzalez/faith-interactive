"use client";

/**
 * Dashboard Header
 *
 * Top header bar with church switcher, user info, and logout button.
 */

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getRoleLabel } from "@/lib/auth/permissions";
import { ChurchSwitcher } from "./church-switcher";
import { buildSurfaceUrl } from "@/lib/hostname/parser";
import type { UserRole, PlatformRole } from "@prisma/client";

interface DashboardHeaderProps {
  userName: string | null;
  userEmail: string;
  userRole: UserRole;
  platformRole?: PlatformRole | null;
  currentChurch?: {
    id: string;
    slug: string;
    name: string;
  };
}

export function DashboardHeader({
  userName,
  userEmail,
  userRole,
  platformRole,
  currentChurch,
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
  const isPlatformUser = !!platformRole;

  return (
    <header className="h-16 border-b border-blue-200 bg-blue-50 flex items-center justify-between px-6">
      {/* Left side: Church switcher + View Site */}
      <div className="flex items-center gap-3">
        {currentChurch && (
          <>
            <ChurchSwitcher
              currentChurch={currentChurch}
              isPlatformUser={isPlatformUser}
            />
            <ViewSiteLink slug={currentChurch.slug} />
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* User info */}
        <div className="text-right">
          <p className="text-sm font-medium text-blue-900">
            {displayName}
          </p>
          <p className="text-xs text-blue-600">
            {getRoleLabel(userRole)}
            {isPlatformUser && (
              <span className="ml-1 text-indigo-500">
                ({platformRole === "PLATFORM_ADMIN" ? "Platform Admin" : "Platform Staff"})
              </span>
            )}
          </p>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-900 border border-blue-300 rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50"
        >
          {loggingOut ? "..." : "Sign out"}
        </button>
      </div>
    </header>
  );
}

/**
 * View Site link that constructs the subdomain URL for the church's public site.
 * Uses buildSurfaceUrl to correctly construct the tenant URL.
 *
 * Examples:
 * - admin.localhost:3000 → hope-community.localhost:3000
 * - admin.faith-interactive.com → hope-community.faith-interactive.com
 */
function ViewSiteLink({ slug }: { slug: string }) {
  const [siteUrl, setSiteUrl] = useState<string | null>(null);

  // Calculate URL on client-side only to avoid hydration mismatch
  useEffect(() => {
    const hostname = window.location.hostname;
    const isLocal = hostname.includes("localhost") || hostname.includes(".local");

    // Use buildSurfaceUrl to correctly construct tenant URL
    const url = buildSurfaceUrl("tenant", "/", {
      churchSlug: slug,
      isLocal,
      useLocalhost: hostname.includes("localhost"),
    });
    setSiteUrl(url);
  }, [slug]);

  // Don't render until we have the URL (avoids hydration mismatch)
  if (!siteUrl) return null;

  return (
    <a
      href={siteUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-100 transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-4 h-4"
      >
        <path
          fillRule="evenodd"
          d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
          clipRule="evenodd"
        />
        <path
          fillRule="evenodd"
          d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
          clipRule="evenodd"
        />
      </svg>
      View Site
    </a>
  );
}
