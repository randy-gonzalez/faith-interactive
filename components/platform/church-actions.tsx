"use client";

/**
 * Church Actions Component
 *
 * Action buttons for managing a church (suspend/unsuspend, delete).
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ChurchActionsProps {
  church: {
    id: string;
    name: string;
    slug: string;
    status: string;
  };
}

export function ChurchActions({ church }: ChurchActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isSuspended = church.status === "SUSPENDED";

  async function handleStatusToggle() {
    setLoading(true);
    try {
      const newStatus = isSuspended ? "ACTIVE" : "SUSPENDED";
      const response = await fetch(`/api/platform/churches/${church.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update status");
      }

      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    try {
      const response = await fetch(`/api/platform/churches/${church.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete church");
      }

      router.push("/platform/churches");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {/* Suspend/Unsuspend button */}
      <button
        onClick={handleStatusToggle}
        disabled={loading}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${
          isSuspended
            ? "bg-green-100 text-green-700 hover:bg-green-200"
            : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
        }`}
      >
        {loading ? "..." : isSuspended ? "Activate" : "Suspend"}
      </button>

      {/* Delete button */}
      <button
        onClick={() => setShowDeleteConfirm(true)}
        disabled={loading}
        className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
      >
        Delete
      </button>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Church?
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <strong>{church.name}</strong>?
              This action will soft-delete the church and all its data.
            </p>
            <p className="text-sm text-red-600 mb-6">
              The church&apos;s subdomain ({church.slug}.faithinteractive.com)
              will become unavailable.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete Church"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
