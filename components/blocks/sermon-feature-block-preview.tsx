"use client";

/**
 * Sermon Feature Block Preview Component
 *
 * Live preview rendering of sermon feature block with placeholder data.
 * On actual pages, this will fetch real sermons from the database.
 */

import type { Block, SermonFeatureBlock, BlockBackground } from "@/types/blocks";
import { getAdvancedProps } from "./block-advanced-editor";

interface SermonFeatureBlockPreviewProps {
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

// Placeholder sermon data for preview
const PLACEHOLDER_SERMONS = [
  {
    id: "1",
    title: "Walking in Faith",
    speaker: "Pastor John Smith",
    date: "Dec 29, 2025",
    description: "Discover how to deepen your faith journey and trust God in every season of life.",
  },
  {
    id: "2",
    title: "The Power of Prayer",
    speaker: "Pastor John Smith",
    date: "Dec 22, 2025",
    description: "Learn practical ways to develop a more meaningful prayer life.",
  },
  {
    id: "3",
    title: "Community & Connection",
    speaker: "Pastor Sarah Johnson",
    date: "Dec 15, 2025",
    description: "Understanding the importance of fellowship and building authentic relationships.",
  },
];

export function SermonFeatureBlockPreview({ block }: SermonFeatureBlockPreviewProps) {
  const sermonFeatureBlock = block as SermonFeatureBlock;
  const { data, background, advanced } = sermonFeatureBlock;

  const backgroundStyle = getBackgroundStyles(background);
  const hasBackground = background && background.type !== "color";
  const textColorClass = hasBackground ? "text-white" : "text-gray-900";
  const subTextColorClass = hasBackground ? "text-white/70" : "text-gray-600";
  const cardBg = hasBackground ? "bg-white/10 backdrop-blur-sm" : "bg-white shadow-md";
  const advancedProps = getAdvancedProps(advanced);
  const combinedClassName = `py-12 px-6 ${advancedProps.className || ""}`.trim();

  const displayedSermons = PLACEHOLDER_SERMONS.slice(0, data.count);

  return (
    <div {...advancedProps} className={combinedClassName} style={backgroundStyle}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className={`text-2xl md:text-3xl font-bold ${textColorClass}`}>
            {data.heading}
          </h2>
          {data.buttonText && data.buttonUrl && (
            <a
              href={data.buttonUrl}
              className="hidden sm:inline-block px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              {data.buttonText}
            </a>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedSermons.map((sermon) => (
            <div
              key={sermon.id}
              className={`p-6 rounded-lg ${cardBg}`}
            >
              <div className={`text-sm ${subTextColorClass} mb-2`}>
                {sermon.date}
              </div>
              <h3 className={`text-lg font-semibold ${textColorClass} mb-1`}>
                {sermon.title}
              </h3>
              <div className={`text-sm ${subTextColorClass} mb-3`}>
                {sermon.speaker}
              </div>
              {data.showDescription && (
                <p className={`text-sm ${subTextColorClass}`}>
                  {sermon.description}
                </p>
              )}
            </div>
          ))}
        </div>

        {data.buttonText && data.buttonUrl && (
          <div className="mt-8 text-center sm:hidden">
            <a
              href={data.buttonUrl}
              className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              {data.buttonText}
            </a>
          </div>
        )}

        <p className={`text-xs ${subTextColorClass} text-center mt-6 italic`}>
          Preview showing placeholder data. Actual sermons will be displayed on the live page.
        </p>
      </div>
    </div>
  );
}
