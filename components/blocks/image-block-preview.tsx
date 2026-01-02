"use client";

/**
 * Image Block Preview Component
 *
 * Live preview rendering of image block.
 */

import type { Block, ImageBlock, BlockBackground } from "@/types/blocks";
import { getAdvancedProps } from "./block-advanced-editor";

interface ImageBlockPreviewProps {
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

export function ImageBlockPreview({ block }: ImageBlockPreviewProps) {
  const imageBlock = block as ImageBlock;
  const { data, background, advanced } = imageBlock;

  const alignmentClasses = {
    left: "items-start",
    center: "items-center",
    right: "items-end",
  };

  const sizeClasses = {
    small: "max-w-sm",
    medium: "max-w-xl",
    large: "max-w-3xl",
    full: "max-w-none w-full",
  };

  const backgroundStyle = getBackgroundStyles(background);
  const advancedProps = getAdvancedProps(advanced);
  const combinedClassName = `py-8 px-6 flex flex-col ${alignmentClasses[data.alignment]} ${advancedProps.className || ""}`.trim();

  return (
    <div
      {...advancedProps}
      className={combinedClassName}
      style={backgroundStyle}
    >
      {data.imageUrl ? (
        <figure className={sizeClasses[data.size]}>
          <img
            src={data.imageUrl}
            alt={data.alt}
            className="w-full h-auto rounded-lg shadow-md"
          />
          {data.caption && (
            <figcaption className="mt-3 text-sm text-gray-600 text-center">
              {data.caption}
            </figcaption>
          )}
        </figure>
      ) : (
        <div className="w-full max-w-xl aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-gray-400">Add an image URL...</span>
        </div>
      )}
    </div>
  );
}
