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

interface CustomHtmlBlockPreviewProps {
  block: Block;
}

export function CustomHtmlBlockPreview({ block }: CustomHtmlBlockPreviewProps) {
  const htmlBlock = block as CustomHtmlBlock;
  const { data, background, advanced } = htmlBlock;

  // Sanitize HTML before rendering
  const sanitizedHtml = sanitizeHtml(data.html);
  const advancedProps = getAdvancedProps(advanced);

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

  // Build background styles
  const backgroundStyles: React.CSSProperties = {};
  if (background) {
    switch (background.type) {
      case "color":
        if (background.color) {
          backgroundStyles.backgroundColor = background.color;
        }
        break;
      case "gradient":
        if (background.gradient) {
          backgroundStyles.background = background.gradient;
        }
        break;
      case "image":
        if (background.imageUrl) {
          backgroundStyles.backgroundImage = `url(${background.imageUrl})`;
          backgroundStyles.backgroundSize = "cover";
          backgroundStyles.backgroundPosition = "center";
        }
        break;
    }
  }

  // If no content, show placeholder in editor context
  if (!sanitizedHtml) {
    return (
      <div
        {...advancedProps}
        className={`block-preview px-6 ${paddingTopClasses[data.paddingTop]} ${paddingBottomClasses[data.paddingBottom]} ${advancedProps.className || ""}`.trim()}
        style={backgroundStyles}
      >
        <div
          className={`${maxWidthClasses[data.maxWidth]} ${alignmentClasses[data.alignment]} text-center text-gray-400 py-8 border-2 border-dashed border-gray-200 rounded-lg`}
        >
          Custom HTML block - No content
        </div>
      </div>
    );
  }

  return (
    <div
      {...advancedProps}
      className={`block-preview px-6 ${paddingTopClasses[data.paddingTop]} ${paddingBottomClasses[data.paddingBottom]} ${advancedProps.className || ""}`.trim()}
      style={backgroundStyles}
    >
      <div
        className={`${maxWidthClasses[data.maxWidth]} ${alignmentClasses[data.alignment]}`}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </div>
  );
}
