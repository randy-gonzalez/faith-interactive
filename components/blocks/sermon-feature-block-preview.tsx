"use client";

/**
 * Sermon Feature Block Preview Component
 *
 * Live preview rendering of sermon feature block.
 * Accepts real sermon data for public pages, falls back to placeholder in editor.
 *
 * DESIGN SYSTEM COMPLIANCE:
 * - All colors via CSS variables (--color-*, --btn-*)
 * - Spacing via CSS variables (--space-*)
 * - Typography via CSS variables (--font-*)
 * - Radius via CSS variables (--radius, --btn-radius)
 */

import type { Block, SermonFeatureBlock } from "@/types/blocks";
import { getAdvancedProps } from "./block-advanced-editor";
import { useBackgroundStyles } from "@/lib/blocks/use-background-styles";
import { getTextColors, resolveTextTheme } from "@/lib/blocks/get-text-colors";
import { SECTION_PADDING, GAP, getCardClasses, CONTAINER } from "@/lib/blocks/block-styles";

/**
 * Sermon data shape for the block
 */
export interface SermonData {
  id: string;
  title: string;
  speaker: string;
  date: string;
  description?: string;
}

interface SermonFeatureBlockPreviewProps {
  block: Block;
  sermons?: SermonData[]; // Real sermon data from database
  isPreview?: boolean; // True when rendering in editor preview
}

// Placeholder sermon data for editor preview
const PLACEHOLDER_SERMONS: SermonData[] = [
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

export function SermonFeatureBlockPreview({ block, sermons, isPreview = false }: SermonFeatureBlockPreviewProps) {
  const sermonFeatureBlock = block as SermonFeatureBlock;
  const { data, background, advanced } = sermonFeatureBlock;

  const { style: backgroundStyle, overlay } = useBackgroundStyles(background, "transparent");
  const textColors = getTextColors(background?.textTheme, background?.type, background?.color);
  const useLightTheme = resolveTextTheme(background?.textTheme, background?.type);
  const cardClasses = getCardClasses(useLightTheme);
  const advancedProps = getAdvancedProps(advanced);
  const combinedClassName = `block-preview ${SECTION_PADDING} relative ${advancedProps.className || ""}`.trim();

  // Use real sermons if provided, otherwise fall back to placeholder
  const sourceSermons = sermons && sermons.length > 0 ? sermons : PLACEHOLDER_SERMONS;
  const displayedSermons = sourceSermons.slice(0, data.count);
  const showPlaceholderMessage = isPreview || (!sermons || sermons.length === 0);

  return (
    <div {...advancedProps} className={combinedClassName} style={backgroundStyle}>
      {/* Image overlay (for image backgrounds) */}
      {background?.type === "image" && background.imageUrl && overlay && (
        <div className="absolute inset-0" style={overlay} />
      )}

      <div className={`${CONTAINER} relative z-10`}>
        <div className="flex items-center justify-between mb-[var(--space-6)]">
          <h2
            className="text-[length:var(--font-size-h2)] font-bold"
            style={{ color: textColors.heading, fontFamily: "var(--font-heading)" }}
          >
            {data.heading}
          </h2>
          {data.buttonText && data.buttonUrl && (
            <a
              href={data.buttonUrl}
              className="hidden sm:inline-block px-[var(--space-4)] py-[var(--space-2)] font-medium transition-opacity hover:opacity-90"
              style={{
                backgroundColor: useLightTheme ? textColors.heading : "var(--btn-primary-bg)",
                color: useLightTheme ? "var(--color-text)" : "var(--btn-primary-text)",
                borderRadius: "var(--btn-radius)",
              }}
            >
              {data.buttonText}
            </a>
          )}
        </div>

        <div className={`grid md:grid-cols-2 lg:grid-cols-3 ${GAP["xl"]}`}>
          {displayedSermons.map((sermon) => (
            <div
              key={sermon.id}
              className={`p-[var(--space-5)] rounded-[var(--radius)] ${cardClasses}`}
            >
              <div className="text-sm mb-[var(--space-2)]" style={{ color: textColors.subtext }}>
                {sermon.date}
              </div>
              <h3 className="text-lg font-semibold mb-[var(--space-1)]" style={{ color: textColors.heading, fontFamily: "var(--font-heading)" }}>
                {sermon.title}
              </h3>
              <div className="text-sm mb-[var(--space-3)]" style={{ color: textColors.subtext }}>
                {sermon.speaker}
              </div>
              {data.showDescription && (
                <p className="text-sm" style={{ color: textColors.subtext }}>
                  {sermon.description}
                </p>
              )}
            </div>
          ))}
        </div>

        {data.buttonText && data.buttonUrl && (
          <div className="mt-[var(--space-6)] text-center sm:hidden">
            <a
              href={data.buttonUrl}
              className="inline-block px-[var(--space-5)] py-[var(--space-3)] font-medium transition-opacity hover:opacity-90"
              style={{
                backgroundColor: useLightTheme ? textColors.heading : "var(--btn-primary-bg)",
                color: useLightTheme ? "var(--color-text)" : "var(--btn-primary-text)",
                borderRadius: "var(--btn-radius)",
              }}
            >
              {data.buttonText}
            </a>
          </div>
        )}

        {showPlaceholderMessage && (
          <p className="text-xs text-center mt-[var(--space-5)] italic" style={{ color: textColors.subtext }}>
            Preview showing placeholder data. Actual sermons will be displayed on the live page.
          </p>
        )}
      </div>
    </div>
  );
}
