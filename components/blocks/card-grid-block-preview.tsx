"use client";

/**
 * Card Grid Block Preview Component
 *
 * Live preview rendering of card grid block.
 *
 * DESIGN SYSTEM COMPLIANCE:
 * - Card backgrounds use var(--color-surface)
 * - Card padding uses var(--space-5)
 * - All colors via CSS variables
 * - Spacing via CSS variables
 * - Radius via CSS variables
 */

import type { Block, CardGridBlock } from "@/types/blocks";
import { getAdvancedProps } from "./block-advanced-editor";
import { useBackgroundStyles } from "@/lib/blocks/use-background-styles";
import { getTextColors } from "@/lib/blocks/get-text-colors";
import { SECTION_PADDING, GAP, CONTAINER } from "@/lib/blocks/block-styles";

interface CardGridBlockPreviewProps {
  block: Block;
}

export function CardGridBlockPreview({ block }: CardGridBlockPreviewProps) {
  const cardGridBlock = block as CardGridBlock;
  const { data, background, advanced } = cardGridBlock;

  const { style: backgroundStyle, overlay } = useBackgroundStyles(background, "transparent");
  const textColors = getTextColors(background?.textTheme, background?.type, background?.color);
  const advancedProps = getAdvancedProps(advanced);

  const columnClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  const combinedClassName = `block-preview ${SECTION_PADDING} relative ${advancedProps.className || ""}`.trim();

  return (
    <div {...advancedProps} className={combinedClassName} style={backgroundStyle}>
      {/* Image overlay (for image backgrounds) */}
      {background?.type === "image" && background.imageUrl && overlay && (
        <div className="absolute inset-0" style={overlay} />
      )}

      <div className={`${CONTAINER} relative z-10`}>
        {data.cards.length === 0 ? (
          <p className="text-center text-[var(--color-text-muted)] italic">
            Add cards to display...
          </p>
        ) : (
          <div className={`grid ${columnClasses[data.columns]} ${GAP["2xl"]}`}>
            {data.cards.map((card) => (
              <div
                key={card.id}
                className="bg-[var(--color-surface)] rounded-[var(--radius)] shadow-md overflow-hidden"
              >
                {card.imageUrl ? (
                  <img
                    src={card.imageUrl}
                    alt={card.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-[var(--color-surface-muted)] flex items-center justify-center">
                    <span className="text-[var(--color-text-muted)] text-sm">No image</span>
                  </div>
                )}
                <div className="p-[var(--space-5)]">
                  <h3 className="text-lg font-semibold text-[var(--color-text)] mb-[var(--space-2)]" style={{ fontFamily: "var(--font-heading)" }}>
                    {card.title}
                  </h3>
                  {card.description && (
                    <p className="text-[var(--color-text-muted)] text-sm mb-[var(--space-4)]">
                      {card.description}
                    </p>
                  )}
                  {card.linkUrl && card.linkText && (
                    <a
                      href={card.linkUrl}
                      className="text-[var(--color-primary)] hover:opacity-80 text-sm font-medium transition-opacity"
                    >
                      {card.linkText} &rarr;
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
