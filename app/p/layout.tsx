/**
 * Platform Surface Root Layout
 *
 * Minimal root layout for the platform surface (platform.faith-interactive.com or platform.localhost).
 * This layout provides the html/body wrapper and CSS for all platform routes.
 *
 * Route structure:
 * - /(auth)/* - Auth pages (login redirect) - no auth required
 * - /(dashboard)/* - Protected pages with platform chrome - auth required
 *
 * Note: Auth checks and dashboard chrome are in the (dashboard) layout,
 * NOT here, so that auth pages don't trigger redirect loops.
 */

import type { Metadata } from "next";
import "./platform.css";

export const metadata: Metadata = {
  title: {
    default: "Faith Interactive Platform",
    template: "%s | Fi Platform",
  },
  description: "Faith Interactive internal platform for managing churches",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PlatformRootLayout({
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
