"use client";

/**
 * Image Block Preview Component
 *
 * Live preview rendering of image block.
 *
 * DESIGN SYSTEM COMPLIANCE:
 * - All colors via CSS variables (--color-*, --on-*)
 * - Spacing via CSS variables (--space-*)
 * - Radius via CSS variables (--radius)
 */

import type { Block, ImageBlock } from "@/types/blocks";
import { getAdvancedProps } from "./block-advanced-editor";
import { useBackgroundStyles } from "@/lib/blocks/use-background-styles";
import { getTextColors } from "@/lib/blocks/get-text-colors";
import { SECTION_PADDING_COMPACT } from "@/lib/blocks/block-styles";

interface ImageBlockPreviewProps {
  block: Block;
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

  const { style: backgroundStyle, overlay } = useBackgroundStyles(background, "transparent");
  const textColors = getTextColors(background?.textTheme, background?.type, background?.color);
  const advancedProps = getAdvancedProps(advanced);
  const combinedClassName = `block-preview ${SECTION_PADDING_COMPACT} flex flex-col relative ${alignmentClasses[data.alignment]} ${advancedProps.className || ""}`.trim();

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

      {data.imageUrl ? (
        <figure className={`relative z-10 ${sizeClasses[data.size]}`}>
          <img
            src={data.imageUrl}
            alt={data.alt}
            className="w-full h-auto rounded-[var(--radius)] shadow-md"
          />
          {data.caption && (
            <figcaption
              className="mt-[var(--space-3)] text-sm text-center"
              style={{ color: textColors.subtext }}
            >
              {data.caption}
            </figcaption>
          )}
        </figure>
      ) : (
        <div className="relative z-10 w-full max-w-xl aspect-video bg-[var(--color-surface-muted)] rounded-[var(--radius)] flex items-center justify-center">
          <span className="text-[var(--color-text-muted)]">Add an image URL...</span>
        </div>
      )}
    </div>
  );
}
