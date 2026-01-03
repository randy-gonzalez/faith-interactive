"use client";

/**
 * Hero Block Preview Component
 *
 * Live preview rendering of hero block with actual styles.
 * Used in both the editor preview panel and public pages.
 * Supports color, gradient, image, and video backgrounds.
 */

import type { Block, HeroBlock } from "@/types/blocks";
import { getAdvancedProps } from "./block-advanced-editor";
import { useBackgroundStyles } from "@/lib/blocks/use-background-styles";

interface HeroBlockPreviewProps {
  block: Block;
}

export function HeroBlockPreview({ block }: HeroBlockPreviewProps) {
  const heroBlock = block as HeroBlock;
  const { data, background, advanced } = heroBlock;

  const alignmentClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  const { style: backgroundStyle, hasVideo, videoUrl, overlay } = useBackgroundStyles(background);
  const advancedProps = getAdvancedProps(advanced);
  const combinedClassName = `block-preview relative py-16 px-6 flex flex-col ${alignmentClasses[data.alignment]} overflow-hidden ${advancedProps.className || ""}`.trim();

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

      {/* Content */}
      <div className="relative max-w-4xl w-full z-10">
        {data.heading && (
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            {data.heading}
          </h1>
        )}

        {data.subheading && (
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">
            {data.subheading}
          </p>
        )}

        {data.buttons.length > 0 && (
          <div
            className={`flex flex-wrap gap-4 ${
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
                className="inline-block px-6 py-3 font-semibold transition-opacity hover:opacity-90"
                style={
                  btn.variant === "primary"
                    ? {
                        backgroundColor: "#ffffff",
                        color: "#1f2937",
                        borderRadius: "var(--btn-radius, 6px)",
                      }
                    : {
                        backgroundColor: "transparent",
                        color: "#ffffff",
                        border: "2px solid #ffffff",
                        borderRadius: "var(--btn-radius, 6px)",
                      }
                }
              >
                {btn.label}
              </a>
            ))}
          </div>
        )}

        {!data.heading && !data.subheading && data.buttons.length === 0 && (
          <p className="text-white/60 italic">
            Add content to see the preview
          </p>
        )}
      </div>
    </div>
  );
}
