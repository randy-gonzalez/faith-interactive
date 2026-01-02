"use client";

/**
 * Feature Block Preview Component
 *
 * Live preview rendering of feature block with side-by-side layout.
 */

import type { Block, FeatureBlock, BlockBackground } from "@/types/blocks";
import { getAdvancedProps } from "./block-advanced-editor";

interface FeatureBlockPreviewProps {
  block: Block;
}

function getBackgroundStyles(background?: BlockBackground): React.CSSProperties {
  if (!background) return {};

  switch (background.type) {
    case "color":
      return { backgroundColor: background.color || "transparent" };
    case "gradient":
      return { background: background.gradient };
    case "image":
      if (background.imageUrl) {
        const overlay = background.overlay || "rgba(0,0,0,0.5)";
        return {
          backgroundImage: `linear-gradient(${overlay}, ${overlay}), url(${background.imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        };
      }
      return {};
    default:
      return {};
  }
}

export function FeatureBlockPreview({ block }: FeatureBlockPreviewProps) {
  const featureBlock = block as FeatureBlock;
  const { data, background, advanced } = featureBlock;

  const backgroundStyle = getBackgroundStyles(background);
  const hasBackground = background && background.type !== "color";
  const textColorClass = hasBackground ? "text-white" : "text-gray-900";
  const subTextColorClass = hasBackground ? "text-white/80" : "text-gray-600";
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
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            {data.buttonText}
          </a>
        </div>
      )}
    </div>
  );

  const combinedClassName = `py-12 px-6 ${advancedProps.className || ""}`.trim();

  return (
    <div {...advancedProps} className={combinedClassName} style={backgroundStyle}>
      <div className="max-w-6xl mx-auto">
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
