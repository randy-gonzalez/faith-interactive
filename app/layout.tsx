/**
 * Root Layout (Minimal Shell)
 *
 * This is a minimal root layout required by Next.js.
 *
 * IMPORTANT: With hostname-based routing, each surface has its own
 * root layout that imports its own CSS:
 * - (marketing)/layout.tsx imports marketing.css
 * - (platform)/layout.tsx imports platform.css
 * - (admin)/layout.tsx imports admin.css
 * - (tenant)/layout.tsx imports tenant.css
 *
 * This root layout does NOT import globals.css to avoid style bleed.
 * The middleware rewrites all requests to the appropriate route group,
 * so this layout is only used as a fallback/wrapper.
 *
 * @see docs/hostname-routing.md for architecture details
 */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Each surface's layout provides its own <html> and <body> tags
  // This just passes children through
  return children;
}
