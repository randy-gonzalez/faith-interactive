"use client";

/**
 * Lead DNC Component
 *
 * Shows and manages Do Not Contact status.
 */

import { useState } from "react";
import { setDnc, clearDnc } from "@/lib/crm/actions";
import type { LeadWithDetails } from "@/lib/crm/queries";

interface LeadDncProps {
  lead: LeadWithDetails;
}

export function LeadDnc({ lead }: LeadDncProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState(lead.dnc?.reason || "");
  const [showReasonInput, setShowReasonInput] = useState(false);

  const isDnc = !!lead.dnc;

  async function handleSetDnc() {
    setIsLoading(true);
    try {
      await setDnc(lead.id, { reason: reason || null });
      setShowReasonInput(false);
    } catch (error) {
      console.error("Failed to set DNC:", error);
    }
    setIsLoading(false);
  }

  async function handleClearDnc() {
    setIsLoading(true);
    try {
      await clearDnc(lead.id);
      setReason("");
    } catch (error) {
      console.error("Failed to clear DNC:", error);
    }
    setIsLoading(false);
  }

  return (
    <div className={`rounded-lg border p-4 ${isDnc ? "bg-red-50 border-red-200" : "bg-white border-gray-200"}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-900">
          DNC Status
        </h3>
        <span className="text-xs text-gray-500">Do Not Contact</span>
      </div>

      {isDnc ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
              Active
            </span>
            <span className="text-sm text-gray-500">
              Added {new Date(lead.dnc!.addedAt).toLocaleDateString()}
            </span>
          </div>

          {lead.dnc?.reason && (
            <div>
              <p className="text-sm text-gray-500">Reason:</p>
              <p className="text-sm text-gray-700">{lead.dnc.reason}</p>
            </div>
          )}

          <div className="text-sm text-gray-500">
            Added by: {lead.dnc!.addedBy.name || lead.dnc!.addedBy.email}
          </div>

          <button
            onClick={handleClearDnc}
            disabled={isLoading}
            className="w-full px-3 py-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 disabled:opacity-50"
          >
            {isLoading ? "Removing..." : "Remove DNC Status"}
          </button>
        </div>
      ) : showReasonInput ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Reason (optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="Why should this lead not be contacted?"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSetDnc}
              disabled={isLoading}
              className="flex-1 px-3 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Mark as DNC"}
            </button>
            <button
              onClick={() => {
                setShowReasonInput(false);
                setReason("");
              }}
              disabled={isLoading}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            This lead can be contacted normally.
          </p>
          <button
            onClick={() => setShowReasonInput(true)}
            className="w-full px-3 py-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
          >
            Mark as Do Not Contact
          </button>
        </div>
      )}
    </div>
  );
}
