/**
 * Sermon Series Form Component
 *
 * Reusable form for creating and editing sermon series.
 * Handles both create and edit modes based on initialData.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SermonSeries } from "@prisma/client";

interface SermonSeriesFormProps {
  initialData?: SermonSeries;
  canEdit: boolean;
}

export function SermonSeriesForm({ initialData, canEdit }: SermonSeriesFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [artworkUrl, setArtworkUrl] = useState(initialData?.artworkUrl || "");
  const [startDate, setStartDate] = useState(
    initialData?.startDate
      ? new Date(initialData.startDate).toISOString().split("T")[0]
      : ""
  );
  const [endDate, setEndDate] = useState(
    initialData?.endDate
      ? new Date(initialData.endDate).toISOString().split("T")[0]
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
        ? `/api/sermon-series/${initialData.id}`
        : "/api/sermon-series";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || null,
          artworkUrl: artworkUrl || null,
          startDate: startDate || null,
          endDate: endDate || null,
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
          setError(data.error || "Failed to save series");
        }
        setSaving(false);
        return;
      }

      router.push("/sermon-series");
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
      const response = await fetch(`/api/sermon-series/${initialData.id}`, {
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
    if (!confirm("Are you sure you want to delete this series? Sermons in this series will be unlinked.")) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/sermon-series/${initialData.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to delete series");
        setDeleting(false);
        return;
      }

      router.push("/sermon-series");
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
        label="Series Name"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={!canEdit}
        error={fieldErrors.name}
        placeholder="The Gospel of John"
      />

      <Textarea
        label="Description (optional)"
        name="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={!canEdit}
        error={fieldErrors.description}
        placeholder="A multi-week study through the Gospel of John..."
        rows={4}
      />

      <Input
        label="Artwork URL (optional)"
        name="artworkUrl"
        type="url"
        value={artworkUrl}
        onChange={(e) => setArtworkUrl(e.target.value)}
        disabled={!canEdit}
        error={fieldErrors.artworkUrl}
        placeholder="https://example.com/series-artwork.jpg"
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Start Date (optional)"
          name="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          disabled={!canEdit}
          error={fieldErrors.startDate}
        />

        <Input
          label="End Date (optional)"
          name="endDate"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          disabled={!canEdit}
          error={fieldErrors.endDate}
        />
      </div>

      {canEdit && (
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <Button type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : isEditing
              ? "Save Changes"
              : "Create Series"}
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
            onClick={() => router.push("/sermon-series")}
          >
            Cancel
          </Button>
        </div>
      )}
    </form>
  );
}
