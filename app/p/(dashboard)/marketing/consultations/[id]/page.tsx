/**
 * Consultation Detail Page
 *
 * Platform admin page for viewing and updating a consultation request.
 */

import { prisma } from "@/lib/db/prisma";
import { requirePlatformUser } from "@/lib/auth/guards";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConsultationStatusForm } from "./status-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  NEW: { label: "New", color: "bg-blue-100 text-blue-800" },
  CONTACTED: { label: "Contacted", color: "bg-yellow-100 text-yellow-800" },
  QUALIFIED: { label: "Qualified", color: "bg-purple-100 text-purple-800" },
  CONVERTED: { label: "Converted", color: "bg-green-100 text-green-800" },
  CLOSED: { label: "Closed", color: "bg-gray-100 text-gray-800" },
};

export default async function ConsultationDetailPage({ params }: PageProps) {
  await requirePlatformUser();
  const { id } = await params;

  const consultation = await prisma.consultationRequest.findUnique({
    where: { id },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!consultation) {
    notFound();
  }

  // Get platform users for assignment
  const platformUsers = await prisma.user.findMany({
    where: {
      platformRole: { not: null },
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/marketing/consultations"
          className="text-gray-500 hover:text-gray-700"
        >
          ← Back to Consultations
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{consultation.name}</h1>
          <p className="text-gray-600 mt-1">
            Submitted on{" "}
            {new Date(consultation.createdAt).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
        <span
          className={`px-3 py-1 text-sm font-medium rounded-full ${
            STATUS_LABELS[consultation.status]?.color || "bg-gray-100 text-gray-800"
          }`}
        >
          {STATUS_LABELS[consultation.status]?.label || consultation.status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Contact Information */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="text-gray-900">{consultation.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd>
                  <a
                    href={`mailto:${consultation.email}`}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    {consultation.email}
                  </a>
                </dd>
              </div>
              {consultation.phone && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd>
                    <a
                      href={`tel:${consultation.phone}`}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      {consultation.phone}
                    </a>
                  </dd>
                </div>
              )}
              {consultation.churchName && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Church Name</dt>
                  <dd className="text-gray-900">{consultation.churchName}</dd>
                </div>
              )}
              {consultation.packageInterest && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Package Interest</dt>
                  <dd className="text-gray-900">{consultation.packageInterest}</dd>
                </div>
              )}
            </dl>
          </div>

          {consultation.message && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Message</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{consultation.message}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
            <dl className="space-y-2 text-sm">
              {consultation.ipAddress && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">IP Address</dt>
                  <dd className="text-gray-900 font-mono">{consultation.ipAddress}</dd>
                </div>
              )}
              {consultation.userAgent && (
                <div>
                  <dt className="text-gray-500 mb-1">User Agent</dt>
                  <dd className="text-gray-900 font-mono text-xs break-all">
                    {consultation.userAgent}
                  </dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">ID</dt>
                <dd className="text-gray-900 font-mono">{consultation.id}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Status & Assignment */}
        <div className="space-y-6">
          <ConsultationStatusForm
            consultationId={consultation.id}
            currentStatus={consultation.status}
            currentNotes={consultation.notes}
            currentAssignedToId={consultation.assignedToId}
            platformUsers={platformUsers}
          />

          {consultation.assignedTo && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Assigned To</h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-medium">
                    {consultation.assignedTo.name?.charAt(0) || "?"}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{consultation.assignedTo.name}</p>
                  <p className="text-sm text-gray-500">{consultation.assignedTo.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
