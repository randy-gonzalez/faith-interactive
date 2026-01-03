"use client";

/**
 * Form Submissions Component
 *
 * Displays and manages form submissions with pagination,
 * read/unread status, and delete functionality.
 */

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface Submission {
  id: string;
  data: Record<string, unknown>;
  files: unknown[] | null;
  submittedAt: string;
  isRead: boolean;
  readAt: string | null;
}

interface FormSubmissionsProps {
  formId: string;
  canEdit: boolean;
}

export function FormSubmissions({ formId, canEdit }: FormSubmissionsProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<"all" | "read" | "unread">("all");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      const response = await fetch(`/api/forms/${formId}/submissions?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load submissions");
      }

      setSubmissions(data.data.submissions);
      setTotalPages(data.data.pagination.totalPages);
      setTotal(data.data.pagination.total);
      setUnreadCount(data.data.unreadCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }, [formId, page, statusFilter]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleMarkRead = async (submissionId: string, isRead: boolean) => {
    setActionLoading(submissionId);
    try {
      const response = await fetch(
        `/api/forms/${formId}/submissions/${submissionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isRead }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update submission");
      }

      // Update local state
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === submissionId ? { ...s, isRead, readAt: isRead ? new Date().toISOString() : null } : s
        )
      );
      setUnreadCount((prev) => (isRead ? prev - 1 : prev + 1));

      if (selectedSubmission?.id === submissionId) {
        setSelectedSubmission({ ...selectedSubmission, isRead, readAt: isRead ? new Date().toISOString() : null });
      }
    } catch (err) {
      console.error("Failed to mark submission:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (submissionId: string) => {
    if (!confirm("Are you sure you want to delete this submission?")) return;

    setActionLoading(submissionId);
    try {
      const response = await fetch(
        `/api/forms/${formId}/submissions/${submissionId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Failed to delete submission");
      }

      // Remove from local state
      const deletedSubmission = submissions.find((s) => s.id === submissionId);
      setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
      setTotal((prev) => prev - 1);
      if (deletedSubmission && !deletedSubmission.isRead) {
        setUnreadCount((prev) => prev - 1);
      }

      if (selectedSubmission?.id === submissionId) {
        setSelectedSubmission(null);
      }
    } catch (err) {
      console.error("Failed to delete submission:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      const response = await fetch(
        `/api/forms/${formId}/submissions/export?${params}`
      );

      if (!response.ok) {
        throw new Error("Failed to export submissions");
      }

      // Download the CSV
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `submissions-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to export:", err);
      alert("Failed to export submissions");
    }
  };

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined || value === "") return "—";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (Array.isArray(value)) return value.join(", ");
    return String(value);
  };

  if (loading && submissions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Loading submissions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        {error}
        <button
          onClick={fetchSubmissions}
          className="block mx-auto mt-2 text-blue-600 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filters and export */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as typeof statusFilter);
                setPage(1);
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All ({total})</option>
              <option value="unread">Unread ({unreadCount})</option>
              <option value="read">Read ({total - unreadCount})</option>
            </select>
          </div>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={total === 0}>
          Export CSV
        </Button>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {statusFilter === "all"
            ? "No submissions yet"
            : `No ${statusFilter} submissions`}
        </div>
      ) : (
        <>
          {/* Submissions table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Submitted
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Preview
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {submissions.map((submission) => {
                  const previewKeys = Object.keys(submission.data).slice(0, 2);
                  return (
                    <tr
                      key={submission.id}
                      className={`hover:bg-gray-50 cursor-pointer ${
                        !submission.isRead ? "bg-blue-50/50" : ""
                      }`}
                      onClick={() => setSelectedSubmission(submission)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        {submission.isRead ? (
                          <span className="text-gray-400 text-sm">Read</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-blue-600 text-sm font-medium">
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            Unread
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {new Date(submission.submittedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {previewKeys.map((key) => (
                          <span key={key} className="mr-4">
                            <span className="text-gray-500">{key}:</span>{" "}
                            {formatValue(submission.data[key]).substring(0, 50)}
                            {String(formatValue(submission.data[key])).length > 50 && "..."}
                          </span>
                        ))}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSubmission(submission);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {(page - 1) * 20 + 1} - {Math.min(page * 20, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Submission detail modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Submission Details
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(selectedSubmission.submittedAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-4 overflow-y-auto flex-1">
              <dl className="space-y-4">
                {Object.entries(selectedSubmission.data).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-sm font-medium text-gray-500 capitalize">
                      {key.replace(/_/g, " ")}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                      {formatValue(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                {selectedSubmission.isRead ? (
                  <Button
                    variant="outline"
                    onClick={() => handleMarkRead(selectedSubmission.id, false)}
                    disabled={actionLoading === selectedSubmission.id}
                  >
                    Mark Unread
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => handleMarkRead(selectedSubmission.id, true)}
                    disabled={actionLoading === selectedSubmission.id}
                  >
                    Mark Read
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-3">
                {canEdit && (
                  <button
                    onClick={() => handleDelete(selectedSubmission.id)}
                    disabled={actionLoading === selectedSubmission.id}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                )}
                <Button onClick={() => setSelectedSubmission(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
