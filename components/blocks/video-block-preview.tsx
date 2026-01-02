"use client";

/**
 * Video Block Preview Component
 *
 * Live preview rendering of video block with YouTube/Vimeo embed.
 */

import type { Block, VideoBlock, BlockBackground } from "@/types/blocks";
import { getAdvancedProps } from "./block-advanced-editor";

interface VideoBlockPreviewProps {
  block: Block;
}

function getBackgroundStyles(background?: BlockBackground): React.CSSProperties {
  if (!background) return {};

  switch (background.type) {
    case "color":
      return { backgroundColor: background.color || "transparent" };
    case "gradient":
      return { background: background.gradient };
    case "image":
      if (background.imageUrl) {
        const overlay = background.overlay || "rgba(0,0,0,0.5)";
        return {
          backgroundImage: `linear-gradient(${overlay}, ${overlay}), url(${background.imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        };
      }
      return {};
    default:
      return {};
  }
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

  const backgroundStyle = getBackgroundStyles(background);
  const embedUrl = getEmbedUrl(data.videoUrl, data.autoplay);
  const advancedProps = getAdvancedProps(advanced);
  const combinedClassName = `py-8 px-6 ${advancedProps.className || ""}`.trim();

  return (
    <div {...advancedProps} className={combinedClassName} style={backgroundStyle}>
      <div className="max-w-4xl mx-auto">
        {embedUrl ? (
          <div className={`${aspectRatioClasses[data.aspectRatio]} rounded-lg overflow-hidden shadow-lg`}>
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className={`${aspectRatioClasses[data.aspectRatio]} bg-gray-200 rounded-lg flex items-center justify-center`}>
            <span className="text-gray-400">
              {data.videoUrl ? "Invalid video URL" : "Add a video URL..."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
