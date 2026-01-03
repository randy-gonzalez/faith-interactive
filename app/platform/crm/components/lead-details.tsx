"use client";

/**
 * Lead Details Component
 *
 * Editable lead information fields.
 */

import { useState } from "react";
import { updateLead } from "@/lib/crm/actions";
import type { LeadWithDetails } from "@/lib/crm/queries";

interface Stage {
  id: string;
  name: string;
}

interface LeadDetailsProps {
  lead: LeadWithDetails;
  stages: Stage[];
  currentUserId: string;
}

export function LeadDetails({ lead, stages, currentUserId }: LeadDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    churchName: lead.churchName,
    primaryContactName: lead.primaryContactName || "",
    email: lead.email || "",
    phone: lead.phone || "",
    website: lead.website || "",
    location: lead.location || "",
    source: lead.source || "",
    notes: lead.notes || "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    setIsLoading(true);
    setError(null);

    try {
      const result = await updateLead(lead.id, {
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
        setError(result.error || "Failed to save");
      } else {
        setIsEditing(false);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    }

    setIsLoading(false);
  }

  function handleCancel() {
    setFormData({
      churchName: lead.churchName,
      primaryContactName: lead.primaryContactName || "",
      email: lead.email || "",
      phone: lead.phone || "",
      website: lead.website || "",
      location: lead.location || "",
      source: lead.source || "",
      notes: lead.notes || "",
    });
    setIsEditing(false);
    setError(null);
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-medium text-gray-900">Lead Details</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            Edit
          </button>
        )}
      </div>

      <div className="p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            {error}
          </div>
        )}

        {isEditing ? (
          <div className="space-y-4">
            {/* Church Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Church Name
              </label>
              <input
                type="text"
                name="churchName"
                value={formData.churchName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Contact & Email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  name="primaryContactName"
                  value={formData.primaryContactName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Phone & Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, State"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-2">
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="text-sm text-gray-600 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <dl className="space-y-4">
            {/* Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">Contact Name</dt>
                <dd className="text-sm text-gray-900">
                  {lead.primaryContactName || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Email</dt>
                <dd className="text-sm text-gray-900">
                  {lead.email ? (
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      {lead.email}
                    </a>
                  ) : (
                    "-"
                  )}
                </dd>
              </div>
            </div>

            {/* Phone & Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">Phone</dt>
                <dd className="text-sm text-gray-900">
                  {lead.phone ? (
                    <a
                      href={`tel:${lead.phone}`}
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      {lead.phone}
                    </a>
                  ) : (
                    "-"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Location</dt>
                <dd className="text-sm text-gray-900">{lead.location || "-"}</dd>
              </div>
            </div>

            {/* Website */}
            <div>
              <dt className="text-sm text-gray-500">Website</dt>
              <dd className="text-sm text-gray-900">
                {lead.website ? (
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    {lead.website}
                  </a>
                ) : (
                  "-"
                )}
              </dd>
            </div>

            {/* Notes */}
            <div>
              <dt className="text-sm text-gray-500">Notes</dt>
              <dd className="text-sm text-gray-900 whitespace-pre-wrap">
                {lead.notes || "-"}
              </dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}
