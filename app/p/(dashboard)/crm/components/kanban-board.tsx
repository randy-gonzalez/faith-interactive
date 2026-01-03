"use client";

/**
 * Kanban Board Component
 *
 * Simple kanban implementation using dropdown for stage changes.
 * (Full drag-and-drop would require a DnD library - keeping it simple for v1)
 */

import { useState } from "react";
import Link from "next/link";
import { changeLeadStage } from "@/lib/crm/actions";
import type { LeadWithDetails } from "@/lib/crm/queries";

interface Stage {
  id: string;
  name: string;
  sortOrder: number;
}

interface KanbanBoardProps {
  stages: Stage[];
  leadsByStage: Record<string, LeadWithDetails[]>;
}

export function KanbanBoard({ stages, leadsByStage }: KanbanBoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map((stage) => (
        <KanbanColumn
          key={stage.id}
          stage={stage}
          leads={leadsByStage[stage.id] || []}
          allStages={stages}
        />
      ))}
    </div>
  );
}

function KanbanColumn({
  stage,
  leads,
  allStages,
}: {
  stage: Stage;
  leads: LeadWithDetails[];
  allStages: Stage[];
}) {
  return (
    <div className="flex-shrink-0 w-72">
      {/* Column Header */}
      <div className="bg-gray-100 rounded-t-lg px-3 py-2 flex items-center justify-between">
        <h3 className="font-medium text-gray-900">{stage.name}</h3>
        <span className="text-sm text-gray-500">{leads.length}</span>
      </div>

      {/* Column Body */}
      <div className="bg-gray-50 rounded-b-lg min-h-[400px] p-2 space-y-2">
        {leads.length > 0 ? (
          leads.map((lead) => (
            <KanbanCard
              key={lead.id}
              lead={lead}
              currentStageId={stage.id}
              allStages={allStages}
            />
          ))
        ) : (
          <div className="text-center text-gray-400 text-sm py-8">
            No leads
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanCard({
  lead,
  currentStageId,
  allStages,
}: {
  lead: LeadWithDetails;
  currentStageId: string;
  allStages: Stage[];
}) {
  const [isMoving, setIsMoving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const followUpDate = lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt) : null;
  const isOverdue = followUpDate && followUpDate < new Date();

  async function handleMoveToStage(newStageId: string) {
    if (newStageId === currentStageId) {
      setIsMoving(false);
      return;
    }

    setIsLoading(true);
    try {
      await changeLeadStage(lead.id, newStageId);
      setIsMoving(false);
    } catch (error) {
      console.error("Failed to move lead:", error);
    }
    setIsLoading(false);
  }

  // Get owner initials
  const ownerName = lead.owner.name || lead.owner.email;
  const initials = ownerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <Link
          href={`/crm/leads/${lead.id}`}
          className="font-medium text-gray-900 hover:text-indigo-600 text-sm leading-tight"
        >
          {lead.churchName}
        </Link>
        <div
          className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-medium shrink-0"
          title={ownerName}
        >
          {initials}
        </div>
      </div>

      {/* Location */}
      {lead.location && (
        <p className="text-xs text-gray-500 mb-2">{lead.location}</p>
      )}

      {/* Follow-up Badge */}
      {followUpDate && (
        <div
          className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${
            isOverdue
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          <span>
            {isOverdue ? "Overdue: " : "Due: "}
            {followUpDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      )}

      {/* Move Action */}
      <div className="mt-3 pt-2 border-t border-gray-100">
        {isMoving ? (
          <select
            value={currentStageId}
            onChange={(e) => handleMoveToStage(e.target.value)}
            disabled={isLoading}
            className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
            onBlur={() => !isLoading && setIsMoving(false)}
          >
            {allStages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        ) : (
          <button
            onClick={() => setIsMoving(true)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Move to stage...
          </button>
        )}
      </div>
    </div>
  );
}
