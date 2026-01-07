"use client";

/**
 * Hero Block Preview Component
 *
 * Live preview rendering of hero block with actual styles.
 * Used in both the editor preview panel and public pages.
 * Supports color, gradient, image, and video backgrounds.
 *
 * Layout Options:
 * - heightMode: "content" (default) | "large" (70vh) | "screen" (100vh - header)
 * - verticalAlign: "top" | "center" (default) | "bottom"
 * - paddingPreset: "tight" | "standard" (default) | "roomy"
 *
 * IMPORTANT: This component uses CSS variables exclusively.
 * - Colors: var(--color-*), var(--on-*)
 * - Spacing: var(--space-*)
 * - Radius: var(--btn-radius), var(--radius)
 * - Typography: var(--font-heading), var(--font-body), var(--font-size-*)
 */

import type { Block, HeroBlock } from "@/types/blocks";
import { getAdvancedProps } from "./block-advanced-editor";
import { useBackgroundStyles } from "@/lib/blocks/use-background-styles";
import { getTextColors } from "@/lib/blocks/get-text-colors";
import { getHeroLayoutClasses, CONTAINER } from "@/lib/blocks/block-styles";

interface HeroBlockPreviewProps {
  block: Block;
}

export function HeroBlockPreview({ block }: HeroBlockPreviewProps) {
  const heroBlock = block as HeroBlock;
  const { data, background, advanced } = heroBlock;

  // Horizontal alignment classes for text/content
  const horizontalAlignClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  const { style: backgroundStyle, hasVideo, videoUrl, overlay } = useBackgroundStyles(background);

  // Pass background color for auto text theme detection
  const textColors = getTextColors(
    background?.textTheme,
    background?.type,
    background?.color
  );

  const advancedProps = getAdvancedProps(advanced);

  // Get layout classes from new settings (with backward-compatible defaults)
  const layoutClasses = getHeroLayoutClasses(
    data.heightMode || "content",
    data.verticalAlign || "center",
    data.paddingPreset || "standard"
  );

  // Build the combined class string
  const combinedClassName = `block-preview relative flex flex-col ${layoutClasses} ${horizontalAlignClasses[data.alignment]} overflow-hidden ${advancedProps.className || ""}`.trim();

  return (
    <div
      {...advancedProps}
      className={combinedClassName}
      style={backgroundStyle}
    >
      {/* Video Background */}
      {hasVideo && videoUrl && (
        <>
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
          {/* Video overlay */}
          <div
            className="absolute inset-0"
            style={overlay || { backgroundColor: "rgba(0,0,0,0.5)" }}
          />
        </>
      )}

      {/* Image overlay (for image backgrounds) */}
      {background?.type === "image" && background.imageUrl && overlay && (
        <div className="absolute inset-0" style={overlay} />
      )}

      {/* Content - constrained by global container width */}
      <div className={`${CONTAINER} relative z-10`}>
        {data.heading && (
          <h1
            className="font-[var(--font-heading)] text-[length:var(--font-size-h1)] leading-tight font-bold mb-[var(--space-3)]"
            style={{ color: textColors.heading }}
          >
            {data.heading}
          </h1>
        )}

        {data.subheading && (
          <p
            className={`text-lg md:text-xl mb-[var(--space-6)] max-w-2xl ${
              data.alignment === "center" ? "mx-auto" : data.alignment === "right" ? "ml-auto" : ""
            }`}
            style={{ color: textColors.text }}
          >
            {data.subheading}
          </p>
        )}

        {data.buttons.length > 0 && (
          <div
            className={`flex flex-wrap gap-[var(--space-3)] ${
              data.alignment === "center"
                ? "justify-center"
                : data.alignment === "right"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            {data.buttons.map((btn) => (
              <a
                key={btn.id}
                href={btn.url}
                className={`
                  inline-block
                  px-[var(--space-5)]
                  py-[var(--space-3)]
                  font-semibold
                  transition-opacity
                  hover:opacity-90
                  rounded-[var(--btn-radius)]
                  ${btn.variant === "primary" ? "bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]" : ""}
                  ${btn.variant === "secondary" ? "bg-transparent border-2 border-current" : ""}
                `.trim()}
                style={
                  btn.variant === "secondary"
                    ? { color: textColors.heading }
                    : undefined
                }
              >
                {btn.label}
              </a>
            ))}
          </div>
        )}

        {!data.heading && !data.subheading && data.buttons.length === 0 && (
          <p
            className="italic"
            style={{ color: textColors.subtext }}
          >
            Add content to see the preview
          </p>
        )}
      </div>
    </div>
  );
}
