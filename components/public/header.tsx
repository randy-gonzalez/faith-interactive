/**
 * Public Website Header
 *
 * Mobile-first responsive header with navigation.
 */

import Link from "next/link";

interface NavLink {
  label: string;
  href: string;
}

interface PublicHeaderProps {
  churchName: string;
  logoUrl?: string | null;
  navigation: NavLink[];
}

export function PublicHeader({
  churchName,
  logoUrl,
  navigation,
}: PublicHeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Church Name */}
          <Link href="/" className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={churchName}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <span className="text-xl font-semibold text-gray-900 dark:text-white">
                {churchName}
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navigation.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors"
            >
              Contact Us
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <MobileMenu churchName={churchName} navigation={navigation} />
        </div>
      </div>
    </header>
  );
}

/**
 * Mobile Navigation Menu
 */
function MobileMenu({
  churchName,
  navigation,
}: {
  churchName: string;
  navigation: NavLink[];
}) {
  return (
    <div className="md:hidden">
      <details className="group">
        <summary className="list-none cursor-pointer p-2 -mr-2">
          <svg
            className="w-6 h-6 text-gray-600 dark:text-gray-300 group-open:hidden"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          <svg
            className="w-6 h-6 text-gray-600 dark:text-gray-300 hidden group-open:block"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </summary>

        <nav className="absolute left-0 right-0 top-16 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-4 space-y-2">
            {navigation.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-md"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="block px-3 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md text-center mt-2"
            >
              Contact Us
            </Link>
          </div>
        </nav>
      </details>
    </div>
  );
}
