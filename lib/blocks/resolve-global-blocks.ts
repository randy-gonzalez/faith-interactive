/**
 * Global Block Resolver
 *
 * Resolves global block references to their actual block content.
 * Used when rendering pages to replace GlobalBlockReference blocks
 * with the actual block content.
 */

import type { Block, GlobalBlockReference } from "@/types/blocks";
import { getTenantPrisma } from "@/lib/db/tenant-prisma";
import { logger } from "@/lib/logging/logger";

interface GlobalBlockData {
  id: string;
  blockContent: unknown;
  name: string;
}

/**
 * Resolve all global block references in a list of blocks.
 * Replaces GlobalBlockReference blocks with the actual block content.
 *
 * @param blocks - Array of blocks that may contain global block references
 * @param churchId - The church ID for tenant scoping
 * @returns Array of blocks with global references resolved to actual content
 */
export async function resolveGlobalBlocks(
  blocks: Block[],
  churchId: string
): Promise<Block[]> {
  // Find all global block references
  const globalBlockRefs = blocks.filter(
    (block): block is GlobalBlockReference => block.type === "global-block"
  );

  if (globalBlockRefs.length === 0) {
    return blocks;
  }

  // Get unique global block IDs
  const globalBlockIds = [...new Set(globalBlockRefs.map((ref) => ref.data.globalBlockId))];

  // Fetch all referenced global blocks in a single query
  const db = getTenantPrisma(churchId);
  const globalBlocks = await db.globalBlock.findMany({
    where: {
      id: { in: globalBlockIds },
      isActive: true,
    },
    select: {
      id: true,
      blockContent: true,
      name: true,
    },
  });

  // Create a map for quick lookup
  const globalBlockMap = new Map<string, GlobalBlockData>();
  for (const block of globalBlocks) {
    globalBlockMap.set(block.id, block as GlobalBlockData);
  }

  // Replace references with actual content
  const resolvedBlocks: Block[] = [];

  for (const block of blocks) {
    if (block.type === "global-block") {
      const ref = block as GlobalBlockReference;
      const globalBlock = globalBlockMap.get(ref.data.globalBlockId);

      if (globalBlock && globalBlock.blockContent) {
        // Replace with the actual block content, preserving the order
        const resolvedBlock = globalBlock.blockContent as Block;
        resolvedBlocks.push({
          ...resolvedBlock,
          id: block.id, // Keep the reference ID for uniqueness
          order: block.order, // Keep the original order
        });
      } else {
        // Global block not found - add a placeholder
        logger.warn("Global block not found", {
          globalBlockId: ref.data.globalBlockId,
          churchId,
        });
        resolvedBlocks.push({
          ...block,
          type: "text" as const,
          data: {
            content: `<h3 class="text-lg font-medium text-gray-900 mb-2">Block Not Found</h3><p class="text-gray-500 italic">The global block "${ref.data.cachedName || "Unknown"}" could not be found.</p>`,
            alignment: "center" as const,
            maxWidth: "medium" as const,
          },
        });
      }
    } else {
      resolvedBlocks.push(block);
    }
  }

  return resolvedBlocks;
}

/**
 * Check if any blocks contain global block references.
 * Useful for determining if resolution is needed.
 */
export function hasGlobalBlockReferences(blocks: Block[]): boolean {
  return blocks.some((block) => block.type === "global-block");
}

/**
 * Get all global block IDs referenced in a list of blocks.
 * Useful for pre-fetching or validation.
 */
export function getGlobalBlockIds(blocks: Block[]): string[] {
  return blocks
    .filter((block): block is GlobalBlockReference => block.type === "global-block")
    .map((block) => block.data.globalBlockId);
}
