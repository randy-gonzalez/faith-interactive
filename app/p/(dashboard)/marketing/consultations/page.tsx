/**
 * Consultations List Page
 *
 * Platform admin page for managing consultation requests.
 */

import { prisma } from "@/lib/db/prisma";
import { requirePlatformUser } from "@/lib/auth/guards";
import Link from "next/link";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  NEW: { label: "New", color: "bg-blue-100 text-blue-800" },
  CONTACTED: { label: "Contacted", color: "bg-yellow-100 text-yellow-800" },
  QUALIFIED: { label: "Qualified", color: "bg-purple-100 text-purple-800" },
  CONVERTED: { label: "Converted", color: "bg-green-100 text-green-800" },
  CLOSED: { label: "Closed", color: "bg-gray-100 text-gray-800" },
};

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function ConsultationsPage({ searchParams }: PageProps) {
  await requirePlatformUser();
  const params = await searchParams;
  const filterStatus = params.status;

  // Build where clause
  const where: Record<string, unknown> = {};
  if (filterStatus && filterStatus !== "all") {
    where.status = filterStatus;
  }

  const [consultations, counts] = await Promise.all([
    prisma.consultationRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
    }),
    prisma.consultationRequest.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

  const statusCounts = counts.reduce(
    (acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    },
    {} as Record<string, number>
  );

  const totalCount = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Consultation Requests</h1>
        <p className="text-gray-600 mt-1">
          Manage incoming consultation requests from the marketing website.
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        <Link
          href="/marketing/consultations"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !filterStatus || filterStatus === "all"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All ({totalCount})
        </Link>
        {Object.entries(STATUS_LABELS).map(([status, { label }]) => (
          <Link
            key={status}
            href={`/marketing/consultations?status=${status}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === status
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {label} ({statusCounts[status] || 0})
          </Link>
        ))}
      </div>

      {/* Consultations List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {consultations.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              {filterStatus && filterStatus !== "all"
                ? `No ${STATUS_LABELS[filterStatus]?.label.toLowerCase() || filterStatus} consultation requests.`
                : "No consultation requests yet."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {consultations.map((consultation) => (
              <Link
                key={consultation.id}
                href={`/marketing/consultations/${consultation.id}`}
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{consultation.name}</h3>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          STATUS_LABELS[consultation.status]?.color || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {STATUS_LABELS[consultation.status]?.label || consultation.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{consultation.email}</p>
                    {consultation.churchName && (
                      <p className="text-sm text-gray-500">{consultation.churchName}</p>
                    )}
                    {consultation.packageInterest && (
                      <p className="text-sm text-indigo-600 mt-1">
                        Interested in: {consultation.packageInterest}
                      </p>
                    )}
                    {consultation.message && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {consultation.message}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-500 ml-4">
                    <p>
                      {new Date(consultation.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p>
                      {new Date(consultation.createdAt).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
