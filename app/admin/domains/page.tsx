/**
 * Custom Domains Management Page
 *
 * Admin-only page for managing custom domains.
 * Allows adding, verifying, and removing custom domains.
 */

import { getAuthContext } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { DomainsManager } from "@/components/dashboard/domains-manager";

export default async function DomainsPage() {
  const context = await getAuthContext();
  if (!context) redirect("/login");

  const { user, church } = context;

  // Admin only
  if (user.role !== "ADMIN") {
    redirect("/admin/dashboard");
  }

  // Get existing domains
  const domains = await prisma.customDomain.findMany({
    where: { churchId: church.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Custom Domains
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Connect your own domain to your church website
        </p>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h2 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
          How Custom Domains Work
        </h2>
        <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-decimal list-inside">
          <li>Add your domain below (e.g., www.yourchurch.org)</li>
          <li>Add a DNS TXT record to verify ownership</li>
          <li>Point your domain to our servers (CNAME or A record)</li>
          <li>We&apos;ll automatically provision SSL for your domain</li>
        </ol>
      </div>

      {/* Domains Manager */}
      <DomainsManager initialDomains={domains} churchSlug={church.slug} />
    </div>
  );
}
