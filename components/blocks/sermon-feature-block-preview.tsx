"use client";

/**
 * Sermon Feature Block Preview Component
 *
 * Live preview rendering of sermon feature block with placeholder data.
 * On actual pages, this will fetch real sermons from the database.
 */

import type { Block, SermonFeatureBlock } from "@/types/blocks";
import { getAdvancedProps } from "./block-advanced-editor";
import { useBackgroundStyles } from "@/lib/blocks/use-background-styles";

interface SermonFeatureBlockPreviewProps {
  block: Block;
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

  const { style: backgroundStyle, overlay } = useBackgroundStyles(background, "transparent");
  const hasBackground = background && background.type !== "color";
  const textColorClass = hasBackground ? "text-white" : "text-gray-900";
  const subTextColorClass = hasBackground ? "text-white/70" : "text-gray-600";
  const cardBg = hasBackground ? "bg-white/10 backdrop-blur-sm" : "bg-white shadow-md";
  const advancedProps = getAdvancedProps(advanced);
  const combinedClassName = `block-preview py-12 px-6 relative ${advancedProps.className || ""}`.trim();

  const displayedSermons = PLACEHOLDER_SERMONS.slice(0, data.count);

  return (
    <div {...advancedProps} className={combinedClassName} style={backgroundStyle}>
      {/* Image overlay (for image backgrounds) */}
      {background?.type === "image" && background.imageUrl && overlay && (
        <div className="absolute inset-0" style={overlay} />
      )}

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className={`text-2xl md:text-3xl font-bold ${textColorClass}`}>
            {data.heading}
          </h2>
          {data.buttonText && data.buttonUrl && (
            <a
              href={data.buttonUrl}
              className="hidden sm:inline-block px-4 py-2 font-medium transition-opacity hover:opacity-90"
              style={{
                backgroundColor: hasBackground ? "#ffffff" : "var(--btn-primary-bg, #2563eb)",
                color: hasBackground ? "#1f2937" : "var(--btn-primary-text, #ffffff)",
                borderRadius: "var(--btn-radius, 6px)",
              }}
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
              className="inline-block px-6 py-3 font-medium transition-opacity hover:opacity-90"
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

        <p className={`text-xs ${subTextColorClass} text-center mt-6 italic`}>
          Preview showing placeholder data. Actual sermons will be displayed on the live page.
        </p>
      </div>
    </div>
  );
}
