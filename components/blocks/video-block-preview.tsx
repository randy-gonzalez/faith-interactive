"use client";

/**
 * Video Block Preview Component
 *
 * Live preview rendering of video block with YouTube/Vimeo embed.
 *
 * DESIGN SYSTEM COMPLIANCE:
 * - All colors via CSS variables (--color-*, --on-*)
 * - Spacing via CSS variables (--space-*)
 * - Radius via CSS variables (--radius)
 */

import type { Block, VideoBlock } from "@/types/blocks";
import { getAdvancedProps } from "./block-advanced-editor";
import { useBackgroundStyles } from "@/lib/blocks/use-background-styles";
import { getTextColors } from "@/lib/blocks/get-text-colors";
import { SECTION_PADDING_COMPACT } from "@/lib/blocks/block-styles";

interface VideoBlockPreviewProps {
  block: Block;
}

// Parse video URL to get embed URL
function getEmbedUrl(url: string, autoplay: boolean): string | null {
  if (!url) return null;

  // YouTube
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (youtubeMatch) {
    const params = autoplay ? "?autoplay=1&mute=1" : "";
    return `https://www.youtube.com/embed/${youtubeMatch[1]}${params}`;
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    const params = autoplay ? "?autoplay=1&muted=1" : "";
    return `https://player.vimeo.com/video/${vimeoMatch[1]}${params}`;
  }

  return null;
}

export function VideoBlockPreview({ block }: VideoBlockPreviewProps) {
  const videoBlock = block as VideoBlock;
  const { data, background, advanced } = videoBlock;

  const aspectRatioClasses = {
    "16:9": "aspect-video",
    "4:3": "aspect-[4/3]",
    "1:1": "aspect-square",
  };

  const { style: backgroundStyle, overlay } = useBackgroundStyles(background, "transparent");
  const textColors = getTextColors(background?.textTheme, background?.type, background?.color);
  const embedUrl = getEmbedUrl(data.videoUrl, data.autoplay);
  const advancedProps = getAdvancedProps(advanced);
  const combinedClassName = `block-preview ${SECTION_PADDING_COMPACT} relative ${advancedProps.className || ""}`.trim();

  return (
    <div {...advancedProps} className={combinedClassName} style={backgroundStyle}>
      {/* Image overlay (for image backgrounds) */}
      {background?.type === "image" && background.imageUrl && overlay && (
        <div className="absolute inset-0" style={overlay} />
      )}

      <div className="max-w-4xl mx-auto relative z-10">
        {embedUrl ? (
          <div className={`${aspectRatioClasses[data.aspectRatio]} rounded-[var(--radius)] overflow-hidden shadow-lg`}>
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className={`${aspectRatioClasses[data.aspectRatio]} bg-[var(--color-surface-muted)] rounded-[var(--radius)] flex items-center justify-center`}>
            <span className="text-[var(--color-text-muted)]">
              {data.videoUrl ? "Invalid video URL" : "Add a video URL..."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
