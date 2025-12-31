"use client";

/**
 * Page Form Component
 *
 * Shared form for creating and editing pages.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { ContentStatus } from "@prisma/client";

interface PageFormProps {
  initialData?: {
    id: string;
    title: string;
    body: string;
    urlPath: string | null;
    featuredImageUrl: string | null;
    status: ContentStatus;
  };
  canEdit: boolean;
}

export function PageForm({ initialData, canEdit }: PageFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [title, setTitle] = useState(initialData?.title || "");
  const [body, setBody] = useState(initialData?.body || "");
  const [urlPath, setUrlPath] = useState(initialData?.urlPath || "");
  const [featuredImageUrl, setFeaturedImageUrl] = useState(
    initialData?.featuredImageUrl || ""
  );

  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit) return;

    setSaving(true);
    setError("");

    try {
      const url = isEditing ? `/api/pages/${initialData.id}` : "/api/pages";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          urlPath: urlPath || null,
          featuredImageUrl: featuredImageUrl || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Failed to save page");
        setSaving(false);
        return;
      }

      // Redirect to list or stay on edit page
      if (!isEditing) {
        router.push(`/pages/${data.data.page.id}/edit`);
      }
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublishToggle() {
    if (!canEdit || !initialData) return;

    setPublishing(true);
    setError("");

    const action = initialData.status === "PUBLISHED" ? "unpublish" : "publish";

    try {
      const response = await fetch(`/api/pages/${initialData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || `Failed to ${action} page`);
        return;
      }

      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setPublishing(false);
    }
  }

  async function handleDelete() {
    if (!canEdit || !initialData) return;
    if (!confirm("Are you sure you want to delete this page?")) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/pages/${initialData.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Failed to delete page");
        setDeleting(false);
        return;
      }

      router.push("/pages");
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        disabled={!canEdit}
        placeholder="Page title"
      />

      <Textarea
        label="Content"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        disabled={!canEdit}
        placeholder="Page content (HTML supported)"
        className="min-h-[200px] font-mono text-sm"
      />

      <Input
        label="URL Path (optional)"
        value={urlPath}
        onChange={(e) => setUrlPath(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
        disabled={!canEdit}
        placeholder="about-us"
      />

      <Input
        label="Featured Image URL (optional)"
        value={featuredImageUrl}
        onChange={(e) => setFeaturedImageUrl(e.target.value)}
        disabled={!canEdit}
        placeholder="https://example.com/image.jpg"
        type="url"
      />

      {/* Actions */}
      {canEdit && (
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Button type="submit" isLoading={saving}>
            {isEditing ? "Save Changes" : "Create Page"}
          </Button>

          {isEditing && (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={handlePublishToggle}
                isLoading={publishing}
              >
                {initialData.status === "PUBLISHED" ? "Unpublish" : "Publish"}
              </Button>

              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                isLoading={deleting}
              >
                Delete
              </Button>
            </>
          )}

          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/pages")}
          >
            Cancel
          </Button>
        </div>
      )}
    </form>
  );
}
