/**
 * Marketing Layout
 *
 * Root layout for the Faith Interactive marketing website.
 * Accessible at faith-interactive.com (production) or faith-interactive.local (dev).
 *
 * This layout is completely isolated from other surfaces:
 * - Has its own CSS import
 * - Has its own navigation
 * - Has no tenant context
 */

import type { Metadata } from "next";
import Image from "next/image";
import { buildSurfaceUrl } from "@/lib/hostname/parser";
import { OrganizationSchema } from "@/components/marketing/structured-data";
import "./marketing.css";

export const metadata: Metadata = {
  title: {
    default: "Faith Interactive - Church Website Design & Development",
    template: "%s | Faith Interactive",
  },
  description:
    "Beautiful church websites starting at FREE for church plants. Website design, SEO services, and VPS cloud hosting. Call (833) 307-1917 for a free consultation.",
  keywords: [
    "church website design",
    "church website development",
    "church SEO",
    "church hosting",
    "faith interactive",
    "church website builder",
  ],
  openGraph: {
    type: "website",
    siteName: "Faith Interactive",
    title: "Faith Interactive - Church Website Design & Development",
    description:
      "Beautiful church websites starting at FREE for church plants. Website design, SEO, and hosting.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Faith Interactive - Church Website Design",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Faith Interactive - Church Website Design & Development",
    description:
      "Beautiful church websites starting at FREE for church plants.",
    images: ["/og-image.jpg"],
  },
};

const NAV_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

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
        <OrganizationSchema />
      </head>
      <body className="antialiased min-h-screen">
        {/* Marketing Header */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-100">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <a href="/" className="flex items-center space-x-3">
                <Image
                  src="/faith-interactive-logo.png"
                  alt="Faith Interactive"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
                <span className="text-xl font-bold text-[#000646]">
                  Faith Interactive
                </span>
              </a>

              {/* Navigation */}
              <div className="hidden md:flex items-center space-x-6">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-[#000646]/70 hover:text-[#000646] font-medium transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex items-center space-x-4">
                <a
                  href="tel:+18333071917"
                  className="hidden lg:flex items-center gap-2 text-[#000646]/70 hover:text-[#000646] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  (833) 307-1917
                </a>
                <a
                  href={loginUrl}
                  className="text-[#000646]/70 hover:text-[#000646] font-medium transition-colors"
                >
                  Sign In
                </a>
                <a
                  href="/contact"
                  className="btn-marketing-primary"
                >
                  Free Consultation
                </a>
              </div>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main>{children}</main>

        {/* Marketing Footer */}
        <footer className="bg-[#000646] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              {/* Brand */}
              <div className="lg:col-span-1">
                <div className="flex items-center space-x-3 mb-4">
                  <Image
                    src="/faith-interactive-logo.png"
                    alt="Faith Interactive"
                    width={40}
                    height={40}
                    className="w-10 h-10"
                  />
                  <span className="text-xl font-bold">Faith Interactive</span>
                </div>
                <p className="text-gray-400 mb-6">
                  Empowering churches to build beautiful, effective digital
                  experiences that help communities grow.
                </p>
                <div className="flex items-center gap-2">
                  <a
                    href="tel:+18333071917"
                    className="text-lg font-semibold text-white hover:text-[#00ffce] transition-colors"
                  >
                    (833) 307-1917
                  </a>
                </div>
              </div>

              {/* Services */}
              <div>
                <h4 className="font-semibold mb-4 text-[#00ffce]">Services</h4>
                <ul className="space-y-3 text-gray-400">
                  <li>
                    <a href="/services/website-design" className="hover:text-white transition-colors">
                      Website Design
                    </a>
                  </li>
                  <li>
                    <a href="/services/seo" className="hover:text-white transition-colors">
                      SEO Services
                    </a>
                  </li>
                  <li>
                    <a href="/services/hosting" className="hover:text-white transition-colors">
                      Cloud Hosting
                    </a>
                  </li>
                  <li>
                    <a href="/pricing" className="hover:text-white transition-colors">
                      Pricing
                    </a>
                  </li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h4 className="font-semibold mb-4 text-[#00ffce]">Resources</h4>
                <ul className="space-y-3 text-gray-400">
                  <li>
                    <a href="/case-studies" className="hover:text-white transition-colors">
                      Case Studies
                    </a>
                  </li>
                  <li>
                    <a href="/blog" className="hover:text-white transition-colors">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="/faq" className="hover:text-white transition-colors">
                      FAQ
                    </a>
                  </li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className="font-semibold mb-4 text-[#00ffce]">Company</h4>
                <ul className="space-y-3 text-gray-400">
                  <li>
                    <a href="/about" className="hover:text-white transition-colors">
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="/contact" className="hover:text-white transition-colors">
                      Contact
                    </a>
                  </li>
                  <li>
                    <a href="/privacy" className="hover:text-white transition-colors">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="/terms" className="hover:text-white transition-colors">
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} Faith Interactive. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <a
                  href="/contact"
                  className="text-sm text-[#00ffce] hover:text-white transition-colors font-medium"
                >
                  Get Your Free Consultation →
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
