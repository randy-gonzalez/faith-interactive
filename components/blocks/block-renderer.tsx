/**
 * Block Renderer Component
 *
 * Component that renders blocks array to HTML for public pages.
 * This is used on the public-facing website to display page content.
 *
 * Note: This is a server component that can render async components
 * like SermonFeatureBlockServer which fetches data from the database.
 */

import type { Block, PopupBlock } from "@/types/blocks";
import { HeroBlockPreview } from "./hero-block-preview";
import { TextBlockPreview } from "./text-block-preview";
import { ImageBlockPreview } from "./image-block-preview";
import { VideoBlockPreview } from "./video-block-preview";
import { CardGridBlockPreview } from "./card-grid-block-preview";
import { FeatureBlockPreview } from "./feature-block-preview";
import { ServiceTimesBlockPreview } from "./service-times-block-preview";
import { ContactBlockPreview } from "./contact-block-preview";
import { SermonFeatureBlockServer } from "./sermon-feature-block-server";
import { EventsFeatureBlockServer } from "./events-feature-block-server";
import { AccordionBlockPreview } from "./accordion-block-preview";
import { DividerBlockPreview } from "./divider-block-preview";
import { ButtonGroupBlockPreview } from "./button-group-block-preview";
import { CustomHtmlBlockPreview } from "./custom-html-block-preview";
import { FormBlockPreview } from "./form-block-preview";
import { WatchLiveBlockPreview } from "./watch-live-block-preview";
import { PopupRenderer } from "@/components/public/popup-renderer";

interface BlockRendererProps {
  blocks: unknown; // JSON from database
  churchId?: string; // Required for data-fetching blocks (sermon-feature, events-feature)
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

export function BlockRenderer({ blocks, churchId }: BlockRendererProps) {
  // Parse blocks from JSON if needed
  const parsedBlocks: Block[] = Array.isArray(blocks)
    ? (blocks.filter(isValidBlock) as Block[])
    : [];

  if (parsedBlocks.length === 0) {
    return null;
  }

  // Sort by order
  const sortedBlocks = [...parsedBlocks].sort((a, b) => a.order - b.order);

  // Separate popups from regular blocks - popups are rendered via PopupRenderer
  const regularBlocks = sortedBlocks.filter((block) => block.type !== "popup");
  const popupBlocks = sortedBlocks.filter((block) => block.type === "popup") as PopupBlock[];

  return (
    <>
      <div className="block-content">
        {regularBlocks.map((block) => {
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
              // Use server component to fetch real sermon data
              return churchId ? (
                <SermonFeatureBlockServer key={block.id} block={block} churchId={churchId} />
              ) : null;
            case "events-feature":
              // Use server component to fetch real event data
              return churchId ? (
                <EventsFeatureBlockServer key={block.id} block={block} churchId={churchId} />
              ) : null;
            case "accordion":
              return <AccordionBlockPreview key={block.id} block={block} />;
            case "divider":
              return <DividerBlockPreview key={block.id} block={block} />;
            case "button-group":
              return <ButtonGroupBlockPreview key={block.id} block={block} />;
            case "custom-html":
              return <CustomHtmlBlockPreview key={block.id} block={block} />;
            case "form":
              return <FormBlockPreview key={block.id} block={block} />;
            case "watch-live":
              return <WatchLiveBlockPreview key={block.id} block={block} />;
            case "global-block":
              // Global block references should be resolved before rendering
              // If we reach here, show a placeholder
              return (
                <div key={block.id} className="px-6 py-8 text-center text-gray-400">
                  Global block not resolved
                </div>
              );
            default:
              return null;
          }
        })}
      </div>

      {/* Render popups - handled collectively by PopupRenderer */}
      {popupBlocks.length > 0 && <PopupRenderer popups={popupBlocks} />}
    </>
  );
}
