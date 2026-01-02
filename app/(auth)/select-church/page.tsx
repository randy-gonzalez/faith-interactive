"use client";

/**
 * Church Selection Page
 *
 * Shown to users who have memberships in multiple churches.
 * Allows them to select which church to work in.
 *
 * For platform users, shows ALL churches (with search).
 *
 * After selecting a church, redirects to /admin/dashboard on the main domain.
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ChurchOption {
  churchId: string;
  churchSlug: string;
  churchName: string;
  role: string;
  isPrimary?: boolean;
  isMember?: boolean;
}

export default function SelectChurchPage() {
  const router = useRouter();
  const [churches, setChurches] = useState<ChurchOption[]>([]);
  const [filteredChurches, setFilteredChurches] = useState<ChurchOption[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isPlatformUser, setIsPlatformUser] = useState(false);

  // Fetch available churches
  useEffect(() => {
    async function fetchChurches() {
      try {
        const response = await fetch("/api/auth/switch-church");
        const data = await response.json();

        if (!response.ok || !data.success) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          setError(data.error || "Failed to load churches");
          return;
        }

        setChurches(data.churches);
        setFilteredChurches(data.churches);
        setIsPlatformUser(data.isPlatformUser);
      } catch {
        setError("Failed to load churches");
      } finally {
        setLoading(false);
      }
    }

    fetchChurches();
  }, [router]);

  // Filter churches based on search
  useEffect(() => {
    if (!search.trim()) {
      setFilteredChurches(churches);
      return;
    }

    const searchLower = search.toLowerCase();
    setFilteredChurches(
      churches.filter(
        (c) =>
          c.churchName.toLowerCase().includes(searchLower) ||
          c.churchSlug.toLowerCase().includes(searchLower)
      )
    );
  }, [search, churches]);

  async function handleSelectChurch(churchId: string) {
    setSwitching(churchId);
    setError("");

    try {
      const response = await fetch("/api/auth/switch-church", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ churchId }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Failed to switch church");
        setSwitching(null);
        return;
      }

      // Redirect to admin dashboard (all admin is on main domain)
      router.push(data.redirectUrl);
      router.refresh();
    } catch {
      setError("Failed to switch church");
      setSwitching(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Select Organization</h2>
        <p className="text-sm text-[var(--muted)] mt-1">
          {isPlatformUser
            ? "Choose an organization to manage"
            : "Choose which organization to work in"}
        </p>
      </div>

      {error && (
        <div className="p-3 text-sm text-[var(--error)] bg-red-50 dark:bg-red-900/20 rounded-md">
          {error}
        </div>
      )}

      {/* Search (for platform users with many churches) */}
      {isPlatformUser && churches.length > 5 && (
        <div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search organizations..."
            className="w-full"
          />
        </div>
      )}

      {/* Church list */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredChurches.length === 0 ? (
          <p className="text-center text-[var(--muted)] py-4">
            {search
              ? "No organizations match your search"
              : "No organizations available"}
          </p>
        ) : (
          filteredChurches.map((church) => (
            <button
              key={church.churchId}
              onClick={() => handleSelectChurch(church.churchId)}
              disabled={switching !== null}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                switching === church.churchId
                  ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                  : "bg-[var(--background)] border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{church.churchName}</p>
                  <p
                    className={`text-sm ${
                      switching === church.churchId
                        ? "text-white/70"
                        : "text-[var(--muted)]"
                    }`}
                  >
                    {church.churchSlug}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {church.isPrimary && (
                    <span className="text-xs px-2 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded">
                      Primary
                    </span>
                  )}
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      switching === church.churchId
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-[var(--muted)]"
                    }`}
                  >
                    {church.role}
                  </span>
                </div>
              </div>
              {switching === church.churchId && (
                <p className="text-sm mt-2 text-white/70">Switching...</p>
              )}
            </button>
          ))
        )}
      </div>

      {/* Platform user: link to platform panel */}
      {isPlatformUser && (
        <div className="pt-4 border-t border-[var(--border)]">
          <button
            onClick={() => router.push("/platform")}
            className="w-full text-center text-sm text-[var(--primary)] hover:underline"
          >
            Go to Platform Admin Panel
          </button>
        </div>
      )}
    </div>
  );
}
