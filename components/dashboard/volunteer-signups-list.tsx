"use client";

/**
 * Volunteer Signups List Component
 *
 * Interactive list of volunteer signups with filtering and actions.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { JsonValue } from "@prisma/client/runtime/library";

interface VolunteerSignup {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  interests: JsonValue;
  message: string | null;
  isRead: boolean;
  isArchived: boolean;
  createdAt: Date;
}

interface VolunteerSignupsListProps {
  initialSignups: VolunteerSignup[];
  unreadCount: number;
  allCount: number;
  archivedCount: number;
}

type FilterTab = "unread" | "all" | "archived";

export function VolunteerSignupsList({
  initialSignups,
  unreadCount,
  allCount,
  archivedCount,
}: VolunteerSignupsListProps) {
  const [signups, setSignups] = useState(initialSignups);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [loading, setLoading] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter signups based on active tab
  const filteredSignups = signups.filter((signup) => {
    if (activeTab === "unread") return !signup.isRead && !signup.isArchived;
    if (activeTab === "archived") return signup.isArchived;
    return !signup.isArchived;
  });

  const handleMarkRead = async (id: string, isRead: boolean) => {
    setLoading(id);
    try {
      const response = await fetch(`/api/volunteer-signups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead }),
      });

      if (response.ok) {
        setSignups((prev) =>
          prev.map((s) => (s.id === id ? { ...s, isRead } : s))
        );
      }
    } finally {
      setLoading(null);
    }
  };

  const handleArchive = async (id: string, isArchived: boolean) => {
    setLoading(id);
    try {
      const response = await fetch(`/api/volunteer-signups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived }),
      });

      if (response.ok) {
        setSignups((prev) =>
          prev.map((s) => (s.id === id ? { ...s, isArchived } : s))
        );
      }
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this signup?")) {
      return;
    }

    setLoading(id);
    try {
      const response = await fetch(`/api/volunteer-signups/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSignups((prev) => prev.filter((s) => s.id !== id));
      }
    } finally {
      setLoading(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getInterests = (interests: JsonValue): string[] => {
    if (Array.isArray(interests)) {
      return interests.filter((i): i is string => typeof i === "string");
    }
    return [];
  };

  const tabs = [
    { key: "unread" as const, label: "Unread", count: unreadCount },
    { key: "all" as const, label: "All", count: allCount },
    { key: "archived" as const, label: "Archived", count: archivedCount },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors
              ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }
            `}
          >
            {tab.label}
            <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-100 text-xs">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {filteredSignups.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No volunteer signups found.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSignups.map((signup) => {
            const interests = getInterests(signup.interests);
            const isExpanded = expandedId === signup.id;

            return (
              <div
                key={signup.id}
                className={`
                  bg-white rounded-lg border p-4 transition-colors
                  ${
                    signup.isRead
                      ? "border-gray-200"
                      : "border-green-300 bg-green-50/50"
                  }
                `}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {!signup.isRead && (
                      <span className="w-2 h-2 bg-green-600 rounded-full" />
                    )}
                    <span className="font-medium text-gray-900">
                      {signup.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(signup.createdAt)}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                  <a
                    href={`mailto:${signup.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {signup.email}
                  </a>
                  {signup.phone && (
                    <a
                      href={`tel:${signup.phone.replace(/\D/g, "")}`}
                      className="text-blue-600 hover:underline"
                    >
                      {signup.phone}
                    </a>
                  )}
                </div>

                {/* Interests */}
                {interests.length > 0 && (
                  <div className="mb-3">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Interests:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {interests.map((interest) => (
                        <span
                          key={interest}
                          className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message */}
                {signup.message && (
                  <div
                    className={`
                      text-gray-700 text-sm whitespace-pre-wrap
                      ${isExpanded ? "" : "line-clamp-2"}
                    `}
                  >
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                      Message:
                    </span>
                    {signup.message}
                  </div>
                )}

                {signup.message && signup.message.length > 100 && (
                  <button
                    onClick={() =>
                      setExpandedId(isExpanded ? null : signup.id)
                    }
                    className="text-sm text-blue-600 hover:underline mt-1"
                  >
                    {isExpanded ? "Show less" : "Show more"}
                  </button>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                  {!signup.isArchived && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkRead(signup.id, !signup.isRead)}
                        disabled={loading === signup.id}
                      >
                        {signup.isRead ? "Mark Unread" : "Mark Read"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleArchive(signup.id, true)}
                        disabled={loading === signup.id}
                      >
                        Archive
                      </Button>
                    </>
                  )}
                  {signup.isArchived && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleArchive(signup.id, false)}
                      disabled={loading === signup.id}
                    >
                      Restore
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(signup.id)}
                    disabled={loading === signup.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
