/**
 * CRM Leads List Page
 *
 * Table view of all leads with filtering and quick actions.
 */

import { requireCrmUser, isPlatformAdmin } from "@/lib/crm/guards";
import { getLeads, getActiveStages } from "@/lib/crm/queries";
import Link from "next/link";
import { LeadsTable } from "../components/leads-table";
import { LeadFilters } from "../components/lead-filters";

interface PageProps {
  searchParams: Promise<{
    stageId?: string;
    followUpFilter?: string;
    showDnc?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function LeadsPage({ searchParams }: PageProps) {
  const user = await requireCrmUser();
  const params = await searchParams;

  const [stages, leadsResult] = await Promise.all([
    getActiveStages(),
    getLeads(user, {
      stageId: params.stageId,
      followUpFilter: (params.followUpFilter as "overdue" | "due_today" | "none" | "all") || "all",
      showDnc: params.showDnc === "true",
      search: params.search,
      page: params.page ? parseInt(params.page) : 1,
    }),
  ]);

  const canReassign = isPlatformAdmin(user);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500 mt-1">
            {leadsResult.total} {leadsResult.total === 1 ? "lead" : "leads"} total
          </p>
        </div>
        <Link
          href="/platform/crm/leads/new"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
        >
          New Lead
        </Link>
      </div>

      {/* Filters */}
      <LeadFilters stages={stages} />

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {leadsResult.leads.length > 0 ? (
          <LeadsTable
            leads={leadsResult.leads}
            stages={stages}
            canReassign={canReassign}
          />
        ) : (
          <div className="px-4 py-12 text-center text-gray-500">
            No leads found. Try adjusting your filters or create a new lead.
          </div>
        )}
      </div>

      {/* Pagination */}
      {leadsResult.pages > 1 && (
        <Pagination
          currentPage={params.page ? parseInt(params.page) : 1}
          totalPages={leadsResult.pages}
          searchParams={params}
        />
      )}
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}) {
  function getPageUrl(page: number) {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== "page") params.set(key, value);
    });
    params.set("page", page.toString());
    return `/platform/crm/leads?${params.toString()}`;
  }

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-500">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex gap-2">
        {currentPage > 1 && (
          <Link
            href={getPageUrl(currentPage - 1)}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            Previous
          </Link>
        )}
        {currentPage < totalPages && (
          <Link
            href={getPageUrl(currentPage + 1)}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            Next
          </Link>
        )}
      </div>
    </div>
  );
}
