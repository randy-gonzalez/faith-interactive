"use client";

/**
 * Church Form Component
 *
 * Form for creating and editing churches.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ChurchFormProps {
  church?: {
    id: string;
    name: string;
    slug: string;
    primaryContactEmail: string | null;
    status: string;
  };
}

export function ChurchForm({ church }: ChurchFormProps) {
  const router = useRouter();
  const isEditing = !!church;

  const [formData, setFormData] = useState({
    name: church?.name || "",
    slug: church?.slug || "",
    primaryContactEmail: church?.primaryContactEmail || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate slug from name
  function handleNameChange(name: string) {
    setFormData((prev) => ({
      ...prev,
      name,
      // Only auto-generate slug if not editing and slug hasn't been manually changed
      ...(!isEditing && prev.slug === generateSlug(prev.name)
        ? { slug: generateSlug(name) }
        : {}),
    }));
  }

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = isEditing
        ? `/api/platform/churches/${church.id}`
        : "/api/platform/churches";

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          primaryContactEmail: formData.primaryContactEmail || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save church");
      }

      // Redirect to church detail page
      router.push(`/platform/churches/${data.church.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Church Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Grace Community Church"
        />
      </div>

      {/* Slug */}
      <div>
        <label
          htmlFor="slug"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Subdomain Slug *
        </label>
        <div className="flex items-center">
          <input
            type="text"
            id="slug"
            value={formData.slug}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
              }))
            }
            required
            pattern="^[a-z0-9-]+$"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="grace-community"
          />
          <span className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-500 text-sm">
            .faithinteractive.com
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Lowercase letters, numbers, and hyphens only
        </p>
        {isEditing && (
          <p className="mt-1 text-sm text-yellow-600">
            Warning: Changing the slug will change the church&apos;s URL
          </p>
        )}
      </div>

      {/* Primary Contact Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Primary Contact Email
        </label>
        <input
          type="email"
          id="email"
          value={formData.primaryContactEmail}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              primaryContactEmail: e.target.value,
            }))
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="admin@church.org"
        />
        <p className="mt-1 text-sm text-gray-500">
          Optional. Used for platform communications.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : isEditing
              ? "Update Church"
              : "Create Church"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 text-gray-600 hover:text-gray-900"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
