/**
 * Auth Layout
 *
 * Minimal layout for authentication pages.
 * Centered, clean design for login/password flows.
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)]">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Faith Interactive
          </h1>
        </div>

        {/* Auth form container */}
        <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg p-6 shadow-sm">
          {children}
        </div>
      </div>
    </main>
  );
}
