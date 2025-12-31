/**
 * Event Form Component
 *
 * Reusable form for creating and editing events.
 * Handles both create and edit modes based on initialData.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Event } from "@prisma/client";

interface EventFormProps {
  initialData?: Event;
  canEdit: boolean;
}

function formatDateTimeLocal(date: Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  // Format as YYYY-MM-DDTHH:MM for datetime-local input
  return d.toISOString().slice(0, 16);
}

export function EventForm({ initialData, canEdit }: EventFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [startDate, setStartDate] = useState(
    formatDateTimeLocal(initialData?.startDate || null) ||
      new Date().toISOString().slice(0, 16)
  );
  const [endDate, setEndDate] = useState(
    formatDateTimeLocal(initialData?.endDate || null)
  );
  const [location, setLocation] = useState(initialData?.location || "");
  const [registrationUrl, setRegistrationUrl] = useState(
    initialData?.registrationUrl || ""
  );
  const [featuredImageUrl, setFeaturedImageUrl] = useState(
    initialData?.featuredImageUrl || ""
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
      const url = isEditing ? `/api/events/${initialData.id}` : "/api/events";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || null,
          startDate,
          endDate: endDate || null,
          location: location || null,
          registrationUrl: registrationUrl || null,
          featuredImageUrl: featuredImageUrl || null,
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
          setError(data.error || "Failed to save event");
        }
        setSaving(false);
        return;
      }

      router.push("/events");
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
      const response = await fetch(`/api/events/${initialData.id}`, {
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
    if (!confirm("Are you sure you want to delete this event?")) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/events/${initialData.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to delete event");
        setDeleting(false);
        return;
      }

      router.push("/events");
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
        placeholder="Event title"
      />

      <Textarea
        label="Description (optional)"
        name="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={!canEdit}
        error={fieldErrors.description}
        placeholder="Event details..."
        rows={4}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Start Date & Time"
          name="startDate"
          type="datetime-local"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
          disabled={!canEdit}
          error={fieldErrors.startDate}
        />

        <Input
          label="End Date & Time (optional)"
          name="endDate"
          type="datetime-local"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          disabled={!canEdit}
          error={fieldErrors.endDate}
        />
      </div>

      <Input
        label="Location (optional)"
        name="location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        disabled={!canEdit}
        error={fieldErrors.location}
        placeholder="Church Fellowship Hall"
      />

      <Input
        label="Registration URL (optional)"
        name="registrationUrl"
        type="url"
        value={registrationUrl}
        onChange={(e) => setRegistrationUrl(e.target.value)}
        disabled={!canEdit}
        error={fieldErrors.registrationUrl}
        placeholder="https://example.com/register"
      />

      <Input
        label="Featured Image URL (optional)"
        name="featuredImageUrl"
        type="url"
        value={featuredImageUrl}
        onChange={(e) => setFeaturedImageUrl(e.target.value)}
        disabled={!canEdit}
        error={fieldErrors.featuredImageUrl}
        placeholder="https://example.com/image.jpg"
      />

      {canEdit && (
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Event"}
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
            onClick={() => router.push("/events")}
          >
            Cancel
          </Button>
        </div>
      )}
    </form>
  );
}
