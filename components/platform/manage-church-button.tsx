"use client";

/**
 * Manage Church Button
 *
 * Switches the platform user's active church context and redirects to the admin dashboard.
 * Used in platform pages to allow staff to manage any church.
 *
 * With hostname-based routing:
 * - Platform lives at platform.faith-interactive.com
 * - Admin lives at admin.faith-interactive.com
 * - This button triggers a cross-subdomain redirect to admin surface
 */

import { useState } from "react";
import { buildSurfaceUrl } from "@/lib/hostname/parser";

interface ManageChurchButtonProps {
  churchId: string;
  churchName: string;
  variant?: "link" | "button";
  className?: string;
}

export function ManageChurchButton({
  churchId,
  churchName,
  variant = "link",
  className,
}: ManageChurchButtonProps) {
  const [switching, setSwitching] = useState(false);

  async function handleManage() {
    setSwitching(true);

    try {
      const response = await fetch("/api/auth/switch-church", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ churchId }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error("Failed to switch church:", data.error);
        setSwitching(false);
        return;
      }

      // Cross-subdomain redirect to admin surface
      // The API returns a relative path, but we need to redirect to the admin subdomain
      const hostname = window.location.hostname;
      const isLocal = hostname.includes(".local") || hostname.includes("localhost");
      const useLocalhost = hostname.includes("localhost");
      const adminUrl = buildSurfaceUrl("admin", data.redirectUrl || "/dashboard", { isLocal, useLocalhost });
      window.location.href = adminUrl;
    } catch (error) {
      console.error("Failed to switch church:", error);
      setSwitching(false);
    }
  }

  if (variant === "button") {
    return (
      <button
        onClick={handleManage}
        disabled={switching}
        className={
          className ||
          "px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        }
        title={`Manage ${churchName}`}
      >
        {switching ? "Switching..." : "Manage Site"}
      </button>
    );
  }

  return (
    <button
      onClick={handleManage}
      disabled={switching}
      className={
        className ||
        "text-indigo-600 hover:text-indigo-800 text-sm font-medium disabled:opacity-50"
      }
      title={`Manage ${churchName}`}
    >
      {switching ? "..." : "Manage"}
    </button>
  );
}
