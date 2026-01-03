"use client";

/**
 * Lead Header Component
 *
 * Shows church name, stage dropdown, and owner (with reassign for FI_ADMIN).
 */

import { useState } from "react";
import { changeLeadStage, reassignLeadOwner } from "@/lib/crm/actions";
import type { LeadWithDetails } from "@/lib/crm/queries";

interface Stage {
  id: string;
  name: string;
}

interface CrmUser {
  id: string;
  name: string | null;
  email: string;
}

interface LeadHeaderProps {
  lead: LeadWithDetails;
  stages: Stage[];
  crmUsers?: CrmUser[];
}

export function LeadHeader({ lead, stages, crmUsers }: LeadHeaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isDnc = !!lead.dnc;

  async function handleStageChange(stageId: string) {
    setIsLoading(true);
    try {
      await changeLeadStage(lead.id, stageId);
    } catch (error) {
      console.error("Failed to change stage:", error);
    }
    setIsLoading(false);
  }

  async function handleOwnerChange(ownerUserId: string) {
    setIsLoading(true);
    try {
      await reassignLeadOwner(lead.id, ownerUserId);
    } catch (error) {
      console.error("Failed to reassign owner:", error);
    }
    setIsLoading(false);
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">
              {lead.churchName}
            </h1>
            {isDnc && (
              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
                DNC
              </span>
            )}
          </div>
          {lead.location && (
            <p className="text-gray-500 mt-1">{lead.location}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Stage */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Stage</label>
            <select
              value={lead.stage.id}
              onChange={(e) => handleStageChange(e.target.value)}
              disabled={isLoading}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
            </select>
          </div>

          {/* Owner */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Owner</label>
            {crmUsers ? (
              <select
                value={lead.owner.id}
                onChange={(e) => handleOwnerChange(e.target.value)}
                disabled={isLoading}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {crmUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-gray-700 py-2">
                {lead.owner.name || lead.owner.email}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
