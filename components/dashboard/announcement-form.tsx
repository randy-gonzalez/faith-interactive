/**
 * Announcement Form Component
 *
 * Reusable form for creating and editing announcements.
 * Handles both create and edit modes based on initialData.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Announcement } from "@prisma/client";

interface AnnouncementFormProps {
  initialData?: Announcement;
  canEdit: boolean;
}

export function AnnouncementForm({
  initialData,
  canEdit,
}: AnnouncementFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [title, setTitle] = useState(initialData?.title || "");
  const [body, setBody] = useState(initialData?.body || "");
  const [expiresAt, setExpiresAt] = useState(
    initialData?.expiresAt
      ? new Date(initialData.expiresAt).toISOString().split("T")[0]
      : ""
  );

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit) return;

    setError("");
    setFieldErrors({});
    setSaving(true);

    try {
      const url = isEditing
        ? `/api/announcements/${initialData.id}`
        : "/api/announcements";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          expiresAt: expiresAt || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details?.fieldErrors) {
          const errors: Record<string, string> = {};
          for (const [field, messages] of Object.entries(
            data.details.fieldErrors
          )) {
            errors[field] = (messages as string[])[0];
          }
          setFieldErrors(errors);
        } else {
          setError(data.error || "Failed to save announcement");
        }
        setSaving(false);
        return;
      }

      router.push("/announcements");
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!initialData || !canEdit) return;
    setPublishing(true);

    try {
      const action =
        initialData.status === "PUBLISHED" ? "unpublish" : "publish";
      const response = await fetch(`/api/announcements/${initialData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to update status");
        setPublishing(false);
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
    if (!initialData || !canEdit) return;
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/announcements/${initialData.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to delete announcement");
        setDeleting(false);
        return;
      }

      router.push("/announcements");
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <Input
        label="Title"
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        disabled={!canEdit}
        error={fieldErrors.title}
        placeholder="Announcement title"
      />

      <Textarea
        label="Message"
        name="body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        disabled={!canEdit}
        error={fieldErrors.body}
        placeholder="Announcement content..."
        rows={6}
      />

      <Input
        label="Expires On (optional)"
        name="expiresAt"
        type="date"
        value={expiresAt}
        onChange={(e) => setExpiresAt(e.target.value)}
        disabled={!canEdit}
        error={fieldErrors.expiresAt}
      />

      {canEdit && (
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <Button type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : isEditing
              ? "Save Changes"
              : "Create Announcement"}
          </Button>

          {isEditing && (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={handlePublish}
                disabled={publishing}
              >
                {publishing
                  ? "Updating..."
                  : initialData.status === "PUBLISHED"
                  ? "Unpublish"
                  : "Publish"}
              </Button>

              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </>
          )}

          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/announcements")}
          >
            Cancel
          </Button>
        </div>
      )}
    </form>
  );
}
