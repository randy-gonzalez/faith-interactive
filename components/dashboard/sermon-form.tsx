/**
 * Sermon Form Component
 *
 * Reusable form for creating and editing sermons.
 * Handles both create and edit modes based on initialData.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Sermon } from "@prisma/client";

interface SermonFormProps {
  initialData?: Sermon;
  canEdit: boolean;
}

export function SermonForm({ initialData, canEdit }: SermonFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [title, setTitle] = useState(initialData?.title || "");
  const [speaker, setSpeaker] = useState(initialData?.speaker || "");
  const [date, setDate] = useState(
    initialData?.date
      ? new Date(initialData.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || "");
  const [audioUrl, setAudioUrl] = useState(initialData?.audioUrl || "");
  const [scripture, setScripture] = useState(initialData?.scripture || "");

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
      const url = isEditing ? `/api/sermons/${initialData.id}` : "/api/sermons";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          speaker,
          date,
          description: description || null,
          videoUrl: videoUrl || null,
          audioUrl: audioUrl || null,
          scripture: scripture || null,
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
          setError(data.error || "Failed to save sermon");
        }
        setSaving(false);
        return;
      }

      router.push("/sermons");
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
      const response = await fetch(`/api/sermons/${initialData.id}`, {
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
    if (!confirm("Are you sure you want to delete this sermon?")) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/sermons/${initialData.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to delete sermon");
        setDeleting(false);
        return;
      }

      router.push("/sermons");
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md">
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
        placeholder="Sermon title"
      />

      <Input
        label="Speaker"
        name="speaker"
        value={speaker}
        onChange={(e) => setSpeaker(e.target.value)}
        required
        disabled={!canEdit}
        error={fieldErrors.speaker}
        placeholder="Pastor John Smith"
      />

      <Input
        label="Date"
        name="date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
        disabled={!canEdit}
        error={fieldErrors.date}
      />

      <Input
        label="Scripture Reference (optional)"
        name="scripture"
        value={scripture}
        onChange={(e) => setScripture(e.target.value)}
        disabled={!canEdit}
        error={fieldErrors.scripture}
        placeholder="John 3:16"
      />

      <Textarea
        label="Description (optional)"
        name="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={!canEdit}
        error={fieldErrors.description}
        placeholder="Brief description of the sermon..."
        rows={3}
      />

      <Input
        label="Video URL (optional)"
        name="videoUrl"
        type="url"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        disabled={!canEdit}
        error={fieldErrors.videoUrl}
        placeholder="https://youtube.com/watch?v=..."
      />

      <Input
        label="Audio URL (optional)"
        name="audioUrl"
        type="url"
        value={audioUrl}
        onChange={(e) => setAudioUrl(e.target.value)}
        disabled={!canEdit}
        error={fieldErrors.audioUrl}
        placeholder="https://example.com/sermon.mp3"
      />

      {canEdit && (
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Sermon"}
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
            onClick={() => router.push("/sermons")}
          >
            Cancel
          </Button>
        </div>
      )}
    </form>
  );
}
