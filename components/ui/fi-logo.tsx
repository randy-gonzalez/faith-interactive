/**
 * Faith Interactive Logo Component
 *
 * Reusable logo component with variants and color modes.
 * The Fi mark is a stylized "F" made of diagonal stripes with a gradient.
 */

import { useId } from "react";

interface FiLogoProps {
  /** Logo variant */
  variant?: "icon" | "horizontal" | "stacked";
  /** Color mode for different backgrounds */
  colorMode?: "light" | "dark";
  /** Size in pixels (applies to icon height, scales proportionally) */
  size?: number;
  /** Additional CSS classes */
  className?: string;
}

export function FiLogo({
  variant = "icon",
  colorMode = "dark",
  size = 40,
  className = "",
}: FiLogoProps) {
  // Use React's useId hook for stable IDs across server/client
  const idPrefix = useId().replace(/:/g, "-");

  // Text colors based on color mode
  const textColor = colorMode === "light" ? "#ffffff" : "#1a1f36";
  const subtextColor = colorMode === "light" ? "rgba(255,255,255,0.8)" : "#1a1f36";

  // The Fi icon mark SVG - exact copy from Fi-brand.svg
  // DO NOT MODIFY - this is the official brand mark
  const IconMark = ({ iconSize }: { iconSize: number }) => (
    <svg
      width={iconSize}
      height={iconSize * (442.79 / 219.94)}
      viewBox="0 0 219.94 442.79"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* linear-gradient (cls-8) - blue to mint */}
        <linearGradient id={`${idPrefix}-g1`} x1="-.59" y1="307.13" x2="208.59" y2="187.67" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4f76f6"/>
          <stop offset="1" stopColor="#77f2a1"/>
        </linearGradient>
        {/* linear-gradient-2 (cls-7) - blue fading to dark navy */}
        <linearGradient id={`${idPrefix}-g2`} x1="222.89" y1="230.41" x2="-111.68" y2="400.76" gradientUnits="userSpaceOnUse">
          <stop offset=".1" stopColor="#4f76f6"/>
          <stop offset=".18" stopColor="#4c72ed"/>
          <stop offset=".3" stopColor="#4769d6"/>
          <stop offset=".46" stopColor="#3d5ab0"/>
          <stop offset=".64" stopColor="#30457b"/>
          <stop offset=".84" stopColor="#1f2b36"/>
        </linearGradient>
        {/* linear-gradient-3 (cls-6) - blue fading to dark navy vertical */}
        <linearGradient id={`${idPrefix}-g3`} x1="62.19" y1="461.55" x2="62.19" y2="256.39" gradientUnits="userSpaceOnUse">
          <stop offset=".1" stopColor="#4f76f6"/>
          <stop offset=".2" stopColor="#4d73f0"/>
          <stop offset=".34" stopColor="#496ddf"/>
          <stop offset=".49" stopColor="#4262c5"/>
          <stop offset=".65" stopColor="#39549f"/>
          <stop offset=".82" stopColor="#2d416f"/>
          <stop offset="1" stopColor="#1f2b36"/>
        </linearGradient>
        {/* linear-gradient-4 (cls-5) - blue to mint */}
        <linearGradient id={`${idPrefix}-g4`} x1="23.9" y1="458.51" x2="18.42" y2="347.71" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4f76f6"/>
          <stop offset="1" stopColor="#77f2a1"/>
        </linearGradient>
        {/* linear-gradient-5 (cls-3) - blue to mint */}
        <linearGradient id={`${idPrefix}-g5`} x1="187.19" y1="200.87" x2="102.71" y2="138.34" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4f76f6"/>
          <stop offset="1" stopColor="#77f2a1"/>
        </linearGradient>
        {/* linear-gradient-6 (cls-4) - blue fading to dark navy */}
        <linearGradient id={`${idPrefix}-g6`} x1="220.08" y1="61.78" x2="-81.62" y2="231.82" gradientUnits="userSpaceOnUse">
          <stop offset=".1" stopColor="#4f76f6"/>
          <stop offset=".2" stopColor="#4d73f0"/>
          <stop offset=".34" stopColor="#496ddf"/>
          <stop offset=".49" stopColor="#4262c5"/>
          <stop offset=".65" stopColor="#39549f"/>
          <stop offset=".82" stopColor="#2d416f"/>
          <stop offset="1" stopColor="#1f2b36"/>
        </linearGradient>
        {/* linear-gradient-7 (cls-2) - blue to mint */}
        <linearGradient id={`${idPrefix}-g7`} x1="-3.81" y1="144.82" x2="183.43" y2="38.03" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4f76f6"/>
          <stop offset="1" stopColor="#77f2a1"/>
        </linearGradient>
        {/* linear-gradient-8 (cls-1) - blue to mint */}
        <linearGradient id={`${idPrefix}-g8`} x1="0" y1="184.92" x2="96.01" y2="184.92" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4f76f6"/>
          <stop offset="1" stopColor="#77f2a1"/>
        </linearGradient>
      </defs>
      {/* Polygons in exact order from Fi-brand.svg */}
      <polygon points="219.94 164.33 219.94 207.97 0 323.65 0 280.01 219.94 164.33" fill={`url(#${idPrefix}-g1)`}/>
      <polygon points="219.94 207.97 219.94 252.15 0 367.83 0 323.65 219.94 207.97" fill={`url(#${idPrefix}-g2)`}/>
      <polygon points="82.91 324.22 82.91 399.19 41.46 420.99 41.46 346.02 82.91 324.22" fill={`url(#${idPrefix}-g3)`}/>
      <polygon points="41.46 346.02 41.46 420.99 6.98 439.12 0 442.79 0 367.83 41.46 346.02" fill={`url(#${idPrefix}-g4)`}/>
      <polygon points="123.94 214.83 123.94 150.99 219.94 164.33 123.94 214.83" fill={`url(#${idPrefix}-g5)`}/>
      <polygon points="0 203.49 0 159.85 219.94 44.18 219.94 87.82 0 203.49" fill={`url(#${idPrefix}-g6)`}/>
      <polygon points="0 159.85 0 115.68 219.94 0 219.94 44.18 0 159.85" fill={`url(#${idPrefix}-g7)`}/>
      <polygon points="96.01 153 96.01 216.84 0 203.49 96.01 153" fill={`url(#${idPrefix}-g8)`}/>
    </svg>
  );

  if (variant === "icon") {
    return (
      <div className={className}>
        <IconMark iconSize={size} />
      </div>
    );
  }

  if (variant === "horizontal") {
    // Horizontal layout: icon + "FAITH INTERACTIVE" text
    const iconSize = size;
    const fontSize = size * 0.7;
    const subFontSize = size * 0.38;

    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <IconMark iconSize={iconSize} />
        <div className="flex flex-col">
          <span
            style={{
              color: textColor,
              fontSize: `${fontSize}px`,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            FAITH
          </span>
          <span
            style={{
              color: subtextColor,
              fontSize: `${subFontSize}px`,
              fontWeight: 500,
              letterSpacing: "0.15em",
              lineHeight: 1.2,
            }}
          >
            INTERACTIVE
          </span>
        </div>
      </div>
    );
  }

  if (variant === "stacked") {
    // Stacked layout: icon on top, text below
    const iconSize = size;
    const fontSize = size * 0.4;
    const subFontSize = size * 0.22;

    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <IconMark iconSize={iconSize} />
        <div className="flex flex-col items-center">
          <span
            style={{
              color: textColor,
              fontSize: `${fontSize}px`,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            FAITH
          </span>
          <span
            style={{
              color: subtextColor,
              fontSize: `${subFontSize}px`,
              fontWeight: 500,
              letterSpacing: "0.15em",
              lineHeight: 1.4,
            }}
          >
            INTERACTIVE
          </span>
        </div>
      </div>
    );
  }

  return null;
}

/**
 * Simple Fi icon for use in navbars and small spaces
 */
export function FiIcon({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return <FiLogo variant="icon" size={size} className={className} />;
}
