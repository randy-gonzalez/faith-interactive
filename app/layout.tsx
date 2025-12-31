import type { Metadata } from "next";
import "./globals.css";

/**
 * Root Layout
 *
 * Base layout for all pages in the application.
 * Minimal setup for Phase 0.
 */

export const metadata: Metadata = {
  title: "Faith Interactive",
  description: "Church management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
