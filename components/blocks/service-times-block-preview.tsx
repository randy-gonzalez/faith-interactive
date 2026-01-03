"use client";

/**
 * Service Times Block Preview Component
 *
 * Live preview rendering of service times block.
 */

import type { Block, ServiceTimesBlock } from "@/types/blocks";
import { getAdvancedProps } from "./block-advanced-editor";
import { useBackgroundStyles } from "@/lib/blocks/use-background-styles";
import { getTextColors, resolveTextTheme } from "@/lib/blocks/get-text-colors";

interface ServiceTimesBlockPreviewProps {
  block: Block;
}

export function ServiceTimesBlockPreview({ block }: ServiceTimesBlockPreviewProps) {
  const serviceTimesBlock = block as ServiceTimesBlock;
  const { data, background, advanced } = serviceTimesBlock;

  const { style: backgroundStyle, overlay } = useBackgroundStyles(background, "transparent");
  const textColors = getTextColors(background?.textTheme, background?.type);
  const useLightTheme = resolveTextTheme(background?.textTheme, background?.type);
  const cardBg = useLightTheme ? "bg-white/10 backdrop-blur-sm" : "bg-white shadow-md";
  const advancedProps = getAdvancedProps(advanced);
  const combinedClassName = `block-preview py-12 px-6 relative ${advancedProps.className || ""}`.trim();

  return (
    <div {...advancedProps} className={combinedClassName} style={backgroundStyle}>
      {/* Image overlay (for image backgrounds) */}
      {background?.type === "image" && background.imageUrl && overlay && (
        <div className="absolute inset-0" style={overlay} />
      )}

      <div className="max-w-4xl mx-auto relative z-10">
        {data.heading && (
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-8"
            style={{ color: textColors.heading }}
          >
            {data.heading}
          </h2>
        )}

        {data.services.length === 0 ? (
          <p className="text-center italic" style={{ color: textColors.subtext }}>
            Add services to display...
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((svc) => (
              <div
                key={svc.id}
                className={`p-6 rounded-lg ${cardBg} text-center`}
              >
                <h3 className="text-lg font-semibold mb-2" style={{ color: textColors.heading }}>
                  {svc.name}
                </h3>
                <p className="text-xl font-bold" style={{ color: textColors.heading }}>
                  {svc.time || "Time TBD"}
                </p>
                {svc.location && (
                  <p className="text-sm mt-2" style={{ color: textColors.subtext }}>
                    {svc.location}
                  </p>
                )}
                {svc.description && (
                  <p className="text-sm mt-2" style={{ color: textColors.subtext }}>
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
