/**
 * Event Form Component
 *
 * Reusable form for creating and editing events.
 * Handles both create and edit modes based on initialData.
 * Supports venues, media picker, recurrence, and registration settings.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MediaPicker } from "@/components/dashboard/media-picker";
import { VenueSelector } from "@/components/dashboard/venue-selector";
import { RecurrenceEditor } from "@/components/dashboard/recurrence-editor";
import type { Event, Venue, RecurrenceFrequency } from "@prisma/client";

interface EventWithVenue extends Event {
  venue?: Venue | null;
  _count?: { registrations: number };
}

interface EventFormProps {
  initialData?: EventWithVenue;
  canEdit: boolean;
}

function formatDateTimeLocal(date: Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().slice(0, 16);
}

export function EventForm({ initialData, canEdit }: EventFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  // Basic fields
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [startDate, setStartDate] = useState(
    formatDateTimeLocal(initialData?.startDate || null) ||
      new Date().toISOString().slice(0, 16)
  );
  const [endDate, setEndDate] = useState(
    formatDateTimeLocal(initialData?.endDate || null)
  );

  // Venue/Location
  const [venueId, setVenueId] = useState<string | null>(initialData?.venueId || null);
  const [location, setLocation] = useState(initialData?.location || "");

  // Featured image
  const [featuredImageUrl, setFeaturedImageUrl] = useState(
    initialData?.featuredImageUrl || ""
  );
  const [featuredMediaId, setFeaturedMediaId] = useState<string | undefined>(
    initialData?.featuredMediaId || undefined
  );

  // External registration (legacy)
  const [registrationUrl, setRegistrationUrl] = useState(
    initialData?.registrationUrl || ""
  );

  // Built-in registration settings
  const [registrationEnabled, setRegistrationEnabled] = useState(
    initialData?.registrationEnabled || false
  );
  const [capacity, setCapacity] = useState<string>(
    initialData?.capacity?.toString() || ""
  );
  const [waitlistEnabled, setWaitlistEnabled] = useState(
    initialData?.waitlistEnabled || false
  );
  const [registrationDeadline, setRegistrationDeadline] = useState(
    formatDateTimeLocal(initialData?.registrationDeadline || null)
  );

  // Recurrence
  const [recurrence, setRecurrence] = useState<{
    isRecurring: boolean;
    recurrenceFrequency: RecurrenceFrequency | null;
    recurrenceInterval: number | null;
    recurrenceDaysOfWeek: number | null;
    recurrenceDayOfMonth: number | null;
    recurrenceEndDate: string | null;
    recurrenceCount: number | null;
  }>({
    isRecurring: initialData?.isRecurring || false,
    recurrenceFrequency: initialData?.recurrenceFrequency || null,
    recurrenceInterval: initialData?.recurrenceInterval || null,
    recurrenceDaysOfWeek: initialData?.recurrenceDaysOfWeek || null,
    recurrenceDayOfMonth: initialData?.recurrenceDayOfMonth || null,
    recurrenceEndDate: initialData?.recurrenceEndDate
      ? initialData.recurrenceEndDate.toISOString()
      : null,
    recurrenceCount: initialData?.recurrenceCount || null,
  });

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
          venueId: venueId || null,
          location: location || null,
          registrationUrl: registrationUrl || null,
          featuredImageUrl: featuredImageUrl || null,
          featuredMediaId: featuredMediaId || null,
          // Registration settings
          registrationEnabled,
          capacity: capacity ? parseInt(capacity, 10) : null,
          waitlistEnabled,
          registrationDeadline: registrationDeadline || null,
          // Recurrence
          ...recurrence,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details?.fieldErrors) {
          const errors: Record<string, string> = {};
          for (const [field, messages] of Object.entries(data.details.fieldErrors)) {
            errors[field] = (messages as string[])[0];
          }
          setFieldErrors(errors);
        } else {
          setError(data.error || "Failed to save event");
        }
        setSaving(false);
        return;
      }

      router.push("/admin/events");
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
      const action = initialData.status === "PUBLISHED" ? "unpublish" : "publish";
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

      router.push("/admin/events");
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
      setDeleting(false);
    }
  }

  const registrationCount = initialData?._count?.registrations || 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      {/* Basic Info Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Event Details
        </h3>

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

        <VenueSelector
          venueId={venueId}
          customLocation={location}
          onVenueChange={setVenueId}
          onLocationChange={setLocation}
          disabled={!canEdit}
          error={fieldErrors.location || fieldErrors.venueId}
        />

        <MediaPicker
          label="Featured Image (optional)"
          value={featuredImageUrl}
          onChange={(url, mediaId) => {
            setFeaturedImageUrl(url || "");
            setFeaturedMediaId(mediaId);
          }}
          disabled={!canEdit}
          error={fieldErrors.featuredImageUrl}
        />
      </div>

      {/* Registration Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Registration
        </h3>

        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={registrationEnabled}
              onChange={(e) => setRegistrationEnabled(e.target.checked)}
              disabled={!canEdit}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          <span className="text-sm font-medium text-gray-900">
            Enable built-in registration
          </span>
        </div>

        {registrationEnabled && (
          <div className="pl-14 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Capacity (leave empty for unlimited)"
                name="capacity"
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                disabled={!canEdit}
                error={fieldErrors.capacity}
                placeholder="100"
              />

              <Input
                label="Registration Deadline (optional)"
                name="registrationDeadline"
                type="datetime-local"
                value={registrationDeadline}
                onChange={(e) => setRegistrationDeadline(e.target.value)}
                disabled={!canEdit}
                error={fieldErrors.registrationDeadline}
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={waitlistEnabled}
                  onChange={(e) => setWaitlistEnabled(e.target.checked)}
                  disabled={!canEdit || !capacity}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
              </label>
              <span className="text-sm text-gray-700">
                Enable waitlist when full
                {!capacity && (
                  <span className="text-gray-400 ml-1">(requires capacity limit)</span>
                )}
              </span>
            </div>

            {isEditing && registrationCount > 0 && (
              <div className="bg-blue-50 text-blue-700 rounded-md p-3 flex items-center justify-between">
                <span>
                  {registrationCount} registration{registrationCount !== 1 ? "s" : ""}
                </span>
                <Link
                  href={`/admin/events/${initialData.id}/registrations`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  View registrations
                </Link>
              </div>
            )}
          </div>
        )}

        {!registrationEnabled && (
          <Input
            label="External Registration URL (optional)"
            name="registrationUrl"
            type="url"
            value={registrationUrl}
            onChange={(e) => setRegistrationUrl(e.target.value)}
            disabled={!canEdit}
            error={fieldErrors.registrationUrl}
            placeholder="https://example.com/register"
          />
        )}
      </div>

      {/* Recurrence Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Recurrence
        </h3>

        <RecurrenceEditor
          values={recurrence}
          onChange={setRecurrence}
          disabled={!canEdit}
        />
      </div>

      {/* Actions */}
      {canEdit && (
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
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
            onClick={() => router.push("/admin/events")}
          >
            Cancel
          </Button>
        </div>
      )}
    </form>
  );
}
