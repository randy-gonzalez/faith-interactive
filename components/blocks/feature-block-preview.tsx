"use client";

/**
 * Feature Block Preview Component
 *
 * Live preview rendering of feature block with side-by-side layout.
 */

import type { Block, FeatureBlock } from "@/types/blocks";
import { getAdvancedProps } from "./block-advanced-editor";
import { useBackgroundStyles } from "@/lib/blocks/use-background-styles";
import { getTextColors, resolveTextTheme } from "@/lib/blocks/get-text-colors";

interface FeatureBlockPreviewProps {
  block: Block;
}

export function FeatureBlockPreview({ block }: FeatureBlockPreviewProps) {
  const featureBlock = block as FeatureBlock;
  const { data, background, advanced } = featureBlock;

  const { style: backgroundStyle, overlay } = useBackgroundStyles(background, "transparent");
  const textColors = getTextColors(background?.textTheme, background?.type);
  const useLightTheme = resolveTextTheme(background?.textTheme, background?.type);
  const advancedProps = getAdvancedProps(advanced);

  const imageContent = data.imageUrl ? (
    <img
      src={data.imageUrl}
      alt={data.heading}
      className="w-full h-64 md:h-80 object-cover rounded-lg shadow-lg"
    />
  ) : (
    <div className="w-full h-64 md:h-80 bg-gray-200 rounded-lg flex items-center justify-center">
      <span className="text-gray-400">Add an image...</span>
    </div>
  );

  const textContent = (
    <div className="flex flex-col justify-center">
      {data.heading ? (
        <h2
          className="text-2xl md:text-3xl font-bold mb-4"
          style={{ color: textColors.heading }}
        >
          {data.heading}
        </h2>
      ) : (
        <h2 style={{ color: textColors.subtext }} className="text-2xl font-bold mb-4">Add a heading...</h2>
      )}
      {data.content ? (
        <div
          className="prose"
          style={{ color: textColors.text }}
          dangerouslySetInnerHTML={{ __html: data.content }}
        />
      ) : (
        <p style={{ color: textColors.subtext, fontStyle: "italic" }}>Add content...</p>
      )}
      {data.buttonText && data.buttonUrl && (
        <div className="mt-6">
          <a
            href={data.buttonUrl}
            className="inline-block px-6 py-3 font-semibold transition-opacity hover:opacity-90"
            style={{
              backgroundColor: useLightTheme ? textColors.heading : "var(--btn-primary-bg, #2563eb)",
              color: useLightTheme ? "#1f2937" : "var(--btn-primary-text, #ffffff)",
              borderRadius: "var(--btn-radius, 6px)",
            }}
          >
            {data.buttonText}
          </a>
        </div>
      )}
    </div>
  );

  const combinedClassName = `block-preview py-12 px-6 relative ${advancedProps.className || ""}`.trim();

  return (
    <div {...advancedProps} className={combinedClassName} style={backgroundStyle}>
      {/* Image overlay (for image backgrounds) */}
      {background?.type === "image" && background.imageUrl && overlay && (
        <div className="absolute inset-0" style={overlay} />
      )}

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {data.imagePosition === "left" ? (
            <>
              <div>{imageContent}</div>
              <div>{textContent}</div>
            </>
          ) : (
            <>
              <div className="md:order-2">{imageContent}</div>
              <div className="md:order-1">{textContent}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
