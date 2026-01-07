/**
 * Custom HTML Block Preview
 *
 * Renders the Custom HTML block with sanitized content.
 * Used in both the editor preview and public site rendering.
 *
 * DESIGN SYSTEM COMPLIANCE:
 * - All colors via CSS variables (--color-*)
 * - Spacing via CSS variables (--space-*)
 * - Radius via CSS variables (--radius)
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
  const textColors = getTextColors(background?.textTheme, background?.type, background?.color);

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
    small: "pt-[var(--space-4)]",
    medium: "pt-[var(--space-6)]",
    large: "pt-[var(--space-8)]",
  };

  const paddingBottomClasses = {
    none: "pb-0",
    small: "pb-[var(--space-4)]",
    medium: "pb-[var(--space-6)]",
    large: "pb-[var(--space-8)]",
  };

  // If no content, show placeholder in editor context
  if (!sanitizedHtml) {
    return (
      <div
        {...advancedProps}
        className={`block-preview px-[var(--space-5)] relative ${paddingTopClasses[data.paddingTop]} ${paddingBottomClasses[data.paddingBottom]} ${advancedProps.className || ""}`.trim()}
        style={backgroundStyle}
      >
        {/* Image overlay (for image backgrounds) */}
        {background?.type === "image" && background.imageUrl && overlay && (
          <div className="absolute inset-0" style={overlay} />
        )}
        <div
          className={`${maxWidthClasses[data.maxWidth]} ${alignmentClasses[data.alignment]} text-center py-[var(--space-6)] border-2 border-dashed rounded-[var(--radius)] relative z-10`}
          style={{ color: textColors.subtext, borderColor: "var(--color-border)" }}
        >
          Custom HTML block - No content
        </div>
      </div>
    );
  }

  return (
    <div
      {...advancedProps}
      className={`block-preview px-[var(--space-5)] relative ${paddingTopClasses[data.paddingTop]} ${paddingBottomClasses[data.paddingBottom]} ${advancedProps.className || ""}`.trim()}
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
