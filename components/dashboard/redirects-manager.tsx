"use client";

/**
 * Redirects Manager Component
 *
 * Client component for managing redirect rules.
 * Handles add, edit, toggle, and remove operations.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RedirectRule {
  id: string;
  sourcePath: string;
  destinationUrl: string;
  isActive: boolean;
  createdAt: Date;
}

interface RedirectsManagerProps {
  initialRedirects: RedirectRule[];
}

export function RedirectsManager({ initialRedirects }: RedirectsManagerProps) {
  const [redirects, setRedirects] = useState(initialRedirects);
  const [sourcePath, setSourcePath] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSource, setEditSource] = useState("");
  const [editDestination, setEditDestination] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError(null);

    try {
      const response = await fetch("/api/redirects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourcePath, destinationUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to add redirect");
        return;
      }

      setRedirects([...redirects, data.redirect].sort((a, b) =>
        a.sourcePath.localeCompare(b.sourcePath)
      ));
      setSourcePath("");
      setDestinationUrl("");
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/redirects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        const data = await response.json();
        setRedirects(redirects.map((r) =>
          r.id === id ? data.redirect : r
        ));
      }
    } catch (err) {
      setError("Failed to update redirect.");
    }
  };

  const handleEdit = async (id: string) => {
    setError(null);

    try {
      const response = await fetch(`/api/redirects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourcePath: editSource,
          destinationUrl: editDestination,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update redirect");
        return;
      }

      setRedirects(redirects.map((r) =>
        r.id === id ? data.redirect : r
      ).sort((a, b) => a.sourcePath.localeCompare(b.sourcePath)));
      setEditingId(null);
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this redirect?")) {
      return;
    }

    try {
      const response = await fetch(`/api/redirects/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setRedirects(redirects.filter((r) => r.id !== id));
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete redirect");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  const startEdit = (redirect: RedirectRule) => {
    setEditingId(redirect.id);
    setEditSource(redirect.sourcePath);
    setEditDestination(redirect.destinationUrl);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditSource("");
    setEditDestination("");
  };

  return (
    <div className="space-y-6">
      {/* Add Redirect Form */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Add Redirect
        </h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                From Path
              </label>
              <Input
                type="text"
                placeholder="/old-page"
                value={sourcePath}
                onChange={(e) => setSourcePath(e.target.value)}
                disabled={adding}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                The path visitors will be redirected from
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                To URL
              </label>
              <Input
                type="text"
                placeholder="/new-page or https://example.com"
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
                disabled={adding}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                The destination URL or path
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={adding || !sourcePath.trim() || !destinationUrl.trim()}
            >
              {adding ? "Adding..." : "Add Redirect"}
            </Button>
          </div>
        </form>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Existing Redirects */}
      {redirects.length > 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  From
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {redirects.map((redirect) => (
                <tr key={redirect.id}>
                  {editingId === redirect.id ? (
                    <>
                      <td className="px-6 py-4">
                        <Input
                          type="text"
                          value={editSource}
                          onChange={(e) => setEditSource(e.target.value)}
                          className="w-full"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Input
                          type="text"
                          value={editDestination}
                          onChange={(e) => setEditDestination(e.target.value)}
                          className="w-full"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">-</span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleEdit(redirect.id)}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </Button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4">
                        <div className="text-sm font-mono text-gray-900 dark:text-white">
                          {redirect.sourcePath}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-mono text-gray-600 dark:text-gray-400 break-all">
                          {redirect.destinationUrl}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggle(redirect.id, redirect.isActive)}
                          className={`
                            inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                            ${redirect.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }
                          `}
                        >
                          {redirect.isActive ? "Active" : "Disabled"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(redirect)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(redirect.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No redirects configured yet. Add your first redirect above.
          </p>
        </div>
      )}
    </div>
  );
}
