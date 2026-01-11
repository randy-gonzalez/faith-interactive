import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000646",
          borderRadius: "6px",
        }}
      >
        <svg
          viewBox="0 0 32 32"
          width="32"
          height="32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="g" x1="0" y1="32" x2="32" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#4f76f6"/>
              <stop offset="1" stopColor="#77f2a1"/>
            </linearGradient>
          </defs>
          <polygon points="8 6 24 6 24 10 12 10 12 14 22 14 22 18 12 18 12 26 8 26 8 6" fill="url(#g)"/>
        </svg>
      </div>
    ),
    { ...size }
  );
}
