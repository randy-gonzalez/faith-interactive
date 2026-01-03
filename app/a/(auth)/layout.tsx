/**
 * Admin Auth Layout
 *
 * Shared layout for authentication pages within the admin surface.
 * These pages don't need the full admin chrome (sidebar, header).
 *
 * Routes using this layout:
 * - /login
 * - /forgot-password
 * - /reset-password
 * - /accept-invite
 * - /select-church
 *
 * Note: This layout does NOT have html/body - the parent layout.tsx provides those.
 */

export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Church Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Faith Interactive</p>
        </div>

        {/* Auth form container */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          {children}
        </div>
      </div>
    </main>
  );
}
