"use client";

/**
 * Prayer Request Form Component
 *
 * Client-side form for submitting prayer requests.
 * Supports anonymous submissions.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function PrayerRequestForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [request, setRequest] = useState("");
  // Honeypot field (should remain empty)
  const [website, setWebsite] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/prayer-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || null,
          email: email || null,
          request,
          website, // Honeypot field
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit prayer request");
      }

      setSuccess(true);
      // Reset form
      setName("");
      setEmail("");
      setRequest("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
        <svg
          className="w-12 h-12 text-purple-500 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-purple-800 mb-2">
          Prayer Request Received
        </h3>
        <p className="text-purple-600">
          Thank you for sharing your prayer request with us. We will be praying for you.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-4 text-sm text-purple-600 hover:underline"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <p className="text-sm text-gray-600">
          Your prayer request is kept confidential and shared only with our prayer team.
          You may submit anonymously if you prefer.
        </p>
      </div>

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Your Name <span className="text-gray-400">(optional)</span>
        </label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Smith"
          disabled={loading}
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Your Email <span className="text-gray-400">(optional)</span>
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john@example.com"
          disabled={loading}
        />
        <p className="mt-1 text-xs text-gray-500">
          Provide your email if you'd like us to follow up with you
        </p>
      </div>

      <div>
        <label
          htmlFor="request"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Prayer Request *
        </label>
        <Textarea
          id="request"
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          placeholder="Share your prayer request..."
          rows={6}
          required
          disabled={loading}
        />
      </div>

      {/* Honeypot field - hidden from humans, visible to bots */}
      <div
        className="absolute -left-[9999px] opacity-0 pointer-events-none"
        aria-hidden="true"
      >
        <label htmlFor="website">
          Website (leave blank)
        </label>
        <input
          type="text"
          id="website"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Submitting..." : "Submit Prayer Request"}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Your prayer request is private and handled with care.
      </p>
    </form>
  );
}
