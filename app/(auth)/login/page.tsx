"use client";

/**
 * Unified Login Page
 *
 * Single login page for all users (always on main domain):
 * - Platform users → redirected to /platform
 * - Single-church users → redirected to their church admin
 * - Multi-church users → redirected to /select-church
 *
 * Subdomain login pages redirect here via middleware.
 * The returnTo param is preserved to redirect back after login.
 */

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Build endpoint URL with returnTo if present
      const endpoint = returnTo
        ? `/api/auth/unified-login?returnTo=${encodeURIComponent(returnTo)}`
        : "/api/auth/unified-login";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // Use the redirect URL from the response
      if (data.redirectUrl) {
        // Handle cross-subdomain redirects (full URLs)
        if (
          data.redirectUrl.startsWith("http://") ||
          data.redirectUrl.startsWith("https://")
        ) {
          window.location.href = data.redirectUrl;
        } else {
          router.push(data.redirectUrl);
          router.refresh();
        }
        return;
      }

      // Fallback: go to select-church if no redirect URL
      router.push("/select-church");
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Sign in</h2>
        <p className="text-sm text-[var(--muted)] mt-1">
          Enter your credentials to access your account
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

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="Enter your password"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="text-center text-sm">
        <Link
          href="/forgot-password"
          className="text-[var(--primary)] hover:underline"
        >
          Forgot your password?
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
