"use client";

/**
 * Leads Table Component
 *
 * Displays leads in a table with quick actions.
 */

import { useState } from "react";
import Link from "next/link";
import { changeLeadStage, setDnc, clearDnc } from "@/lib/crm/actions";
import type { LeadWithDetails } from "@/lib/crm/queries";

interface Stage {
  id: string;
  name: string;
}

interface LeadsTableProps {
  leads: LeadWithDetails[];
  stages: Stage[];
  canReassign: boolean;
}

export function LeadsTable({ leads, stages, canReassign }: LeadsTableProps) {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Church
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Contact
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Stage
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Owner
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Next Follow-up
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Updated
          </th>
          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {leads.map((lead) => (
          <LeadRow
            key={lead.id}
            lead={lead}
            stages={stages}
            canReassign={canReassign}
          />
        ))}
      </tbody>
    </table>
  );
}

function LeadRow({
  lead,
  stages,
  canReassign,
}: {
  lead: LeadWithDetails;
  stages: Stage[];
  canReassign: boolean;
}) {
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

  async function handleDncToggle() {
    setIsLoading(true);
    try {
      if (isDnc) {
        await clearDnc(lead.id);
      } else {
        await setDnc(lead.id, { reason: null });
      }
    } catch (error) {
      console.error("Failed to toggle DNC:", error);
    }
    setIsLoading(false);
  }

  const followUpDate = lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt) : null;
  const isOverdue = followUpDate && followUpDate < new Date();

  return (
    <tr className={`hover:bg-gray-50 ${isDnc ? "opacity-60" : ""}`}>
      {/* Church */}
      <td className="px-4 py-3">
        <Link
          href={`/crm/leads/${lead.id}`}
          className="font-medium text-gray-900 hover:text-indigo-600"
        >
          {lead.churchName}
        </Link>
        {isDnc && (
          <span className="ml-2 text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded">
            DNC
          </span>
        )}
        {lead.location && (
          <p className="text-sm text-gray-500">{lead.location}</p>
        )}
      </td>

      {/* Contact */}
      <td className="px-4 py-3 text-sm">
        {lead.primaryContactName && (
          <p className="text-gray-900">{lead.primaryContactName}</p>
        )}
        {lead.email && (
          <p className="text-gray-500">{lead.email}</p>
        )}
      </td>

      {/* Stage */}
      <td className="px-4 py-3">
        <select
          value={lead.stage.id}
          onChange={(e) => handleStageChange(e.target.value)}
          disabled={isLoading}
          className="text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {stages.map((stage) => (
            <option key={stage.id} value={stage.id}>
              {stage.name}
            </option>
          ))}
        </select>
      </td>

      {/* Owner */}
      <td className="px-4 py-3 text-sm text-gray-500">
        {lead.owner ? (lead.owner.name || lead.owner.email) : "Unassigned"}
      </td>

      {/* Next Follow-up */}
      <td className="px-4 py-3 text-sm">
        {followUpDate ? (
          <span className={isOverdue ? "text-red-600 font-medium" : "text-gray-500"}>
            {followUpDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
            {isOverdue && " (Overdue)"}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td>

      {/* Updated */}
      <td className="px-4 py-3 text-sm text-gray-500">
        {new Date(lead.updatedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/crm/leads/${lead.id}`}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            Open
          </Link>
          <button
            onClick={handleDncToggle}
            disabled={isLoading}
            className={`text-sm ${
              isDnc
                ? "text-green-600 hover:text-green-700"
                : "text-red-600 hover:text-red-700"
            }`}
          >
            {isDnc ? "Clear DNC" : "DNC"}
          </button>
        </div>
      </td>
    </tr>
  );
}
