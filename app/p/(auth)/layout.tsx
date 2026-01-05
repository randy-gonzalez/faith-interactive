/**
 * Platform Auth Layout
 *
 * Layout for auth-related pages on the platform surface.
 * Currently just the login redirect page.
 */

import { FiLogo } from "@/components/ui/fi-logo";

export default function PlatformAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="flex flex-col items-center mb-8">
          <FiLogo variant="stacked" colorMode="dark" size={64} />
          <p className="text-sm text-gray-500 mt-4">Staff Platform</p>
        </div>

        {/* Content container */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          {children}
        </div>
      </div>
    </main>
  );
}
