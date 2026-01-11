"use client";

/**
 * Contact Form
 *
 * Simple, clean contact form. No marketing fluff.
 * Shows Calendly embed after successful submission.
 */

import { useState, useEffect } from "react";
import { trackLeadConversion } from "@/lib/analytics/track-event";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [churchName, setChurchName] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // Honeypot

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
          churchName: churchName || undefined,
          message: message || undefined,
          website, // Honeypot - should be empty
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setSuccess(true);
      trackLeadConversion("contact_form");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Load Calendly widget script when success state is reached
  useEffect(() => {
    if (success) {
      const script = document.createElement("script");
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [success]);

  if (success) {
    const calendlyUrl = `https://calendly.com/faith-interactive/redesign?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`;

    return (
      <div className="py-8">
        <div className="mb-8">
          <p className="h3 mb-4">Thanks for reaching out.</p>
          <p className="text-[#525252]">
            Schedule a call below to discuss your project!
          </p>
        </div>

        <div
          className="calendly-inline-widget"
          data-url={calendlyUrl}
          style={{ minWidth: "320px", height: "700px" }}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Name
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
          Email
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
          className="w-full px-4 py-3 border border-[#d4d4d4] bg-white text-[#171717] focus:outline-none focus:border-[#171717] transition-colors"
        />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-2">
          Tell us about your project
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="w-full px-4 py-3 border border-[#d4d4d4] bg-white text-[#171717] focus:outline-none focus:border-[#171717] transition-colors resize-none"
        />
      </div>

      {/* Honeypot */}
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
        className="btn-primary w-full sm:w-auto disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
