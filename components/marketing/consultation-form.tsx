"use client";

/**
 * Consultation Form Component
 *
 * Contact form for consultation requests with honeypot spam protection.
 */

import { useState } from "react";

interface ConsultationFormProps {
  preselectedPackage?: string;
}

const PACKAGE_OPTIONS = [
  { value: "", label: "Select a package..." },
  { value: "free", label: "FREE for Church Plants ($0 setup + $25/mo)" },
  { value: "small", label: "Small Church ($500 + $25/mo)" },
  { value: "large", label: "Large Church ($1,500 + $25/mo)" },
];

export function ConsultationForm({ preselectedPackage }: ConsultationFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [churchName, setChurchName] = useState("");
  const [packageInterest, setPackageInterest] = useState(preselectedPackage || "");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // Honeypot field

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/marketing/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          churchName: churchName || undefined,
          packageInterest: packageInterest || undefined,
          message: message || undefined,
          website, // Honeypot - should be empty
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit form");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#77f2a1] to-[#00ffce] flex items-center justify-center">
          <svg className="w-8 h-8 text-[#000646]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-[#000646] mb-2">Thank You!</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          We&apos;ve received your consultation request and will be in touch within 24 hours.
          We&apos;re excited to help your church grow online!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Your Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#00d4aa] focus:border-[#00d4aa] transition-colors"
            placeholder="John Smith"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#00d4aa] focus:border-[#00d4aa] transition-colors"
            placeholder="john@example.com"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#00d4aa] focus:border-[#00d4aa] transition-colors"
            placeholder="(555) 123-4567"
          />
        </div>

        {/* Church Name */}
        <div>
          <label htmlFor="churchName" className="block text-sm font-medium text-gray-700 mb-2">
            Church Name
          </label>
          <input
            type="text"
            id="churchName"
            value={churchName}
            onChange={(e) => setChurchName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#00d4aa] focus:border-[#00d4aa] transition-colors"
            placeholder="First Baptist Church"
          />
        </div>
      </div>

      {/* Package Interest */}
      <div>
        <label htmlFor="packageInterest" className="block text-sm font-medium text-gray-700 mb-2">
          Package Interest
        </label>
        <select
          id="packageInterest"
          value={packageInterest}
          onChange={(e) => setPackageInterest(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#00d4aa] focus:border-[#00d4aa] transition-colors"
        >
          {PACKAGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
          Tell us about your church
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#00d4aa] focus:border-[#00d4aa] transition-colors resize-none"
          placeholder="Tell us about your church, your current website situation, and what you're looking for..."
        />
      </div>

      {/* Honeypot - hidden from users */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
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

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-marketing-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Submitting..." : "Request Free Consultation"}
      </button>

      <p className="text-center text-sm text-gray-500">
        We&apos;ll respond within 24 hours. No spam, ever.
      </p>
    </form>
  );
}
