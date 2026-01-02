/**
 * Attendee List Component
 *
 * Admin component for managing event registrations.
 * Shows registration list with status, check-in controls, and export.
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RegistrationStatus } from "@prisma/client";

interface Registration {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  additionalAttendees: number;
  status: RegistrationStatus;
  waitlistPosition: number | null;
  checkedInAt: string | null;
  registeredAt: string;
}

interface RegistrationStats {
  registered: number;
  waitlisted: number;
  checkedIn: number;
  cancelled: number;
  noShow: number;
  totalAttendees: number;
}

interface AttendeeListProps {
  eventId: string;
  eventTitle: string;
  capacity: number | null;
}

const STATUS_LABELS: Record<RegistrationStatus, string> = {
  REGISTERED: "Registered",
  WAITLISTED: "Waitlisted",
  CANCELLED: "Cancelled",
  CHECKED_IN: "Checked In",
  NO_SHOW: "No Show",
};

const STATUS_COLORS: Record<RegistrationStatus, string> = {
  REGISTERED: "bg-blue-100 text-blue-800",
  WAITLISTED: "bg-yellow-100 text-yellow-800",
  CANCELLED: "bg-gray-100 text-gray-800",
  CHECKED_IN: "bg-green-100 text-green-800",
  NO_SHOW: "bg-red-100 text-red-800",
};

export function AttendeeList({ eventId, eventTitle, capacity }: AttendeeListProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState<RegistrationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | "">("");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchRegistrations();
  }, [eventId, statusFilter, search]);

  async function fetchRegistrations() {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);

      const response = await fetch(`/api/events/${eventId}/registrations?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data.registrations || []);
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error("Failed to fetch registrations:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(regId: string, action: "check_in" | "undo_check_in" | "no_show") {
    setActionLoading(regId);
    try {
      const response = await fetch(`/api/events/${eventId}/registrations/${regId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        fetchRegistrations();
      }
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCancel(regId: string) {
    if (!confirm("Are you sure you want to cancel this registration?")) {
      return;
    }

    setActionLoading(regId);
    try {
      const response = await fetch(`/api/events/${eventId}/registrations/${regId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchRegistrations();
      }
    } catch (error) {
      console.error("Cancel failed:", error);
    } finally {
      setActionLoading(null);
    }
  }

  function exportCSV() {
    const headers = ["First Name", "Last Name", "Email", "Phone", "Additional Guests", "Status", "Checked In At", "Registered At"];
    const rows = registrations.map((r) => [
      r.firstName,
      r.lastName,
      r.email,
      r.phone || "",
      r.additionalAttendees.toString(),
      STATUS_LABELS[r.status],
      r.checkedInAt ? new Date(r.checkedInAt).toLocaleString() : "",
      new Date(r.registeredAt).toLocaleString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${eventTitle.replace(/[^a-z0-9]/gi, "-")}-registrations.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">Loading registrations...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {stats.registered + stats.checkedIn}
            </div>
            <div className="text-sm text-gray-500">Registered</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{stats.checkedIn}</div>
            <div className="text-sm text-gray-500">Checked In</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-yellow-600">{stats.waitlisted}</div>
            <div className="text-sm text-gray-500">Waitlisted</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalAttendees}
            </div>
            <div className="text-sm text-gray-500">Total Attendees</div>
          </div>
          {capacity && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">
                {Math.max(0, capacity - stats.registered - stats.checkedIn)}
              </div>
              <div className="text-sm text-gray-500">Spots Left</div>
            </div>
          )}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-red-600">{stats.noShow}</div>
            <div className="text-sm text-gray-500">No Shows</div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 rounded-md border bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500 w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as RegistrationStatus | "")}
            className="px-3 py-2 rounded-md border bg-white text-gray-900 border-gray-300 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="REGISTERED">Registered</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="WAITLISTED">Waitlisted</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="NO_SHOW">No Show</option>
          </select>
        </div>
        <Button variant="outline" onClick={exportCSV}>
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guests
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No registrations found
                  </td>
                </tr>
              ) : (
                registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {reg.firstName} {reg.lastName}
                      </div>
                      {reg.phone && (
                        <div className="text-sm text-gray-500">{reg.phone}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {reg.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {reg.additionalAttendees > 0
                        ? `+${reg.additionalAttendees}`
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[reg.status]}`}
                      >
                        {STATUS_LABELS[reg.status]}
                        {reg.waitlistPosition && ` #${reg.waitlistPosition}`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {reg.status === "REGISTERED" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleAction(reg.id, "check_in")}
                              disabled={actionLoading === reg.id}
                            >
                              Check In
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction(reg.id, "no_show")}
                              disabled={actionLoading === reg.id}
                            >
                              No Show
                            </Button>
                          </>
                        )}
                        {reg.status === "CHECKED_IN" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction(reg.id, "undo_check_in")}
                            disabled={actionLoading === reg.id}
                          >
                            Undo Check-in
                          </Button>
                        )}
                        {(reg.status === "REGISTERED" || reg.status === "WAITLISTED") && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCancel(reg.id)}
                            disabled={actionLoading === reg.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
