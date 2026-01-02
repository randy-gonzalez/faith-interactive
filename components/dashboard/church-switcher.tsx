"use client";

/**
 * Church Switcher Component
 *
 * Dropdown in the dashboard header for users with multiple church memberships
 * or platform users who can access any church.
 *
 * Shows current church and allows switching to other churches.
 */

import { useState, useEffect, useRef } from "react";

interface ChurchOption {
  churchId: string;
  churchSlug: string;
  churchName: string;
  role: string;
  isPrimary?: boolean;
}

interface ChurchSwitcherProps {
  currentChurch: {
    id: string;
    slug: string;
    name: string;
  };
  isPlatformUser?: boolean;
}

export function ChurchSwitcher({
  currentChurch,
  isPlatformUser = false,
}: ChurchSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [churches, setChurches] = useState<ChurchOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch available churches when dropdown opens
  useEffect(() => {
    if (!isOpen) return;

    async function fetchChurches() {
      setLoading(true);
      try {
        const response = await fetch("/api/auth/switch-church");
        const data = await response.json();

        if (response.ok && data.success) {
          setChurches(data.churches);
        }
      } catch {
        // Silently fail - user can still see current church
      } finally {
        setLoading(false);
      }
    }

    fetchChurches();
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter churches by search
  const filteredChurches = search.trim()
    ? churches.filter(
        (c) =>
          c.churchName.toLowerCase().includes(search.toLowerCase()) ||
          c.churchSlug.toLowerCase().includes(search.toLowerCase())
      )
    : churches;

  // Only show if user has multiple options or is platform user
  const hasMultipleOptions = churches.length > 1 || isPlatformUser;

  async function handleSwitch(churchId: string) {
    if (churchId === currentChurch.id) {
      setIsOpen(false);
      return;
    }

    setSwitching(churchId);

    try {
      const response = await fetch("/api/auth/switch-church", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ churchId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        window.location.href = data.redirectUrl;
      }
    } catch {
      setSwitching(null);
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Current church button */}
      <button
        onClick={() => hasMultipleOptions && setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
          hasMultipleOptions
            ? "hover:bg-gray-100 cursor-pointer"
            : "cursor-default"
        }`}
      >
        <span className="font-medium text-gray-900">
          {currentChurch.name}
        </span>
        {hasMultipleOptions && (
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Search (for many churches) */}
          {(isPlatformUser || churches.length > 5) && (
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search organizations..."
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white"
                autoFocus
              />
            </div>
          )}

          {/* Church list */}
          <div className="max-h-64 overflow-y-auto py-1">
            {loading ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                Loading...
              </div>
            ) : filteredChurches.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                {search ? "No matches found" : "No other organizations"}
              </div>
            ) : (
              filteredChurches.map((church) => (
                <button
                  key={church.churchId}
                  onClick={() => handleSwitch(church.churchId)}
                  disabled={switching !== null}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                    church.churchId === currentChurch.id
                      ? "bg-gray-50"
                      : ""
                  } ${switching === church.churchId ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {church.churchName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {church.churchSlug}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {church.churchId === currentChurch.id && (
                        <svg
                          className="w-4 h-4 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      {switching === church.churchId && (
                        <span className="text-xs text-gray-500">
                          Switching...
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Platform admin link */}
          {isPlatformUser && (
            <div className="border-t border-gray-200 p-2">
              <a
                href="/platform"
                className="block w-full text-center px-4 py-2 text-sm text-indigo-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                Platform Admin Panel
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
