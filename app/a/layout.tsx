/**
 * Admin Surface Root Layout
 *
 * Minimal root layout for the admin surface (admin.faith-interactive.com or admin.localhost).
 * This layout provides the html/body wrapper and CSS for all admin routes.
 *
 * Route structure:
 * - /(auth)/* - Auth pages (login, forgot-password, etc.) - no auth required
 * - /(dashboard)/* - Protected pages with dashboard chrome - auth required
 *
 * Note: Auth checks and dashboard chrome are in the (dashboard) layout,
 * NOT here, so that auth pages don't trigger redirect loops.
 */

import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: {
    default: "Church Admin",
    template: "%s | Church Admin",
  },
  description: "Manage your church website and content",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
