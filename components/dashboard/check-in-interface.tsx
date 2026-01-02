/**
 * Check-in Interface Component
 *
 * Touch-friendly interface for checking in event attendees.
 * Optimized for tablet/kiosk use with large touch targets.
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { RegistrationStatus } from "@prisma/client";

interface Registration {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  additionalAttendees: number;
  status: RegistrationStatus;
  checkedInAt: string | null;
}

interface CheckInInterfaceProps {
  eventId: string;
  eventTitle: string;
}

export function CheckInInterface({ eventId, eventTitle }: CheckInInterfaceProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [stats, setStats] = useState({ checkedIn: 0, total: 0 });
  const [recentCheckIn, setRecentCheckIn] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchRegistrations();
    // Focus search on mount
    searchRef.current?.focus();
  }, [eventId]);

  useEffect(() => {
    // Filter registrations based on search
    if (!search) {
      setFilteredRegistrations(
        registrations.filter((r) =>
          ["REGISTERED", "CHECKED_IN"].includes(r.status)
        )
      );
    } else {
      const searchLower = search.toLowerCase();
      setFilteredRegistrations(
        registrations.filter(
          (r) =>
            ["REGISTERED", "CHECKED_IN"].includes(r.status) &&
            (r.firstName.toLowerCase().includes(searchLower) ||
              r.lastName.toLowerCase().includes(searchLower) ||
              r.email.toLowerCase().includes(searchLower))
        )
      );
    }
  }, [search, registrations]);

  async function fetchRegistrations() {
    try {
      const response = await fetch(`/api/events/${eventId}/registrations`);
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data.registrations || []);

        // Calculate stats
        const total = (data.registrations || []).filter(
          (r: Registration) => r.status === "REGISTERED" || r.status === "CHECKED_IN"
        ).length;
        const checkedIn = (data.registrations || []).filter(
          (r: Registration) => r.status === "CHECKED_IN"
        ).length;
        setStats({ checkedIn, total });
      }
    } catch (error) {
      console.error("Failed to fetch registrations:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckIn(regId: string, name: string) {
    setActionLoading(regId);
    try {
      const response = await fetch(`/api/events/${eventId}/registrations/${regId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check_in" }),
      });

      if (response.ok) {
        setRecentCheckIn(name);
        setTimeout(() => setRecentCheckIn(null), 3000);
        fetchRegistrations();
        setSearch("");
        searchRef.current?.focus();
      }
    } catch (error) {
      console.error("Check-in failed:", error);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleUndoCheckIn(regId: string) {
    setActionLoading(regId);
    try {
      const response = await fetch(`/api/events/${eventId}/registrations/${regId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "undo_check_in" }),
      });

      if (response.ok) {
        fetchRegistrations();
      }
    } catch (error) {
      console.error("Undo failed:", error);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Check-in
            </h1>
            <p className="text-gray-500">{eventTitle}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">
              {stats.checkedIn} / {stats.total}
            </div>
            <div className="text-sm text-gray-500">Checked In</div>
          </div>
        </div>
      </div>

      {/* Success banner */}
      {recentCheckIn && (
        <div className="bg-green-500 text-white py-4 px-6 text-center text-xl font-medium animate-pulse">
          Welcome, {recentCheckIn}!
        </div>
      )}

      {/* Search */}
      <div className="max-w-4xl mx-auto p-6">
        <input
          ref={searchRef}
          type="text"
          placeholder="Type name or email to search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-6 py-4 text-xl rounded-xl border-2 bg-white text-gray-900 border-gray-300 focus:ring-4 focus:ring-blue-500 focus:border-blue-500"
          autoComplete="off"
          autoFocus
        />
      </div>

      {/* Results */}
      <div className="max-w-4xl mx-auto px-6 pb-6 space-y-3">
        {filteredRegistrations.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-lg">
            {search
              ? "No matching attendees found"
              : "No registrations to check in"}
          </div>
        ) : (
          filteredRegistrations.map((reg) => (
            <div
              key={reg.id}
              className={`bg-white rounded-xl p-6 border-2 transition-all ${
                reg.status === "CHECKED_IN"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-xl font-medium text-gray-900">
                    {reg.firstName} {reg.lastName}
                    {reg.additionalAttendees > 0 && (
                      <span className="ml-2 text-sm text-gray-500">
                        +{reg.additionalAttendees} guest{reg.additionalAttendees > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <div className="text-gray-500">
                    {reg.email}
                  </div>
                  {reg.status === "CHECKED_IN" && reg.checkedInAt && (
                    <div className="text-sm text-green-600 mt-1">
                      Checked in at{" "}
                      {new Date(reg.checkedInAt).toLocaleTimeString()}
                    </div>
                  )}
                </div>
                <div>
                  {reg.status === "REGISTERED" ? (
                    <button
                      onClick={() =>
                        handleCheckIn(reg.id, `${reg.firstName} ${reg.lastName}`)
                      }
                      disabled={actionLoading === reg.id}
                      className="px-8 py-4 bg-green-600 text-white text-xl font-medium rounded-xl hover:bg-green-700 active:bg-green-800 disabled:opacity-50 transition-colors touch-manipulation"
                    >
                      {actionLoading === reg.id ? "..." : "Check In"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUndoCheckIn(reg.id)}
                      disabled={actionLoading === reg.id}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 disabled:opacity-50 transition-colors touch-manipulation"
                    >
                      {actionLoading === reg.id ? "..." : "Undo"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Keyboard hint */}
      <div className="fixed bottom-4 right-4 text-sm text-gray-400">
        Press any key to search
      </div>
    </div>
  );
}
