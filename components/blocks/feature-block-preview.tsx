"use client";

/**
 * Feature Block Preview Component
 *
 * Live preview rendering of feature block with side-by-side layout.
 */

import type { Block, FeatureBlock } from "@/types/blocks";
import { getAdvancedProps } from "./block-advanced-editor";
import { useBackgroundStyles } from "@/lib/blocks/use-background-styles";

interface FeatureBlockPreviewProps {
  block: Block;
}

export function FeatureBlockPreview({ block }: FeatureBlockPreviewProps) {
  const featureBlock = block as FeatureBlock;
  const { data, background, advanced } = featureBlock;

  const { style: backgroundStyle, overlay } = useBackgroundStyles(background, "transparent");
  const hasBackground = background && background.type !== "color";
  const hasDarkBackground = background?.type === "color" && background.color;
  const textColorClass = hasBackground || hasDarkBackground ? "text-white" : "text-gray-900";
  const subTextColorClass = hasBackground || hasDarkBackground ? "text-white/80" : "text-gray-600";
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
        <h2 className={`text-2xl md:text-3xl font-bold ${textColorClass} mb-4`}>
          {data.heading}
        </h2>
      ) : (
        <h2 className="text-2xl font-bold text-gray-300 mb-4">Add a heading...</h2>
      )}
      {data.content ? (
        <div
          className={`prose ${subTextColorClass}`}
          dangerouslySetInnerHTML={{ __html: data.content }}
        />
      ) : (
        <p className="text-gray-400 italic">Add content...</p>
      )}
      {data.buttonText && data.buttonUrl && (
        <div className="mt-6">
          <a
            href={data.buttonUrl}
            className="inline-block px-6 py-3 font-semibold transition-opacity hover:opacity-90"
            style={{
              backgroundColor: hasBackground ? "#ffffff" : "var(--btn-primary-bg, #2563eb)",
              color: hasBackground ? "#1f2937" : "var(--btn-primary-text, #ffffff)",
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
