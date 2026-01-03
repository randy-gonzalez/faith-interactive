"use client";

/**
 * Events Feature Block Preview Component
 *
 * Live preview rendering of events feature block.
 * Accepts real event data for public pages, falls back to placeholder in editor.
 */

import type { Block, EventsFeatureBlock } from "@/types/blocks";
import { getAdvancedProps } from "./block-advanced-editor";
import { useBackgroundStyles } from "@/lib/blocks/use-background-styles";
import { getTextColors, resolveTextTheme } from "@/lib/blocks/get-text-colors";

/**
 * Event data shape for the block
 */
export interface EventData {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  description?: string;
}

interface EventsFeatureBlockPreviewProps {
  block: Block;
  events?: EventData[]; // Real event data from database
  isPreview?: boolean; // True when rendering in editor preview
}

// Placeholder event data for editor preview
const PLACEHOLDER_EVENTS: EventData[] = [
  {
    id: "1",
    title: "Sunday Worship Service",
    date: "Jan 5, 2025",
    time: "9:00 AM & 11:00 AM",
    location: "Main Sanctuary",
    description: "Join us for worship, prayer, and teaching from God's Word.",
  },
  {
    id: "2",
    title: "Youth Group Meeting",
    date: "Jan 8, 2025",
    time: "6:30 PM",
    location: "Youth Center",
    description: "A fun evening of games, fellowship, and Bible study for teens.",
  },
  {
    id: "3",
    title: "Community Outreach",
    date: "Jan 12, 2025",
    time: "10:00 AM",
    location: "Downtown Park",
    description: "Serving our neighbors and sharing God's love with our community.",
  },
];

export function EventsFeatureBlockPreview({ block, events, isPreview = false }: EventsFeatureBlockPreviewProps) {
  const eventsFeatureBlock = block as EventsFeatureBlock;
  const { data, background, advanced } = eventsFeatureBlock;

  const { style: backgroundStyle, overlay } = useBackgroundStyles(background, "transparent");
  const textColors = getTextColors(background?.textTheme, background?.type);
  const useLightTheme = resolveTextTheme(background?.textTheme, background?.type);
  const cardBg = useLightTheme ? "bg-white/10 backdrop-blur-sm" : "bg-white shadow-md";
  const advancedProps = getAdvancedProps(advanced);
  const combinedClassName = `block-preview py-12 px-6 relative ${advancedProps.className || ""}`.trim();

  // Use real events if provided, otherwise fall back to placeholder
  const sourceEvents = events && events.length > 0 ? events : PLACEHOLDER_EVENTS;
  const displayedEvents = sourceEvents.slice(0, data.count);
  const showPlaceholderMessage = isPreview || (!events || events.length === 0);

  return (
    <div {...advancedProps} className={combinedClassName} style={backgroundStyle}>
      {/* Image overlay (for image backgrounds) */}
      {background?.type === "image" && background.imageUrl && overlay && (
        <div className="absolute inset-0" style={overlay} />
      )}

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h2
            className="text-2xl md:text-3xl font-bold"
            style={{ color: textColors.heading }}
          >
            {data.heading}
          </h2>
          {data.buttonText && data.buttonUrl && (
            <a
              href={data.buttonUrl}
              className="hidden sm:inline-block px-4 py-2 font-medium transition-opacity hover:opacity-90"
              style={{
                backgroundColor: useLightTheme ? textColors.heading : "var(--btn-primary-bg, #2563eb)",
                color: useLightTheme ? "#1f2937" : "var(--btn-primary-text, #ffffff)",
                borderRadius: "var(--btn-radius, 6px)",
              }}
            >
              {data.buttonText}
            </a>
          )}
        </div>

        <div className="space-y-4">
          {displayedEvents.map((event) => (
            <div
              key={event.id}
              className={`p-6 rounded-lg ${cardBg} flex flex-col sm:flex-row gap-4`}
            >
              <div className="flex-shrink-0 text-center sm:text-left sm:w-24">
                <div className="text-sm font-medium" style={{ color: textColors.subtext }}>
                  {event.date}
                </div>
                <div className="text-sm" style={{ color: textColors.subtext }}>
                  {event.time}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1" style={{ color: textColors.heading }}>
                  {event.title}
                </h3>
                <div className="text-sm mb-2" style={{ color: textColors.subtext }}>
                  {event.location}
                </div>
                {data.showDescription && (
                  <p className="text-sm" style={{ color: textColors.subtext }}>
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {data.buttonText && data.buttonUrl && (
          <div className="mt-8 text-center sm:hidden">
            <a
              href={data.buttonUrl}
              className="inline-block px-6 py-3 font-medium transition-opacity hover:opacity-90"
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

        {showPlaceholderMessage && (
          <p className="text-xs text-center mt-6 italic" style={{ color: textColors.subtext }}>
            Preview showing placeholder data. Actual events will be displayed on the live page.
          </p>
        )}
      </div>
    </div>
  );
}
