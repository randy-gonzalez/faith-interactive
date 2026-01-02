"use client";

/**
 * Service Times Block Preview Component
 *
 * Live preview rendering of service times block.
 */

import type { Block, ServiceTimesBlock, BlockBackground } from "@/types/blocks";
import { getAdvancedProps } from "./block-advanced-editor";

interface ServiceTimesBlockPreviewProps {
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

export function ServiceTimesBlockPreview({ block }: ServiceTimesBlockPreviewProps) {
  const serviceTimesBlock = block as ServiceTimesBlock;
  const { data, background, advanced } = serviceTimesBlock;

  const backgroundStyle = getBackgroundStyles(background);
  const hasBackground = background && background.type !== "color";
  const textColorClass = hasBackground ? "text-white" : "text-gray-900";
  const subTextColorClass = hasBackground ? "text-white/70" : "text-gray-600";
  const cardBg = hasBackground ? "bg-white/10 backdrop-blur-sm" : "bg-white shadow-md";
  const advancedProps = getAdvancedProps(advanced);
  const combinedClassName = `py-12 px-6 ${advancedProps.className || ""}`.trim();

  return (
    <div {...advancedProps} className={combinedClassName} style={backgroundStyle}>
      <div className="max-w-4xl mx-auto">
        {data.heading && (
          <h2 className={`text-2xl md:text-3xl font-bold ${textColorClass} text-center mb-8`}>
            {data.heading}
          </h2>
        )}

        {data.services.length === 0 ? (
          <p className={`text-center ${subTextColorClass} italic`}>
            Add services to display...
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((svc) => (
              <div
                key={svc.id}
                className={`p-6 rounded-lg ${cardBg} text-center`}
              >
                <h3 className={`text-lg font-semibold ${textColorClass} mb-2`}>
                  {svc.name}
                </h3>
                <p className={`text-xl font-bold ${textColorClass}`}>
                  {svc.time || "Time TBD"}
                </p>
                {svc.location && (
                  <p className={`text-sm ${subTextColorClass} mt-2`}>
                    {svc.location}
                  </p>
                )}
                {svc.description && (
                  <p className={`text-sm ${subTextColorClass} mt-2`}>
                    {svc.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
