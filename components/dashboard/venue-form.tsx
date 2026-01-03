/**
 * Venue Form Component
 *
 * Reusable form for creating and editing venues.
 * Handles both create and edit modes based on initialData.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Venue } from "@prisma/client";

interface VenueFormProps {
  initialData?: Venue;
  canEdit: boolean;
}

export function VenueForm({ initialData, canEdit }: VenueFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [name, setName] = useState(initialData?.name || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [city, setCity] = useState(initialData?.city || "");
  const [state, setState] = useState(initialData?.state || "");
  const [zipCode, setZipCode] = useState(initialData?.zipCode || "");
  const [capacity, setCapacity] = useState<string>(
    initialData?.capacity?.toString() || ""
  );
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [sortOrder, setSortOrder] = useState<string>(
    initialData?.sortOrder?.toString() || "0"
  );

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit) return;

    setError("");
    setFieldErrors({});
    setSaving(true);

    try {
      const url = isEditing ? `/api/venues/${initialData.id}` : "/api/venues";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          address: address || null,
          city: city || null,
          state: state || null,
          zipCode: zipCode || null,
          capacity: capacity ? parseInt(capacity, 10) : null,
          notes: notes || null,
          sortOrder: sortOrder ? parseInt(sortOrder, 10) : 0,
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
          setError(data.error || "Failed to save venue");
        }
        setSaving(false);
        return;
      }

      router.push("/venues");
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!initialData || !canEdit) return;
    if (!confirm("Are you sure you want to delete this venue?")) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/venues/${initialData.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to delete venue");
        setDeleting(false);
        return;
      }

      router.push("/venues");
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
        label="Venue Name"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={!canEdit}
        error={fieldErrors.name}
        placeholder="Main Sanctuary"
      />

      <Input
        label="Street Address (optional)"
        name="address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        disabled={!canEdit}
        error={fieldErrors.address}
        placeholder="123 Church Street"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="City"
          name="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          disabled={!canEdit}
          error={fieldErrors.city}
          placeholder="Springfield"
        />

        <Input
          label="State"
          name="state"
          value={state}
          onChange={(e) => setState(e.target.value)}
          disabled={!canEdit}
          error={fieldErrors.state}
          placeholder="CA"
        />

        <Input
          label="Zip Code"
          name="zipCode"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          disabled={!canEdit}
          error={fieldErrors.zipCode}
          placeholder="12345"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Capacity (optional)"
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
          label="Sort Order"
          name="sortOrder"
          type="number"
          min="0"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          disabled={!canEdit}
          error={fieldErrors.sortOrder}
          placeholder="0"
        />
      </div>

      <Textarea
        label="Notes (optional)"
        name="notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        disabled={!canEdit}
        error={fieldErrors.notes}
        placeholder="Parking available in rear lot. Wheelchair accessible."
        rows={4}
      />

      {canEdit && (
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Venue"}
          </Button>

          {isEditing && (
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/venues")}
          >
            Cancel
          </Button>
        </div>
      )}
    </form>
  );
}
