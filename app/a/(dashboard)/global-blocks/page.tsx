/**
 * Global Blocks List Page
 *
 * Shows all global blocks with their type, description, and actions.
 */

import Link from "next/link";
import { getAuthContext } from "@/lib/auth/guards";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { redirect } from "next/navigation";
import { canEditContent } from "@/lib/auth/permissions";
import { Button } from "@/components/ui/button";
import { BLOCK_TYPES, type BlockType } from "@/types/blocks";

interface GlobalBlockRow {
  id: string;
  name: string;
  description: string | null;
  blockContent: {
    type: string;
  };
  updatedAt: Date;
}

export default async function GlobalBlocksListPage() {
  const context = await getAuthContext();
  if (!context) redirect("/login");

  const { user, church } = context;
  const db = getTenantPrisma(church.id);
  const canEdit = canEditContent(user.role);

  const globalBlocks = await db.globalBlock.findMany({
    where: { isActive: true },
    orderBy: [{ name: "asc" }],
    select: {
      id: true,
      name: true,
      description: true,
      blockContent: true,
      updatedAt: true,
    },
  });

  // Parse block content for display
  const blocks = globalBlocks.map((block) => {
    const content = block.blockContent as { type?: string } | null;
    return {
      ...block,
      blockContent: {
        type: content?.type || "unknown",
      },
    };
  }) as GlobalBlockRow[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Global Blocks</h1>
          <p className="text-gray-500 mt-1">
            Reusable blocks that can be used across multiple pages
          </p>
        </div>
        {canEdit && (
          <Link href="/global-blocks/new">
            <Button>New Global Block</Button>
          </Link>
        )}
      </div>

      {/* Blocks list */}
      {blocks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <p className="text-gray-500 mb-4">No global blocks yet</p>
          {canEdit && (
            <Link
              href="/global-blocks/new"
              className="text-blue-600 hover:underline"
            >
              Create your first global block
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Block Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
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
              {blocks.map((block) => {
                const blockType = block.blockContent.type as BlockType;
                const typeInfo = BLOCK_TYPES[blockType];

                return (
                  <tr key={block.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {block.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {typeInfo?.name || block.blockContent.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500 line-clamp-1">
                        {block.description || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(block.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {canEdit ? (
                        <Link
                          href={`/global-blocks/${block.id}/edit`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </Link>
                      ) : (
                        <Link
                          href={`/global-blocks/${block.id}/edit`}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          View
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
