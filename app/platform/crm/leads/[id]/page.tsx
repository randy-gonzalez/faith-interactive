/**
 * Lead Detail Page
 *
 * Shows full lead details with edit capabilities and task management.
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { requireCrmUser, isPlatformAdmin } from "@/lib/crm/guards";
import { getLead, getLeadTasks, getActiveStages, getCrmUsers } from "@/lib/crm/queries";
import { LeadHeader } from "../../components/lead-header";
import { LeadDetails } from "../../components/lead-details";
import { LeadDnc } from "../../components/lead-dnc";
import { LeadTasks } from "../../components/lead-tasks";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: PageProps) {
  const user = await requireCrmUser();
  const { id } = await params;

  const [lead, tasks, stages, crmUsers] = await Promise.all([
    getLead(user, id),
    getLeadTasks(user, id),
    getActiveStages(),
    isPlatformAdmin(user) ? getCrmUsers() : Promise.resolve([]),
  ]);

  if (!lead) {
    notFound();
  }

  const canReassign = isPlatformAdmin(user);

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/platform/crm/leads"
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        &larr; Back to Leads
      </Link>

      {/* Header with stage and owner */}
      <LeadHeader
        lead={lead}
        stages={stages}
        crmUsers={canReassign ? crmUsers : undefined}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Details */}
          <LeadDetails lead={lead} stages={stages} currentUserId={user.id} />

          {/* Tasks */}
          <LeadTasks leadId={lead.id} tasks={tasks} isDnc={!!lead.dnc} />
        </div>

        {/* Right Column - DNC & Meta */}
        <div className="space-y-6">
          {/* DNC Status */}
          <LeadDnc lead={lead} />

          {/* Meta Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Details</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-500">Created</dt>
                <dd className="text-gray-900">
                  {new Date(lead.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Last Updated</dt>
                <dd className="text-gray-900">
                  {new Date(lead.updatedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </dd>
              </div>
              {lead.source && (
                <div>
                  <dt className="text-gray-500">Source</dt>
                  <dd className="text-gray-900">
                    {lead.source.charAt(0).toUpperCase() + lead.source.slice(1).replace("_", " ")}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500">Tasks</dt>
                <dd className="text-gray-900">{lead._count.tasks}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
