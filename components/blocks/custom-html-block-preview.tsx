/**
 * Custom HTML Block Preview
 *
 * Renders the Custom HTML block with sanitized content.
 * Used in both the editor preview and public site rendering.
 */

"use client";

import type { Block, CustomHtmlBlock } from "@/types/blocks";
import { sanitizeHtml } from "@/lib/security/html-sanitizer";
import { getAdvancedProps } from "./block-advanced-editor";
import { useBackgroundStyles } from "@/lib/blocks/use-background-styles";
import { getTextColors } from "@/lib/blocks/get-text-colors";

interface CustomHtmlBlockPreviewProps {
  block: Block;
}

export function CustomHtmlBlockPreview({ block }: CustomHtmlBlockPreviewProps) {
  const htmlBlock = block as CustomHtmlBlock;
  const { data, background, advanced } = htmlBlock;

  // Sanitize HTML before rendering
  const sanitizedHtml = sanitizeHtml(data.html);
  const advancedProps = getAdvancedProps(advanced);

  const { style: backgroundStyle, overlay } = useBackgroundStyles(background, "transparent");
  const textColors = getTextColors(background?.textTheme, background?.type);

  const maxWidthClasses = {
    narrow: "max-w-2xl",
    medium: "max-w-4xl",
    full: "max-w-none",
  };

  const alignmentClasses = {
    left: "mr-auto",
    center: "mx-auto",
    right: "ml-auto",
  };

  const paddingTopClasses = {
    none: "pt-0",
    small: "pt-4",
    medium: "pt-8",
    large: "pt-16",
  };

  const paddingBottomClasses = {
    none: "pb-0",
    small: "pb-4",
    medium: "pb-8",
    large: "pb-16",
  };

  // If no content, show placeholder in editor context
  if (!sanitizedHtml) {
    return (
      <div
        {...advancedProps}
        className={`block-preview px-6 relative ${paddingTopClasses[data.paddingTop]} ${paddingBottomClasses[data.paddingBottom]} ${advancedProps.className || ""}`.trim()}
        style={backgroundStyle}
      >
        {/* Image overlay (for image backgrounds) */}
        {background?.type === "image" && background.imageUrl && overlay && (
          <div className="absolute inset-0" style={overlay} />
        )}
        <div
          className={`${maxWidthClasses[data.maxWidth]} ${alignmentClasses[data.alignment]} text-center py-8 border-2 border-dashed border-gray-200 rounded-lg relative z-10`}
          style={{ color: textColors.subtext }}
        >
          Custom HTML block - No content
        </div>
      </div>
    );
  }

  return (
    <div
      {...advancedProps}
      className={`block-preview px-6 relative ${paddingTopClasses[data.paddingTop]} ${paddingBottomClasses[data.paddingBottom]} ${advancedProps.className || ""}`.trim()}
      style={backgroundStyle}
    >
      {/* Image overlay (for image backgrounds) */}
      {background?.type === "image" && background.imageUrl && overlay && (
        <div className="absolute inset-0" style={overlay} />
      )}
      <div
        className={`${maxWidthClasses[data.maxWidth]} ${alignmentClasses[data.alignment]} relative z-10`}
        style={{ color: textColors.text }}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </div>
  );
}
