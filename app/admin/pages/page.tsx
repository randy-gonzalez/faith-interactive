/**
 * Pages List Page
 *
 * Shows all pages with hierarchy, status indicators and actions.
 */

import Link from "next/link";
import { getAuthContext } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { redirect } from "next/navigation";
import { canEditContent } from "@/lib/auth/permissions";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

interface PageWithParent {
  id: string;
  title: string;
  urlPath: string | null;
  parentId: string | null;
  sortOrder: number;
  status: "DRAFT" | "PUBLISHED";
  isHomePage: boolean;
  updatedAt: Date;
}

// Build a hierarchical list of pages for display
function buildPageTree(
  pages: PageWithParent[],
  parentId: string | null = null,
  depth: number = 0
): (PageWithParent & { depth: number })[] {
  const result: (PageWithParent & { depth: number })[] = [];
  const children = pages
    .filter((p) => p.parentId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));

  for (const page of children) {
    result.push({ ...page, depth });
    result.push(...buildPageTree(pages, page.id, depth + 1));
  }

  return result;
}

export default async function PagesListPage() {
  const context = await getAuthContext();
  if (!context) redirect("/login");

  const { user, church } = context;
  const db = getTenantPrisma(church.id);
  const canEdit = canEditContent(user.role);

  const pages = await db.page.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    select: {
      id: true,
      title: true,
      urlPath: true,
      parentId: true,
      sortOrder: true,
      status: true,
      isHomePage: true,
      updatedAt: true,
    },
  });

  // Build hierarchical tree for display
  const pageTree = buildPageTree(pages as PageWithParent[]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Pages
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your website pages
          </p>
        </div>
        {canEdit && (
          <Link href="/admin/pages/new">
            <Button>New Page</Button>
          </Link>
        )}
      </div>

      {/* Pages table */}
      {pages.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No pages yet</p>
          {canEdit && (
            <Link href="/admin/pages/new" className="text-blue-600 hover:underline mt-2 inline-block">
              Create your first page
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL Path
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pageTree.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {page.depth > 0 && (
                        <span className="text-gray-400 mr-1">
                          {"—".repeat(page.depth)}
                        </span>
                      )}
                      {page.title}
                      {page.isHomePage && (
                        <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                          </svg>
                          Home
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {page.urlPath || "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={page.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(page.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    {canEdit ? (
                      <Link
                        href={`/admin/pages/${page.id}/edit`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </Link>
                    ) : (
                      <Link
                        href={`/admin/pages/${page.id}/edit`}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        View
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
