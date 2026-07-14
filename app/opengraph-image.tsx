import { ImageResponse } from "next/og";
import {
  PROGRAM_NAME,
  PROGRAM_DATE_LABEL,
  PROGRAM_TIME_LABEL,
  PROGRAM_VENUE_SHORT,
} from "@/lib/constants";

export const runtime = "edge";
export const alt = `${PROGRAM_NAME} — Programme d'adoration`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
          background:
            "linear-gradient(135deg,#5b21b6 0%,#7c3aed 50%,#9333ea 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
          padding: 64,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <svg width="96" height="96" viewBox="0 0 48 48">
            <path
              d="M24 41c-1 0-2-.4-2.8-1.1C14.5 33.9 8 28.3 8 20.5 8 15 12.2 11 17.3 11c3 0 5.6 1.4 6.7 3.6C25.1 12.4 27.7 11 30.7 11 35.8 11 40 15 40 20.5c0 7.8-6.5 13.4-13.2 19.4-.8.7-1.8 1.1-2.8 1.1Z"
              fill="#ffffff"
            />
            <path
              d="M24 18c1.6 1.4 2.6 3 2.6 4.7 0 1.7-1.2 3.1-2.6 3.1s-2.6-1.4-2.6-3.1c0-1.7 1-3.3 2.6-4.7Z"
              fill="#f5c451"
            />
          </svg>
        </div>
        <div
          style={{
            fontSize: 76,
            fontWeight: 800,
            marginTop: 24,
            textAlign: "center",
          }}
        >
          {PROGRAM_NAME}
        </div>
        <div
          style={{
            fontSize: 34,
            color: "#e9d5ff",
            marginTop: 8,
          }}
        >
          Programme d'adoration
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 40,
            background: "rgba(255,255,255,0.15)",
            borderRadius: 999,
            padding: "16px 40px",
            fontSize: 32,
            fontWeight: 600,
            color: "#f5c451",
          }}
        >
          {PROGRAM_DATE_LABEL} · {PROGRAM_TIME_LABEL} · {PROGRAM_VENUE_SHORT}
        </div>
      </div>
    ),
    { ...size }
  );
}
