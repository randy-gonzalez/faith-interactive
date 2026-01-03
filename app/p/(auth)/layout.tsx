/**
 * Platform Auth Layout
 *
 * Layout for auth-related pages on the platform surface.
 * Currently just the login redirect page.
 */

export default function PlatformAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Fi Platform</h1>
          <p className="text-sm text-gray-500 mt-1">Faith Interactive</p>
        </div>

        {/* Content container */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          {children}
        </div>
      </div>
    </main>
  );
}
