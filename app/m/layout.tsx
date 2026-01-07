/**
 * Marketing Layout
 *
 * Faith Interactive: Design agency for churches.
 * Bold. Portfolio-led. Agency aesthetic.
 */

import type { Metadata } from "next";
import { buildSurfaceUrl } from "@/lib/hostname/parser";
import { OrganizationSchema } from "@/components/marketing/structured-data";
import { MarketingNav } from "@/components/marketing/nav";
import { FiLogo } from "@/components/ui/fi-logo";
import "./marketing.css";

export const metadata: Metadata = {
  title: {
    default: "Faith Interactive | Church Website Design",
    template: "%s | Faith Interactive",
  },
  description:
    "A design studio for churches. We create websites that don't look like church websites.",
  keywords: [
    "church website design",
    "church branding",
    "faith interactive",
    "church web design agency",
  ],
  openGraph: {
    type: "website",
    siteName: "Faith Interactive",
    title: "Faith Interactive | Church Website Design",
    description: "A design studio for churches.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Faith Interactive",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Faith Interactive | Church Website Design",
    description: "A design studio for churches.",
    images: ["/og-image.jpg"],
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isLocal = process.env.NODE_ENV !== "production";
  const loginUrl = buildSurfaceUrl("admin", "/login", { isLocal, useLocalhost: isLocal });

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <OrganizationSchema />
      </head>
      <body className="antialiased">
        <MarketingNav loginUrl={loginUrl} />

        {/* Main Content */}
        <main>{children}</main>

        {/* Footer */}
        <footer className="site-footer">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
              {/* Brand */}
              <div className="md:col-span-2">
                <div className="mb-6">
                  <FiLogo variant="horizontal" colorMode="light" size={36} />
                </div>
                <p className="text-[#737373] max-w-xs">
                  A web design studio for churches.
                </p>
              </div>

              {/* Navigation */}
              <div>
                <p className="text-micro text-[#737373] mb-4">Navigate</p>
                <ul className="space-y-3">
                  <li>
                    <a href="/work" className="footer-link">Work</a>
                  </li>
                  <li>
                    <a href="/services" className="footer-link">Services</a>
                  </li>
                  <li>
                    <a href="/about" className="footer-link">About</a>
                  </li>
                  <li>
                    <a href="/pricing" className="footer-link">Pricing</a>
                  </li>
                  <li>
                    <a href="/trends" className="footer-link">Trends</a>
                  </li>
                  <li>
                    <a href="/platform" className="footer-link">Platform</a>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <p className="text-micro text-[#737373] mb-4">Contact</p>
                <ul className="space-y-3">
                  <li>
                    <a href="mailto:hello@faith-interactive.com" className="footer-link">
                      hello@faith-interactive.com
                    </a>
                  </li>
                  <li className="text-[#737373] text-sm">
                    Orange County, California
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom */}
            <div className="border-t border-[#262626] mt-12 pt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <p className="text-[#525252] text-sm">
                &copy; {new Date().getFullYear()} Faith Interactive
              </p>
              <a href={loginUrl} className="footer-link text-sm">
                Client Login
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
