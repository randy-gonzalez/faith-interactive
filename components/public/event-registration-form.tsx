/**
 * Event Registration Form Component
 *
 * Public-facing form for event registration.
 * Includes capacity indicator, waitlist notice, and reminder opt-in.
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CapacityStatus {
  registrationEnabled: boolean;
  capacity: number | null;
  registered: number;
  waitlisted: number;
  available: number | null;
  waitlistEnabled: boolean;
  isFull: boolean;
  deadlinePassed: boolean;
}

interface EventRegistrationFormProps {
  eventId: string;
  occurrenceDate?: string;
  onSuccess?: (registration: {
    id: string;
    status: string;
    waitlistPosition: number | null;
  }) => void;
}

export function EventRegistrationForm({
  eventId,
  occurrenceDate,
  onSuccess,
}: EventRegistrationFormProps) {
  const [loading, setLoading] = useState(false);
  const [capacityLoading, setCapacityLoading] = useState(true);
  const [capacity, setCapacity] = useState<CapacityStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    message: string;
    status: string;
    waitlistPosition: number | null;
  } | null>(null);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [additionalAttendees, setAdditionalAttendees] = useState(0);
  const [reminderOptIn, setReminderOptIn] = useState(true);
  // Honeypot field
  const [website, setWebsite] = useState("");

  // Fetch capacity status on mount
  useEffect(() => {
    fetchCapacityStatus();
  }, [eventId]);

  async function fetchCapacityStatus() {
    try {
      const response = await fetch(`/api/events/${eventId}/register`);
      if (response.ok) {
        const data = await response.json();
        setCapacity(data.capacityStatus);
      }
    } catch (err) {
      console.error("Failed to fetch capacity:", err);
    } finally {
      setCapacityLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone: phone || undefined,
          additionalAttendees,
          reminderOptIn,
          occurrenceDate,
          website, // Honeypot
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed. Please try again.");
        return;
      }

      setSuccess({
        message: data.message,
        status: data.registration?.status,
        waitlistPosition: data.registration?.waitlistPosition,
      });

      if (onSuccess && data.registration) {
        onSuccess(data.registration);
      }

      // Refresh capacity
      fetchCapacityStatus();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Registration not enabled
  if (!capacityLoading && capacity && !capacity.registrationEnabled) {
    return null;
  }

  // Deadline passed
  if (!capacityLoading && capacity?.deadlinePassed) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Registration for this event has closed.
        </p>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-6 h-6 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-green-800 dark:text-green-200">
              {success.status === "WAITLISTED"
                ? "Added to Waitlist"
                : "Registration Confirmed!"}
            </h3>
            <p className="mt-1 text-green-700 dark:text-green-300">
              {success.message}
            </p>
            {success.waitlistPosition && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                Your waitlist position: #{success.waitlistPosition}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Register for this Event
      </h3>

      {/* Capacity indicator */}
      {!capacityLoading && capacity && capacity.capacity && (
        <div className="mb-4">
          {capacity.isFull ? (
            capacity.waitlistEnabled ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-md p-3 text-sm">
                <strong>Event is full.</strong> You can join the waitlist and
                we&apos;ll notify you if a spot opens up.
                {capacity.waitlisted > 0 && (
                  <span className="block mt-1 text-yellow-600 dark:text-yellow-400">
                    {capacity.waitlisted} people on waitlist
                  </span>
                )}
              </div>
            ) : (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md p-3 text-sm">
                <strong>Event is full.</strong> No waitlist available.
              </div>
            )
          ) : (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {capacity.available} spots remaining
              </span>
              <span className="text-gray-500 dark:text-gray-500">
                {capacity.registered} / {capacity.capacity} registered
              </span>
            </div>
          )}
        </div>
      )}

      {/* Don't show form if full and no waitlist */}
      {capacity?.isFull && !capacity?.waitlistEnabled ? null : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md p-3 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              disabled={loading}
            />
            <Input
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <Input
            label="Phone (optional)"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Additional Attendees
            </label>
            <select
              value={additionalAttendees}
              onChange={(e) => setAdditionalAttendees(parseInt(e.target.value))}
              disabled={loading}
              className="w-full px-3 py-2 rounded-md border bg-white dark:bg-gray-950 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>Just me</option>
              <option value={1}>+1 guest</option>
              <option value={2}>+2 guests</option>
              <option value={3}>+3 guests</option>
              <option value={4}>+4 guests</option>
              <option value={5}>+5 guests</option>
            </select>
            <p className="text-xs text-gray-500">
              Include yourself in the count above
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={reminderOptIn}
              onChange={(e) => setReminderOptIn(e.target.checked)}
              disabled={loading}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Send me a reminder before the event
            </span>
          </label>

          {/* Honeypot field - hidden from real users */}
          <input
            type="text"
            name="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            autoComplete="off"
            tabIndex={-1}
            className="absolute -left-[9999px] opacity-0"
            aria-hidden="true"
          />

          <Button
            type="submit"
            disabled={loading || (capacity?.isFull && !capacity?.waitlistEnabled)}
            className="w-full"
          >
            {loading
              ? "Registering..."
              : capacity?.isFull
              ? "Join Waitlist"
              : "Register"}
          </Button>
        </form>
      )}
    </div>
  );
}
