"use client";

/**
 * Text Block Preview Component
 *
 * Live preview rendering of text block.
 */

import type { Block, TextBlock } from "@/types/blocks";
import { getAdvancedProps } from "./block-advanced-editor";
import { useBackgroundStyles } from "@/lib/blocks/use-background-styles";
import { getTextColors } from "@/lib/blocks/get-text-colors";

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
  const textColors = getTextColors(background?.textTheme, background?.type);
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
            className={`prose ${data.maxWidth === "full" ? "prose-lg max-w-none" : ""}`}
            style={{ color: textColors.text }}
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
        ) : (
          <p style={{ color: textColors.subtext, fontStyle: "italic" }}>Add text content...</p>
        )}
      </div>
    </div>
  );
}
