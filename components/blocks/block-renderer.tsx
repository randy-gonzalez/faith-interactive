/**
 * Block Renderer Component
 *
 * Component that renders blocks array to HTML for public pages.
 * This is used on the public-facing website to display page content.
 */

import type { Block } from "@/types/blocks";
import { HeroBlockPreview } from "./hero-block-preview";
import { TextBlockPreview } from "./text-block-preview";
import { ImageBlockPreview } from "./image-block-preview";
import { VideoBlockPreview } from "./video-block-preview";
import { CardGridBlockPreview } from "./card-grid-block-preview";
import { FeatureBlockPreview } from "./feature-block-preview";
import { ServiceTimesBlockPreview } from "./service-times-block-preview";
import { ContactBlockPreview } from "./contact-block-preview";
import { SermonFeatureBlockPreview } from "./sermon-feature-block-preview";
import { EventsFeatureBlockPreview } from "./events-feature-block-preview";
import { AccordionBlockPreview } from "./accordion-block-preview";
import { DividerBlockPreview } from "./divider-block-preview";
import { ButtonGroupBlockPreview } from "./button-group-block-preview";

interface BlockRendererProps {
  blocks: unknown; // JSON from database
}

// Type guard to validate block structure
function isValidBlock(block: unknown): block is Block {
  if (!block || typeof block !== "object") return false;
  const b = block as Record<string, unknown>;
  return (
    typeof b.id === "string" &&
    typeof b.type === "string" &&
    typeof b.order === "number"
  );
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
  // Parse blocks from JSON if needed
  const parsedBlocks: Block[] = Array.isArray(blocks)
    ? (blocks.filter(isValidBlock) as Block[])
    : [];

  if (parsedBlocks.length === 0) {
    return null;
  }

  // Sort by order
  const sortedBlocks = [...parsedBlocks].sort((a, b) => a.order - b.order);

  return (
    <div className="block-content">
      {sortedBlocks.map((block) => {
        switch (block.type) {
          case "hero":
            return <HeroBlockPreview key={block.id} block={block} />;
          case "text":
            return <TextBlockPreview key={block.id} block={block} />;
          case "image":
            return <ImageBlockPreview key={block.id} block={block} />;
          case "video":
            return <VideoBlockPreview key={block.id} block={block} />;
          case "card-grid":
            return <CardGridBlockPreview key={block.id} block={block} />;
          case "feature":
            return <FeatureBlockPreview key={block.id} block={block} />;
          case "service-times":
            return <ServiceTimesBlockPreview key={block.id} block={block} />;
          case "contact":
            return <ContactBlockPreview key={block.id} block={block} />;
          case "sermon-feature":
            return <SermonFeatureBlockPreview key={block.id} block={block} />;
          case "events-feature":
            return <EventsFeatureBlockPreview key={block.id} block={block} />;
          case "accordion":
            return <AccordionBlockPreview key={block.id} block={block} />;
          case "divider":
            return <DividerBlockPreview key={block.id} block={block} />;
          case "button-group":
            return <ButtonGroupBlockPreview key={block.id} block={block} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
