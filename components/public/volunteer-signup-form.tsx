"use client";

/**
 * Volunteer Signup Form Component
 *
 * Client-side form for volunteer interest signup.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Default volunteer interest options - these can be customized per church later
const INTEREST_OPTIONS = [
  "Worship & Music",
  "Children's Ministry",
  "Youth Ministry",
  "Greeting & Hospitality",
  "Tech & Production",
  "Small Groups",
  "Outreach & Missions",
  "Prayer Team",
  "Administration",
  "Other",
];

export function VolunteerSignupForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  // Honeypot field (should remain empty)
  const [website, setWebsite] = useState("");

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/volunteer-signups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || null,
          interests,
          message: message || null,
          website, // Honeypot field
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit signup");
      }

      setSuccess(true);
      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setInterests([]);
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
        <svg
          className="w-12 h-12 text-green-500 mx-auto mb-4"
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
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
          Thank You for Signing Up!
        </h3>
        <p className="text-green-600 dark:text-green-300">
          We appreciate your interest in serving. Someone from our team will be in touch soon.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-4 text-sm text-green-600 dark:text-green-400 hover:underline"
        >
          Submit another signup
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Your Name *
        </label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Smith"
          required
          disabled={loading}
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Your Email *
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john@example.com"
          required
          disabled={loading}
        />
      </div>

      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Phone Number <span className="text-gray-400">(optional)</span>
        </label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(555) 123-4567"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Areas of Interest <span className="text-gray-400">(select all that apply)</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {INTEREST_OPTIONS.map((interest) => (
            <label
              key={interest}
              className={`
                flex items-center p-3 rounded-lg border cursor-pointer transition-colors
                ${
                  interests.includes(interest)
                    ? "bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                }
              `}
            >
              <input
                type="checkbox"
                checked={interests.includes(interest)}
                onChange={() => toggleInterest(interest)}
                disabled={loading}
                className="sr-only"
              />
              <span
                className={`
                  w-4 h-4 rounded border mr-2 flex items-center justify-center
                  ${
                    interests.includes(interest)
                      ? "bg-blue-600 border-blue-600"
                      : "border-gray-300 dark:border-gray-600"
                  }
                `}
              >
                {interests.includes(interest) && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {interest}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Additional Information <span className="text-gray-400">(optional)</span>
        </label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about your experience, availability, or anything else you'd like us to know..."
          rows={4}
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
        {loading ? "Submitting..." : "Sign Up to Volunteer"}
      </Button>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        We'll reach out to you about opportunities that match your interests.
      </p>
    </form>
  );
}
