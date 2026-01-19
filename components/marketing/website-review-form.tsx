"use client";

/**
 * Website Review Request Form
 *
 * Simple, clean form for requesting a free website review.
 * No marketing fluff. Low friction.
 */

import { useState } from "react";
import { trackLeadConversion } from "@/lib/analytics/track-event";

const roleOptions = [
  { value: "", label: "Select your role (optional)" },
  { value: "pastor", label: "Pastor" },
  { value: "admin", label: "Church Administrator" },
  { value: "communications", label: "Communications" },
  { value: "volunteer", label: "Volunteer" },
  { value: "other", label: "Other" },
];

export function WebsiteReviewForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [churchName, setChurchName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [role, setRole] = useState("");
  const [honeypot, setHoneypot] = useState(""); // Spam protection

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/marketing/website-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          churchName,
          websiteUrl,
          role: role || undefined,
          website: honeypot, // Honeypot - should be empty
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setSuccess(true);
      trackLeadConversion("website_review_request");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-white border border-[#d4d4d4] p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-[#4de88a] mx-auto mb-6 flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="h3 mb-4">Thank you.</h3>
        <p className="text-[#525252]">
          We&apos;ve received your request and will send your review within 24 to 48 hours. Check your inbox soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-[#d4d4d4] p-8">
      <p className="text-sm text-[#737373] mb-6">Takes less than a minute.</p>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm mb-6">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Your name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 border border-[#d4d4d4] bg-white text-[#171717] focus:outline-none focus:border-[#171717] transition-colors"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-[#d4d4d4] bg-white text-[#171717] focus:outline-none focus:border-[#171717] transition-colors"
          />
        </div>

        {/* Church Name */}
        <div>
          <label htmlFor="churchName" className="block text-sm font-medium mb-2">
            Church name
          </label>
          <input
            type="text"
            id="churchName"
            value={churchName}
            onChange={(e) => setChurchName(e.target.value)}
            required
            className="w-full px-4 py-3 border border-[#d4d4d4] bg-white text-[#171717] focus:outline-none focus:border-[#171717] transition-colors"
          />
        </div>

        {/* Website URL */}
        <div>
          <label htmlFor="websiteUrl" className="block text-sm font-medium mb-2">
            Website URL
          </label>
          <input
            type="url"
            id="websiteUrl"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            required
            placeholder="https://yourchurch.com"
            className="w-full px-4 py-3 border border-[#d4d4d4] bg-white text-[#171717] placeholder:text-[#a3a3a3] focus:outline-none focus:border-[#171717] transition-colors"
          />
        </div>

        {/* Role (Optional) */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium mb-2">
            Your role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-3 border border-[#d4d4d4] bg-white text-[#171717] focus:outline-none focus:border-[#171717] transition-colors appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23737373'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 1rem center",
              backgroundSize: "1.25rem",
            }}
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Honeypot - hidden from users */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            type="text"
            id="website"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Consent line */}
        <p className="text-sm text-[#737373]">
          By submitting this form, you agree to receive your website review by email. We won&apos;t add you to a mailing list or share your information.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary disabled:opacity-50"
        >
          {loading ? "Sending..." : "Get Your Free Review"}
        </button>
      </div>
    </form>
  );
}
