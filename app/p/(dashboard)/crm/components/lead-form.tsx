"use client";

/**
 * Lead Form Component
 *
 * Used for creating and editing leads.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createLead, updateLead } from "@/lib/crm/actions";
import { LEAD_SOURCES } from "@/lib/crm/schemas";

interface Stage {
  id: string;
  name: string;
}

interface CrmUser {
  id: string;
  name: string | null;
  email: string;
}

interface LeadFormProps {
  stages: Stage[];
  defaultStageId: string;
  currentUserId: string;
  crmUsers?: CrmUser[];
  existingLead?: {
    id: string;
    churchName: string;
    primaryContactName: string | null;
    email: string | null;
    phone: string | null;
    website: string | null;
    location: string | null;
    stageId: string;
    ownerUserId: string;
    source: string | null;
    notes: string | null;
  };
}

export function LeadForm({
  stages,
  defaultStageId,
  currentUserId,
  crmUsers,
  existingLead,
}: LeadFormProps) {
  const router = useRouter();
  const isEditing = !!existingLead;

  const [formData, setFormData] = useState({
    churchName: existingLead?.churchName || "",
    primaryContactName: existingLead?.primaryContactName || "",
    email: existingLead?.email || "",
    phone: existingLead?.phone || "",
    website: existingLead?.website || "",
    location: existingLead?.location || "",
    stageId: existingLead?.stageId || defaultStageId,
    ownerUserId: existingLead?.ownerUserId || currentUserId,
    source: existingLead?.source || "",
    notes: existingLead?.notes || "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isEditing) {
        const result = await updateLead(existingLead.id, {
          churchName: formData.churchName,
          primaryContactName: formData.primaryContactName || null,
          email: formData.email || null,
          phone: formData.phone || null,
          website: formData.website || null,
          location: formData.location || null,
          source: formData.source || null,
          notes: formData.notes || null,
        });
        if (!result.success) {
          setError(result.error || "Failed to update lead");
          setIsLoading(false);
          return;
        }
        router.push(`/crm/leads/${existingLead.id}`);
      } else {
        const result = await createLead({
          churchName: formData.churchName,
          primaryContactName: formData.primaryContactName || null,
          email: formData.email || null,
          phone: formData.phone || null,
          website: formData.website || null,
          location: formData.location || null,
          stageId: formData.stageId,
          ownerUserId: crmUsers ? formData.ownerUserId : undefined,
          source: formData.source || null,
          notes: formData.notes || null,
        });
        if (!result.success) {
          setError(result.error || "Failed to create lead");
          setIsLoading(false);
          return;
        }
        router.push(`/crm/leads/${result.lead.id}`);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Church Name */}
      <div>
        <label htmlFor="churchName" className="block text-sm font-medium text-gray-700">
          Church Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="churchName"
          name="churchName"
          value={formData.churchName}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Primary Contact */}
      <div>
        <label htmlFor="primaryContactName" className="block text-sm font-medium text-gray-700">
          Primary Contact Name
        </label>
        <input
          type="text"
          id="primaryContactName"
          name="primaryContactName"
          value={formData.primaryContactName}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Website & Location */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700">
            Website
          </label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="City, State"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Stage & Source */}
      <div className="grid grid-cols-2 gap-4">
        {!isEditing && (
          <div>
            <label htmlFor="stageId" className="block text-sm font-medium text-gray-700">
              Stage
            </label>
            <select
              id="stageId"
              name="stageId"
              value={formData.stageId}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className={isEditing ? "col-span-2" : ""}>
          <label htmlFor="source" className="block text-sm font-medium text-gray-700">
            Source
          </label>
          <select
            id="source"
            name="source"
            value={formData.source}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select source...</option>
            {LEAD_SOURCES.map((source) => (
              <option key={source} value={source}>
                {source.charAt(0).toUpperCase() + source.slice(1).replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Owner (FI_ADMIN only) */}
      {crmUsers && crmUsers.length > 0 && !isEditing && (
        <div>
          <label htmlFor="ownerUserId" className="block text-sm font-medium text-gray-700">
            Assign To
          </label>
          <select
            id="ownerUserId"
            name="ownerUserId"
            value={formData.ownerUserId}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {crmUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Create Lead"}
        </button>
      </div>
    </form>
  );
}
