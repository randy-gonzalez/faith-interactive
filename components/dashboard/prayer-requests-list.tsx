"use client";

/**
 * Prayer Requests List Component
 *
 * Interactive list of prayer requests with filtering and actions.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface PrayerRequest {
  id: string;
  name: string | null;
  email: string | null;
  request: string;
  isRead: boolean;
  isArchived: boolean;
  createdAt: Date;
}

interface PrayerRequestsListProps {
  initialRequests: PrayerRequest[];
  unreadCount: number;
  allCount: number;
  archivedCount: number;
}

type FilterTab = "unread" | "all" | "archived";

export function PrayerRequestsList({
  initialRequests,
  unreadCount,
  allCount,
  archivedCount,
}: PrayerRequestsListProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [loading, setLoading] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter requests based on active tab
  const filteredRequests = requests.filter((req) => {
    if (activeTab === "unread") return !req.isRead && !req.isArchived;
    if (activeTab === "archived") return req.isArchived;
    return !req.isArchived;
  });

  const handleMarkRead = async (id: string, isRead: boolean) => {
    setLoading(id);
    try {
      const response = await fetch(`/api/prayer-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead }),
      });

      if (response.ok) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isRead } : r))
        );
      }
    } finally {
      setLoading(null);
    }
  };

  const handleArchive = async (id: string, isArchived: boolean) => {
    setLoading(id);
    try {
      const response = await fetch(`/api/prayer-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived }),
      });

      if (response.ok) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isArchived } : r))
        );
      }
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this prayer request?")) {
      return;
    }

    setLoading(id);
    try {
      const response = await fetch(`/api/prayer-requests/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== id));
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
      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No prayer requests found.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className={`
                bg-white rounded-lg border p-4 transition-colors
                ${
                  request.isRead
                    ? "border-gray-200"
                    : "border-blue-300 bg-blue-50/50"
                }
              `}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {!request.isRead && (
                    <span className="w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                  <span className="font-medium text-gray-900">
                    {request.name || "Anonymous"}
                  </span>
                  {request.email && (
                    <a
                      href={`mailto:${request.email}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {request.email}
                    </a>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(request.createdAt)}
                </span>
              </div>

              {/* Request content */}
              <div
                className={`
                  text-gray-700 whitespace-pre-wrap
                  ${expandedId === request.id ? "" : "line-clamp-3"}
                `}
              >
                {request.request}
              </div>

              {request.request.length > 200 && (
                <button
                  onClick={() =>
                    setExpandedId(expandedId === request.id ? null : request.id)
                  }
                  className="text-sm text-blue-600 hover:underline mt-1"
                >
                  {expandedId === request.id ? "Show less" : "Show more"}
                </button>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                {!request.isArchived && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkRead(request.id, !request.isRead)}
                      disabled={loading === request.id}
                    >
                      {request.isRead ? "Mark Unread" : "Mark Read"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleArchive(request.id, true)}
                      disabled={loading === request.id}
                    >
                      Archive
                    </Button>
                  </>
                )}
                {request.isArchived && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleArchive(request.id, false)}
                    disabled={loading === request.id}
                  >
                    Restore
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(request.id)}
                  disabled={loading === request.id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
