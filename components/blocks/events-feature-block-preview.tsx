"use client";

/**
 * Events Feature Block Preview Component
 *
 * Live preview rendering of events feature block with placeholder data.
 * On actual pages, this will fetch real events from the database.
 */

import type { Block, EventsFeatureBlock, BlockBackground } from "@/types/blocks";
import { getAdvancedProps } from "./block-advanced-editor";

interface EventsFeatureBlockPreviewProps {
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

// Placeholder event data for preview
const PLACEHOLDER_EVENTS = [
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

export function EventsFeatureBlockPreview({ block }: EventsFeatureBlockPreviewProps) {
  const eventsFeatureBlock = block as EventsFeatureBlock;
  const { data, background, advanced } = eventsFeatureBlock;

  const backgroundStyle = getBackgroundStyles(background);
  const hasBackground = background && background.type !== "color";
  const textColorClass = hasBackground ? "text-white" : "text-gray-900";
  const subTextColorClass = hasBackground ? "text-white/70" : "text-gray-600";
  const cardBg = hasBackground ? "bg-white/10 backdrop-blur-sm" : "bg-white shadow-md";
  const advancedProps = getAdvancedProps(advanced);
  const combinedClassName = `py-12 px-6 ${advancedProps.className || ""}`.trim();

  const displayedEvents = PLACEHOLDER_EVENTS.slice(0, data.count);

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

        <div className="space-y-4">
          {displayedEvents.map((event) => (
            <div
              key={event.id}
              className={`p-6 rounded-lg ${cardBg} flex flex-col sm:flex-row gap-4`}
            >
              <div className="flex-shrink-0 text-center sm:text-left sm:w-24">
                <div className={`text-sm font-medium ${subTextColorClass}`}>
                  {event.date}
                </div>
                <div className={`text-sm ${subTextColorClass}`}>
                  {event.time}
                </div>
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${textColorClass} mb-1`}>
                  {event.title}
                </h3>
                <div className={`text-sm ${subTextColorClass} mb-2`}>
                  {event.location}
                </div>
                {data.showDescription && (
                  <p className={`text-sm ${subTextColorClass}`}>
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
              className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              {data.buttonText}
            </a>
          </div>
        )}

        <p className={`text-xs ${subTextColorClass} text-center mt-6 italic`}>
          Preview showing placeholder data. Actual events will be displayed on the live page.
        </p>
      </div>
    </div>
  );
}
