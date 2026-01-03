/**
 * Sermon Feature Block Server Component
 *
 * Server-side component that fetches sermon data from the database
 * and passes it to the client preview component.
 */

import { prisma } from "@/lib/db/prisma";
import type { Block, SermonFeatureBlock } from "@/types/blocks";
import { SermonFeatureBlockPreview, type SermonData } from "./sermon-feature-block-preview";

interface SermonFeatureBlockServerProps {
  block: Block;
  churchId: string;
}

/**
 * Format a date for display in the sermon card
 */
function formatSermonDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export async function SermonFeatureBlockServer({ block, churchId }: SermonFeatureBlockServerProps) {
  const sermonBlock = block as SermonFeatureBlock;
  const { data } = sermonBlock;

  // Fetch sermons from database
  const dbSermons = await prisma.sermon.findMany({
    where: {
      churchId,
      status: "PUBLISHED",
    },
    orderBy: {
      date: "desc",
    },
    take: data.count,
    include: {
      speaker: {
        select: {
          name: true,
        },
      },
    },
  });

  // Transform to SermonData format
  const sermons: SermonData[] = dbSermons.map((sermon) => ({
    id: sermon.id,
    title: sermon.title,
    speaker: sermon.speaker?.name || sermon.speakerName || "Unknown Speaker",
    date: formatSermonDate(sermon.date),
    description: sermon.description || undefined,
  }));

  return (
    <SermonFeatureBlockPreview
      block={block}
      sermons={sermons}
      isPreview={false}
    />
  );
}
