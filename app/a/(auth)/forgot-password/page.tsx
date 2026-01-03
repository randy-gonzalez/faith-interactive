"use client";

/**
 * Forgot Password Page
 *
 * Initiates the password reset flow.
 * Always shows success to prevent user enumeration.
 */

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok && !data.success) {
        setError(data.error || "Request failed");
        setLoading(false);
        return;
      }

      // Always show success to prevent enumeration
      setSubmitted(true);
    } catch {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="text-[var(--success)] text-4xl">✓</div>
        <h2 className="text-xl font-semibold">Check your email</h2>
        <p className="text-sm text-[var(--muted)]">
          If an account exists with that email address, we&apos;ve sent
          instructions to reset your password.
        </p>
        <p className="text-sm text-[var(--muted)]">
          (In development mode, check your console for the reset link)
        </p>
        <Link
          href="/login"
          className="block text-[var(--primary)] hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Reset password</h2>
        <p className="text-sm text-[var(--muted)] mt-1">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-[var(--error)] bg-red-50 dark:bg-red-900/20 rounded-md">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <div className="text-center text-sm">
        <Link
          href="/login"
          className="text-[var(--primary)] hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
