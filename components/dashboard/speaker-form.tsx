/**
 * Speaker Form Component
 *
 * Reusable form for creating and editing speakers.
 * Handles both create and edit modes based on initialData.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Speaker } from "@prisma/client";

interface SpeakerFormProps {
  initialData?: Speaker;
  canEdit: boolean;
}

export function SpeakerForm({ initialData, canEdit }: SpeakerFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [name, setName] = useState(initialData?.name || "");
  const [title, setTitle] = useState(initialData?.title || "");
  const [bio, setBio] = useState(initialData?.bio || "");
  const [photoUrl, setPhotoUrl] = useState(initialData?.photoUrl || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [isGuest, setIsGuest] = useState(initialData?.isGuest || false);

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
        ? `/api/speakers/${initialData.id}`
        : "/api/speakers";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          title: title || null,
          bio: bio || null,
          photoUrl: photoUrl || null,
          email: email || null,
          isGuest,
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
          setError(data.error || "Failed to save speaker");
        }
        setSaving(false);
        return;
      }

      router.push("/admin/speakers");
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
      const response = await fetch(`/api/speakers/${initialData.id}`, {
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
    if (!confirm("Are you sure you want to delete this speaker?")) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/speakers/${initialData.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to delete speaker");
        setDeleting(false);
        return;
      }

      router.push("/admin/speakers");
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
        label="Name"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={!canEdit}
        error={fieldErrors.name}
        placeholder="Pastor John Smith"
      />

      <Input
        label="Title/Role (optional)"
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={!canEdit}
        error={fieldErrors.title}
        placeholder="Senior Pastor"
      />

      <Textarea
        label="Bio (optional)"
        name="bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        disabled={!canEdit}
        error={fieldErrors.bio}
        placeholder="Brief biography..."
        rows={4}
      />

      <Input
        label="Photo URL (optional)"
        name="photoUrl"
        type="url"
        value={photoUrl}
        onChange={(e) => setPhotoUrl(e.target.value)}
        disabled={!canEdit}
        error={fieldErrors.photoUrl}
        placeholder="https://example.com/photo.jpg"
      />

      <Input
        label="Email (optional)"
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={!canEdit}
        error={fieldErrors.email}
        placeholder="pastor@church.org"
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isGuest"
          checked={isGuest}
          onChange={(e) => setIsGuest(e.target.checked)}
          disabled={!canEdit}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label
          htmlFor="isGuest"
          className="text-sm text-gray-700"
        >
          Guest Speaker
        </label>
      </div>

      {canEdit && (
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <Button type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : isEditing
              ? "Save Changes"
              : "Create Speaker"}
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
            onClick={() => router.push("/admin/speakers")}
          >
            Cancel
          </Button>
        </div>
      )}
    </form>
  );
}
