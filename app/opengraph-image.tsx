import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Faith Interactive - Church Website Design";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #000646 0%, #0a0a2e 100%)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Logo */}
        <svg
          viewBox="0 0 220 443"
          width="120"
          height="240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ marginBottom: 40 }}
        >
          <defs>
            <linearGradient id="og-g1" x1="-.59" y1="307.13" x2="208.59" y2="187.67" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#4f76f6"/>
              <stop offset="1" stopColor="#77f2a1"/>
            </linearGradient>
            <linearGradient id="og-g2" x1="-.59" y1="351.31" x2="208.59" y2="231.85" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#4f76f6"/>
              <stop offset="1" stopColor="#77f2a1"/>
            </linearGradient>
            <linearGradient id="og-g3" x1="47.66" y1="417.66" x2="77.4" y2="365.4" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#4f76f6"/>
              <stop offset="1" stopColor="#77f2a1"/>
            </linearGradient>
            <linearGradient id="og-g4" x1="6.6" y1="441.08" x2="35.93" y2="389.55" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#4f76f6"/>
              <stop offset="1" stopColor="#77f2a1"/>
            </linearGradient>
            <linearGradient id="og-g5" x1="132.01" y1="225.52" x2="161.35" y2="174" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#4f76f6"/>
              <stop offset="1" stopColor="#77f2a1"/>
            </linearGradient>
            <linearGradient id="og-g6" x1="-.59" y1="186.97" x2="208.59" y2="67.51" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#4f76f6"/>
              <stop offset="1" stopColor="#77f2a1"/>
            </linearGradient>
            <linearGradient id="og-g7" x1="-.59" y1="142.79" x2="208.59" y2="23.34" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#4f76f6"/>
              <stop offset="1" stopColor="#77f2a1"/>
            </linearGradient>
            <linearGradient id="og-g8" x1="57.08" y1="227.57" x2="86.42" y2="176.05" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#4f76f6"/>
              <stop offset="1" stopColor="#77f2a1"/>
            </linearGradient>
          </defs>
          <polygon points="219.94 164.33 219.94 207.97 0 323.65 0 280.01 219.94 164.33" fill="url(#og-g1)"/>
          <polygon points="219.94 207.97 219.94 252.15 0 367.83 0 323.65 219.94 207.97" fill="url(#og-g2)"/>
          <polygon points="82.91 324.22 82.91 399.19 41.46 420.99 41.46 346.02 82.91 324.22" fill="url(#og-g3)"/>
          <polygon points="41.46 346.02 41.46 420.99 6.98 439.12 0 442.79 0 367.83 41.46 346.02" fill="url(#og-g4)"/>
          <polygon points="123.94 214.83 123.94 150.99 219.94 164.33 123.94 214.83" fill="url(#og-g5)"/>
          <polygon points="0 203.49 0 159.85 219.94 44.18 219.94 87.82 0 203.49" fill="url(#og-g6)"/>
          <polygon points="0 159.85 0 115.68 219.94 0 219.94 44.18 0 159.85" fill="url(#og-g7)"/>
          <polygon points="96.01 153 96.01 216.84 0 203.49 96.01 153" fill="url(#og-g8)"/>
        </svg>

        {/* Text */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span
            style={{
              fontSize: 56,
              fontWeight: 600,
              color: "white",
              letterSpacing: "-0.02em",
            }}
          >
            Faith Interactive
          </span>
          <span
            style={{
              fontSize: 24,
              color: "#a3a3a3",
            }}
          >
            Church Website Design
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
