/**
 * Marketing Layout
 *
 * Faith Interactive: Design agency for churches.
 * Bold. Portfolio-led. Agency aesthetic.
 */

import type { Metadata } from "next";
import { OrganizationSchema } from "@/components/marketing/structured-data";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
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
  },
  twitter: {
    card: "summary_large_image",
    title: "Faith Interactive | Church Website Design",
    description: "A design studio for churches.",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <GoogleAnalytics />
      </head>
      <body className="antialiased">
        <MarketingNav />

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
                <p className="text-[#828282]">
                  But those who wait on the Lord<br/>
                  Shall renew their strength;<br/>
                  They shall mount up with wings like eagles,<br/>
                  They shall run and not be weary,<br/>
                  They shall walk and not faint.<br/><br/>
                  <strong>Isaiah 40:31</strong>
                </p>
              </div>

              {/* Navigation */}
              <div>
                <p className="text-micro text-[#828282] mb-4">Navigate</p>
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
                <p className="text-micro text-[#828282] mb-4">Contact</p>
                <ul className="space-y-3 text-[#828282]">
                  <li>
                    Faith Interactive
                  </li>
                  <li>
                    <a href="tel:+19498054031" className="footer-link">
                      (949) 805-4031
                    </a>
                  </li>
                  <li className="text-sm">
                    Orange County, California
                  </li>
                  <li className="mt-4">
                    <a href="/contact" className="inline-block border border-[#828282] text-[#828282] px-5 py-2 transition-colors duration-300 hover:border-white hover:text-white">
                      Start A Project
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom */}
            <div className="border-t border-[#262626] mt-12 pt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <p className="text-[#525252] text-sm">
                &copy; {new Date().getFullYear()} Faith Interactive - A ministry of <a className="footer-link" href="https://shiftagency.com/"><u>Shift Agency, LLC</u></a>
              </p>
              <a href="/privacy" className="footer-link text-sm">
                Privacy & Terms
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
