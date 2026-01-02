"use client";

/**
 * Text Block Preview Component
 *
 * Live preview rendering of text block.
 */

import type { Block, TextBlock, BlockBackground } from "@/types/blocks";
import { getAdvancedProps } from "./block-advanced-editor";

interface TextBlockPreviewProps {
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

export function TextBlockPreview({ block }: TextBlockPreviewProps) {
  const textBlock = block as TextBlock;
  const { data, background, advanced } = textBlock;

  const alignmentClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  const maxWidthClasses = {
    narrow: "max-w-2xl",
    medium: "max-w-4xl",
    full: "max-w-none",
  };

  const backgroundStyle = getBackgroundStyles(background);
  const hasBackground = background && background.type !== "color";
  const textColorClass = hasBackground ? "text-white" : "text-gray-900";
  const advancedProps = getAdvancedProps(advanced);
  const combinedClassName = `py-12 px-6 ${advancedProps.className || ""}`.trim();

  return (
    <div
      {...advancedProps}
      className={combinedClassName}
      style={backgroundStyle}
    >
      <div className={`mx-auto ${maxWidthClasses[data.maxWidth]} ${alignmentClasses[data.alignment]}`}>
        {data.content ? (
          <div
            className={`prose ${data.maxWidth === "full" ? "prose-lg max-w-none" : ""} ${textColorClass}`}
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
        ) : (
          <p className="text-gray-400 italic">Add text content...</p>
        )}
      </div>
    </div>
  );
}
