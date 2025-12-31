"use client";

/**
 * Reset Password Page
 *
 * Completes the password reset flow with a valid token.
 */

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // No token provided
  if (!token) {
    return (
      <div className="space-y-6 text-center">
        <div className="text-[var(--error)] text-4xl">!</div>
        <h2 className="text-xl font-semibold">Invalid reset link</h2>
        <p className="text-sm text-[var(--muted)]">
          This password reset link is invalid or has expired.
        </p>
        <Link
          href="/forgot-password"
          className="block text-[var(--primary)] hover:underline"
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength (matches backend validation)
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      setError("Password must contain at least one letter and one number");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Reset failed");
        setLoading(false);
        return;
      }

      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="text-[var(--success)] text-4xl">✓</div>
        <h2 className="text-xl font-semibold">Password reset successful</h2>
        <p className="text-sm text-[var(--muted)]">
          Redirecting you to sign in...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Set new password</h2>
        <p className="text-sm text-[var(--muted)] mt-1">
          Choose a strong password for your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-[var(--error)] bg-red-50 dark:bg-red-900/20 rounded-md">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            New password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            placeholder="At least 8 characters"
            minLength={8}
          />
          <p className="text-xs text-[var(--muted)] mt-1">
            Must contain at least one letter and one number
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            placeholder="Enter password again"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset password"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
