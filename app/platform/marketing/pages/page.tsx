/**
 * Marketing Pages List Page
 *
 * List all marketing pages with hierarchy and management capabilities.
 */

import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { requirePlatformUserOrRedirect, isPlatformAdmin } from "@/lib/auth/guards";

interface MarketingPageItem {
  id: string;
  title: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
  status: string;
  updatedAt: Date;
}

// Build a hierarchical list of pages for display
function buildPageTree(
  pages: MarketingPageItem[],
  parentId: string | null = null,
  depth: number = 0
): (MarketingPageItem & { depth: number })[] {
  const result: (MarketingPageItem & { depth: number })[] = [];
  const children = pages
    .filter((p) => p.parentId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));

  for (const page of children) {
    result.push({ ...page, depth });
    result.push(...buildPageTree(pages, page.id, depth + 1));
  }

  return result;
}

export default async function MarketingPagesPage() {
  const user = await requirePlatformUserOrRedirect();
  const canEdit = isPlatformAdmin(user);

  const pages = await prisma.marketingPage.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      parentId: true,
      sortOrder: true,
      status: true,
      updatedAt: true,
    },
  });

  // Build hierarchical tree for display
  const pageTree = buildPageTree(pages as MarketingPageItem[]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing Pages</h1>
          <p className="text-gray-600">
            Manage the public Faith Interactive marketing website.
          </p>
        </div>
        {canEdit && (
          <Link
            href="/platform/marketing/pages/new"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Create Page
          </Link>
        )}
      </div>

      {/* Pages table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {pages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No marketing pages yet.</p>
            {canEdit && (
              <Link
                href="/platform/marketing/pages/new"
                className="text-indigo-600 hover:text-indigo-800 mt-2 inline-block"
              >
                Create your first page
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Page
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pageTree.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">
                      {page.depth > 0 && (
                        <span className="text-gray-400 mr-1">
                          {"—".repeat(page.depth)}
                        </span>
                      )}
                      {page.title}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={page.status} />
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      /{page.slug}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(page.updatedAt)}
                  </td>
                  <td className="px-6 py-4 text-right space-x-4">
                    {page.status === "PUBLISHED" && (
                      <a
                        href={`/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900 text-sm"
                      >
                        View
                      </a>
                    )}
                    <Link
                      href={`/platform/marketing/pages/${page.id}`}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isPublished = status === "PUBLISHED";
  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
        isPublished
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-700"
      }`}
    >
      {isPublished ? "Published" : "Draft"}
    </span>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
