"use client";

/**
 * Service Times Block Preview Component
 *
 * Live preview rendering of service times block.
 *
 * DESIGN SYSTEM COMPLIANCE:
 * - All colors via CSS variables (--color-*, --on-*)
 * - Spacing via CSS variables (--space-*)
 * - Typography via CSS variables (--font-*)
 * - Radius via CSS variables (--radius)
 */

import type { Block, ServiceTimesBlock } from "@/types/blocks";
import { getAdvancedProps } from "./block-advanced-editor";
import { useBackgroundStyles } from "@/lib/blocks/use-background-styles";
import { getTextColors, resolveTextTheme } from "@/lib/blocks/get-text-colors";
import { SECTION_PADDING, getCardClasses, GAP } from "@/lib/blocks/block-styles";

interface ServiceTimesBlockPreviewProps {
  block: Block;
}

export function ServiceTimesBlockPreview({ block }: ServiceTimesBlockPreviewProps) {
  const serviceTimesBlock = block as ServiceTimesBlock;
  const { data, background, advanced } = serviceTimesBlock;

  const { style: backgroundStyle, overlay } = useBackgroundStyles(background, "transparent");
  const textColors = getTextColors(background?.textTheme, background?.type, background?.color);
  const useLightTheme = resolveTextTheme(background?.textTheme, background?.type);
  const cardClasses = getCardClasses(useLightTheme);
  const advancedProps = getAdvancedProps(advanced);
  const combinedClassName = `block-preview ${SECTION_PADDING} relative ${advancedProps.className || ""}`.trim();

  return (
    <div {...advancedProps} className={combinedClassName} style={backgroundStyle}>
      {/* Image overlay (for image backgrounds) */}
      {background?.type === "image" && background.imageUrl && overlay && (
        <div className="absolute inset-0" style={overlay} />
      )}

      <div className="max-w-4xl mx-auto relative z-10">
        {data.heading && (
          <h2
            className="text-[length:var(--font-size-h2)] font-bold text-center mb-[var(--space-6)]"
            style={{ color: textColors.heading, fontFamily: "var(--font-heading)" }}
          >
            {data.heading}
          </h2>
        )}

        {data.services.length === 0 ? (
          <p className="text-center italic text-[var(--color-text-muted)]">
            Add services to display...
          </p>
        ) : (
          <div className={`grid sm:grid-cols-2 lg:grid-cols-3 ${GAP["2xl"]}`}>
            {data.services.map((svc) => (
              <div
                key={svc.id}
                className={`p-[var(--space-5)] ${cardClasses} text-center`}
              >
                <h3
                  className="text-lg font-semibold mb-[var(--space-2)]"
                  style={{ color: textColors.heading, fontFamily: "var(--font-heading)" }}
                >
                  {svc.name}
                </h3>
                <p className="text-xl font-bold" style={{ color: textColors.heading }}>
                  {svc.time || "Time TBD"}
                </p>
                {svc.location && (
                  <p className="text-sm mt-[var(--space-2)]" style={{ color: textColors.subtext }}>
                    {svc.location}
                  </p>
                )}
                {svc.description && (
                  <p className="text-sm mt-[var(--space-2)]" style={{ color: textColors.subtext }}>
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
