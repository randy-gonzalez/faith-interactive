/**
 * CRM Kanban View
 *
 * Visual pipeline board showing leads by stage.
 */

import { requireCrmUser } from "@/lib/crm/guards";
import { getLeadsByStage } from "@/lib/crm/queries";
import Link from "next/link";
import { KanbanBoard } from "../components/kanban-board";

export default async function KanbanPage() {
  const user = await requireCrmUser();
  const { stages, leadsByStage } = await getLeadsByStage(user);

  return (
    <div className="flex flex-col h-full min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Pipeline</h1>
          <p className="text-sm text-gray-500 mt-1">
            Move leads between stages using the dropdown
          </p>
        </div>
        <Link
          href="/crm/leads/new"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
        >
          New Lead
        </Link>
      </div>

      {/* Kanban Board - scrollable container */}
      <div className="flex-1 min-w-0 -mx-6 px-6 overflow-x-auto">
        <KanbanBoard stages={stages} leadsByStage={leadsByStage} />
      </div>
    </div>
  );
}
