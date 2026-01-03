"use client";

/**
 * Card Grid Block Preview Component
 *
 * Live preview rendering of card grid block.
 */

import type { Block, CardGridBlock } from "@/types/blocks";
import { getAdvancedProps } from "./block-advanced-editor";
import { useBackgroundStyles } from "@/lib/blocks/use-background-styles";

interface CardGridBlockPreviewProps {
  block: Block;
}

export function CardGridBlockPreview({ block }: CardGridBlockPreviewProps) {
  const cardGridBlock = block as CardGridBlock;
  const { data, background, advanced } = cardGridBlock;

  const { style: backgroundStyle, overlay } = useBackgroundStyles(background, "transparent");
  const advancedProps = getAdvancedProps(advanced);

  const columnClasses = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  const combinedClassName = `block-preview py-12 px-6 relative ${advancedProps.className || ""}`.trim();

  return (
    <div {...advancedProps} className={combinedClassName} style={backgroundStyle}>
      {/* Image overlay (for image backgrounds) */}
      {background?.type === "image" && background.imageUrl && overlay && (
        <div className="absolute inset-0" style={overlay} />
      )}

      <div className="max-w-6xl mx-auto relative z-10">
        {data.cards.length === 0 ? (
          <p className="text-center text-gray-400 italic">
            Add cards to display...
          </p>
        ) : (
          <div className={`grid ${columnClasses[data.columns]} gap-6`}>
            {data.cards.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                {card.imageUrl ? (
                  <img
                    src={card.imageUrl}
                    alt={card.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No image</span>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {card.title}
                  </h3>
                  {card.description && (
                    <p className="text-gray-600 text-sm mb-4">
                      {card.description}
                    </p>
                  )}
                  {card.linkUrl && card.linkText && (
                    <a
                      href={card.linkUrl}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
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
