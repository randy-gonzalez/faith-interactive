/**
 * Events Feature Block Server Component
 *
 * Server-side component that fetches event data from the database
 * and passes it to the client preview component.
 */

import { prisma } from "@/lib/db/prisma";
import type { Block, EventsFeatureBlock } from "@/types/blocks";
import { EventsFeatureBlockPreview, type EventData } from "./events-feature-block-preview";

interface EventsFeatureBlockServerProps {
  block: Block;
  churchId: string;
}

/**
 * Format a date for display in the event card
 */
function formatEventDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format event time(s) for display
 */
function formatEventTime(startTime: Date, endTime?: Date | null): string {
  const start = startTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (endTime) {
    const end = endTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${start} - ${end}`;
  }

  return start;
}

export async function EventsFeatureBlockServer({ block, churchId }: EventsFeatureBlockServerProps) {
  const eventsBlock = block as EventsFeatureBlock;
  const { data } = eventsBlock;

  // Fetch upcoming events from database
  const now = new Date();
  const dbEvents = await prisma.event.findMany({
    where: {
      churchId,
      status: "PUBLISHED",
      startDate: {
        gte: now,
      },
    },
    orderBy: {
      startDate: "asc",
    },
    take: data.count,
    include: {
      venue: {
        select: {
          name: true,
        },
      },
    },
  });

  // Transform to EventData format
  const events: EventData[] = dbEvents.map((event) => ({
    id: event.id,
    title: event.title,
    date: formatEventDate(event.startDate),
    time: formatEventTime(event.startDate, event.endDate),
    location: event.venue?.name || event.location || undefined,
    description: event.description || undefined,
  }));

  return (
    <EventsFeatureBlockPreview
      block={block}
      events={events}
      isPreview={false}
    />
  );
}
