"use client";

/**
 * Text Block Preview Component
 *
 * Live preview rendering of text block.
 */

import type { Block, TextBlock } from "@/types/blocks";
import { getAdvancedProps } from "./block-advanced-editor";
import { useBackgroundStyles } from "@/lib/blocks/use-background-styles";

interface TextBlockPreviewProps {
  block: Block;
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

  const { style: backgroundStyle, overlay } = useBackgroundStyles(background, "transparent");
  const hasBackground = background && background.type !== "color";
  const textColorClass = hasBackground ? "text-white" : "text-gray-900";
  const advancedProps = getAdvancedProps(advanced);
  const combinedClassName = `block-preview py-12 px-6 relative ${advancedProps.className || ""}`.trim();

  return (
    <div
      {...advancedProps}
      className={combinedClassName}
      style={backgroundStyle}
    >
      {/* Image overlay (for image backgrounds) */}
      {background?.type === "image" && background.imageUrl && overlay && (
        <div className="absolute inset-0" style={overlay} />
      )}

      <div className={`mx-auto relative z-10 ${maxWidthClasses[data.maxWidth]} ${alignmentClasses[data.alignment]}`}>
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
