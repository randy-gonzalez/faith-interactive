"use client";

/**
 * Button Group Block Preview Component
 *
 * Live preview rendering of button group block.
 */

import type { Block, ButtonGroupBlock, BlockBackground } from "@/types/blocks";
import { getAdvancedProps } from "./block-advanced-editor";

interface ButtonGroupBlockPreviewProps {
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

export function ButtonGroupBlockPreview({ block }: ButtonGroupBlockPreviewProps) {
  const buttonGroupBlock = block as ButtonGroupBlock;
  const { data, background, advanced } = buttonGroupBlock;

  const backgroundStyle = getBackgroundStyles(background);
  const hasBackground = background && background.type !== "color";
  const advancedProps = getAdvancedProps(advanced);

  const alignmentClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  const getButtonClasses = (variant: "primary" | "secondary" | "outline") => {
    if (hasBackground) {
      switch (variant) {
        case "primary":
          return "bg-white text-gray-900 hover:bg-gray-100";
        case "secondary":
          return "bg-white/20 text-white hover:bg-white/30";
        case "outline":
          return "bg-transparent text-white border-2 border-white hover:bg-white/10";
      }
    } else {
      switch (variant) {
        case "primary":
          return "bg-blue-600 text-white hover:bg-blue-700";
        case "secondary":
          return "bg-gray-600 text-white hover:bg-gray-700";
        case "outline":
          return "bg-transparent text-gray-900 border-2 border-gray-900 hover:bg-gray-100";
      }
    }
  };

  const combinedClassName = `py-8 px-6 ${advancedProps.className || ""}`.trim();

  return (
    <div {...advancedProps} className={combinedClassName} style={backgroundStyle}>
      <div className="max-w-4xl mx-auto">
        {data.buttons.length === 0 ? (
          <p className="text-center text-gray-400 italic">
            Add buttons to display...
          </p>
        ) : (
          <div className={`flex flex-wrap gap-4 ${alignmentClasses[data.alignment]}`}>
            {data.buttons.map((btn) => (
              <a
                key={btn.id}
                href={btn.url}
                className={`inline-block px-6 py-3 rounded-lg font-semibold transition-colors ${getButtonClasses(btn.variant)}`}
              >
                {btn.text}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
