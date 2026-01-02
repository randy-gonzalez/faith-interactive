"use client";

/**
 * Hero Block Preview Component
 *
 * Live preview rendering of hero block with actual styles.
 * Used in both the editor preview panel and public pages.
 * Supports color, gradient, image, and video backgrounds.
 */

import type { Block, HeroBlock, BlockBackground } from "@/types/blocks";
import { getAdvancedProps } from "./block-advanced-editor";

interface HeroBlockPreviewProps {
  block: Block;
}

// Helper to generate background styles from BlockBackground
function getBackgroundStyles(background?: BlockBackground): {
  style: React.CSSProperties;
  hasVideo: boolean;
  videoUrl?: string;
} {
  if (!background) {
    return {
      style: { backgroundColor: "#1e40af" },
      hasVideo: false,
    };
  }

  switch (background.type) {
    case "color":
      return {
        style: { backgroundColor: background.color || "#1e40af" },
        hasVideo: false,
      };

    case "gradient":
      return {
        style: { background: background.gradient || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
        hasVideo: false,
      };

    case "image":
      if (background.imageUrl) {
        const overlay = background.overlay || "rgba(0,0,0,0.5)";
        return {
          style: {
            backgroundImage: `linear-gradient(${overlay}, ${overlay}), url(${background.imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          },
          hasVideo: false,
        };
      }
      return {
        style: { backgroundColor: "#1e40af" },
        hasVideo: false,
      };

    case "video":
      return {
        style: { backgroundColor: "#000" },
        hasVideo: true,
        videoUrl: background.videoUrl,
      };

    default:
      return {
        style: { backgroundColor: "#1e40af" },
        hasVideo: false,
      };
  }
}

export function HeroBlockPreview({ block }: HeroBlockPreviewProps) {
  const heroBlock = block as HeroBlock;
  const { data, background, advanced } = heroBlock;

  const alignmentClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  const { style: backgroundStyle, hasVideo, videoUrl } = getBackgroundStyles(background);
  const advancedProps = getAdvancedProps(advanced);
  const combinedClassName = `relative py-16 px-6 flex flex-col ${alignmentClasses[data.alignment]} overflow-hidden ${advancedProps.className || ""}`.trim();

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
            style={{ backgroundColor: background?.overlay || "rgba(0,0,0,0.5)" }}
          />
        </>
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
                className={`inline-block px-6 py-3 rounded-md font-semibold transition-colors ${
                  btn.variant === "primary"
                    ? "bg-white text-gray-900 hover:bg-gray-100"
                    : "bg-transparent text-white border-2 border-white hover:bg-white/10"
                }`}
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
