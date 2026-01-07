"use client";

/**
 * Feature Block Preview Component
 *
 * Live preview rendering of feature block with side-by-side layout.
 *
 * DESIGN SYSTEM COMPLIANCE:
 * - All colors via CSS variables (--color-*, --on-*)
 * - Spacing via CSS variables (--space-*)
 * - Typography via CSS variables (--font-*)
 * - Radius via CSS variables (--radius, --btn-radius)
 */

import type { Block, FeatureBlock } from "@/types/blocks";
import { getAdvancedProps } from "./block-advanced-editor";
import { useBackgroundStyles } from "@/lib/blocks/use-background-styles";
import { getTextColors, resolveTextTheme } from "@/lib/blocks/get-text-colors";
import { SECTION_PADDING, BUTTON_PRIMARY, CONTAINER } from "@/lib/blocks/block-styles";

interface FeatureBlockPreviewProps {
  block: Block;
}

export function FeatureBlockPreview({ block }: FeatureBlockPreviewProps) {
  const featureBlock = block as FeatureBlock;
  const { data, background, advanced } = featureBlock;

  const { style: backgroundStyle, overlay } = useBackgroundStyles(background, "transparent");
  const textColors = getTextColors(background?.textTheme, background?.type, background?.color);
  const useLightTheme = resolveTextTheme(background?.textTheme, background?.type);
  const advancedProps = getAdvancedProps(advanced);

  const imageContent = data.imageUrl ? (
    <img
      src={data.imageUrl}
      alt={data.heading}
      className="w-full h-64 md:h-80 object-cover rounded-[var(--radius)] shadow-lg"
    />
  ) : (
    <div className="w-full h-64 md:h-80 bg-[var(--color-surface-muted)] rounded-[var(--radius)] flex items-center justify-center">
      <span className="text-[var(--color-text-muted)]">Add an image...</span>
    </div>
  );

  const textContent = (
    <div className="flex flex-col justify-center">
      {data.heading ? (
        <h2
          className="text-[length:var(--font-size-h2)] font-bold mb-[var(--space-4)]"
          style={{ color: textColors.heading, fontFamily: "var(--font-heading)" }}
        >
          {data.heading}
        </h2>
      ) : (
        <h2
          className="text-[length:var(--font-size-h2)] font-bold mb-[var(--space-4)] italic"
          style={{ color: textColors.subtext, fontFamily: "var(--font-heading)" }}
        >
          Add a heading...
        </h2>
      )}
      {data.content ? (
        <div
          className="prose prose-headings:font-[var(--font-heading)]"
          style={{ color: textColors.text }}
          dangerouslySetInnerHTML={{ __html: data.content }}
        />
      ) : (
        <p className="italic" style={{ color: textColors.subtext }}>Add content...</p>
      )}
      {data.buttonText && data.buttonUrl && (
        <div className="mt-[var(--space-5)]">
          <a
            href={data.buttonUrl}
            className={useLightTheme
              ? "inline-block px-[var(--space-5)] py-[var(--space-3)] font-semibold transition-opacity hover:opacity-90 rounded-[var(--btn-radius)] bg-white text-[var(--color-text)]"
              : BUTTON_PRIMARY
            }
          >
            {data.buttonText}
          </a>
        </div>
      )}
    </div>
  );

  const combinedClassName = `block-preview ${SECTION_PADDING} relative ${advancedProps.className || ""}`.trim();

  return (
    <div {...advancedProps} className={combinedClassName} style={backgroundStyle}>
      {/* Image overlay (for image backgrounds) */}
      {background?.type === "image" && background.imageUrl && overlay && (
        <div className="absolute inset-0" style={overlay} />
      )}

      <div className={`${CONTAINER} relative z-10`}>
        <div className="grid md:grid-cols-2 gap-[var(--space-6)] md:gap-[var(--space-7)] items-center">
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
