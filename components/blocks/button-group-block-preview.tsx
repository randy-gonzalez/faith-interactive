"use client";

/**
 * Button Group Block Preview Component
 *
 * Live preview rendering of button group block.
 */

import type { Block, ButtonGroupBlock } from "@/types/blocks";
import { getAdvancedProps } from "./block-advanced-editor";
import { useBackgroundStyles } from "@/lib/blocks/use-background-styles";

interface ButtonGroupBlockPreviewProps {
  block: Block;
}

export function ButtonGroupBlockPreview({ block }: ButtonGroupBlockPreviewProps) {
  const buttonGroupBlock = block as ButtonGroupBlock;
  const { data, background, advanced } = buttonGroupBlock;

  const { style: backgroundStyle, overlay } = useBackgroundStyles(background, "transparent");
  const hasBackground = background && background.type !== "color";
  const advancedProps = getAdvancedProps(advanced);

  const alignmentClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  // Get button styles using CSS variables for branding
  const getButtonStyles = (variant: "primary" | "secondary" | "outline"): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      borderRadius: "var(--btn-radius, 8px)",
    };

    if (hasBackground) {
      // On backgrounds, use white/transparent variants
      switch (variant) {
        case "primary":
          return { ...baseStyles, backgroundColor: "#ffffff", color: "#1f2937" };
        case "secondary":
          return { ...baseStyles, backgroundColor: "rgba(255,255,255,0.2)", color: "#ffffff" };
        case "outline":
          return { ...baseStyles, backgroundColor: "transparent", color: "#ffffff", border: "2px solid #ffffff" };
      }
    } else {
      // Use branding colors via CSS variables
      switch (variant) {
        case "primary":
          return { ...baseStyles, backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)" };
        case "secondary":
          return { ...baseStyles, backgroundColor: "var(--btn-secondary-bg)", color: "var(--btn-secondary-text)" };
        case "outline":
          return {
            ...baseStyles,
            backgroundColor: "transparent",
            color: "var(--btn-outline-text)",
            border: "2px solid var(--btn-outline-border)",
          };
      }
    }
  };

  // Base classes without colors (using inline styles for colors)
  const getButtonClasses = () => {
    return "inline-block px-6 py-3 font-semibold transition-opacity hover:opacity-90";
  };

  const combinedClassName = `block-preview py-8 px-6 relative ${advancedProps.className || ""}`.trim();

  return (
    <div {...advancedProps} className={combinedClassName} style={backgroundStyle}>
      {/* Image overlay (for image backgrounds) */}
      {background?.type === "image" && background.imageUrl && overlay && (
        <div className="absolute inset-0" style={overlay} />
      )}

      <div className="max-w-4xl mx-auto relative z-10">
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
                className={getButtonClasses()}
                style={getButtonStyles(btn.variant)}
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
