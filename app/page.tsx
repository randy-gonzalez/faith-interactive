import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { ChurchHomePage } from "@/components/public/church-home-page";
import { BlockRenderer } from "@/components/blocks/block-renderer";

/**
 * Home Page
 *
 * Routes based on context:
 * - Main domain (marketing site): Shows marketing home page or default welcome
 * - Subdomain (church site): Shows public church website
 *
 * The site type is determined by middleware and passed via x-site-type header.
 *
 * Note: Authenticated users on church subdomains see the public site.
 * They can navigate to /admin to access the dashboard.
 */

export default async function HomePage() {
  const headerStore = await headers();
  const siteType = headerStore.get("x-site-type");
  const churchSlug = headerStore.get("x-church-slug");

  // If on a church subdomain/custom domain, show the public church site
  if (siteType === "church" || churchSlug) {
    return <ChurchHomePage />;
  }

  // This is the marketing site
  // Get settings to find home page slug
  const settings = await prisma.marketingSiteSettings.findFirst();
  const homeSlug = settings?.homePageSlug || "home";

  // Get the home page
  const page = await prisma.marketingPage.findUnique({
    where: { slug: homeSlug, status: "PUBLISHED" },
  });

  // Get nav items for header
  const navItems = (settings?.headerNavigation as { label: string; url: string; order: number }[]) || [];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="text-xl font-bold text-indigo-600">
              {settings?.siteName || "Faith Interactive"}
            </a>
            <nav className="hidden md:flex items-center gap-6">
              {navItems
                .sort((a, b) => a.order - b.order)
                .map((item) => (
                  <a
                    key={item.url}
                    href={item.url}
                    className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                  >
                    {item.label}
                  </a>
                ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {page ? (
          <BlockRenderer blocks={page.blocks} />
        ) : (
          <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700">
            <div className="text-center text-white px-4">
              <h1 className="text-5xl font-bold mb-4">Faith Interactive</h1>
              <p className="text-xl text-indigo-100 mb-8 max-w-2xl">
                Beautiful, easy-to-manage websites for churches of all sizes.
              </p>
              <a
                href="/contact"
                className="inline-block px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Get Started
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gray-400 text-sm text-center">
            {settings?.footerText || `© ${new Date().getFullYear()} Faith Interactive. All rights reserved.`}
          </p>
        </div>
      </footer>
    </div>
  );
}
