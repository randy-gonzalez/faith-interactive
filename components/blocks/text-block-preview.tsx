"use client";

/**
 * Text Block Preview Component
 *
 * Live preview rendering of text block.
 *
 * DESIGN SYSTEM COMPLIANCE:
 * - All colors via CSS variables (--color-*, --on-*)
 * - Spacing via CSS variables (--space-*)
 * - Typography via CSS variables (--font-*, --font-size-*)
 */

import type { Block, TextBlock } from "@/types/blocks";
import { getAdvancedProps } from "./block-advanced-editor";
import { useBackgroundStyles } from "@/lib/blocks/use-background-styles";
import { getTextColors } from "@/lib/blocks/get-text-colors";
import { SECTION_PADDING } from "@/lib/blocks/block-styles";

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
  const textColors = getTextColors(background?.textTheme, background?.type, background?.color);
  const advancedProps = getAdvancedProps(advanced);
  const combinedClassName = `block-preview ${SECTION_PADDING} relative ${advancedProps.className || ""}`.trim();

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
            className={`prose prose-headings:font-[var(--font-heading)] prose-p:font-[var(--font-body)] ${data.maxWidth === "full" ? "prose-lg max-w-none" : ""}`}
            style={{ color: textColors.text }}
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
        ) : (
          <p className="italic text-[var(--color-text-muted)]">
            Add text content...
          </p>
        )}
      </div>
    </div>
  );
}
