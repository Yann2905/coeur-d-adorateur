import { ImageResponse } from "next/og";

export const runtime = "edge";

/**
 * Génère les icônes PNG de la PWA à la volée.
 *   /icon-image?size=192
 *   /icon-image?size=512&maskable=1
 * URL stable → utilisable dans le manifest et les balises <link>.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const size = Math.min(
    Math.max(parseInt(searchParams.get("size") || "512", 10) || 512, 48),
    1024
  );
  const maskable = searchParams.get("maskable") === "1";
  // Zone de sécurité pour les icônes maskable (Android).
  const pad = maskable ? Math.round(size * 0.14) : 0;
  const heart = Math.round(size * 0.5);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg,#6d28d9 0%,#7c3aed 50%,#9333ea 100%)",
          padding: pad,
          borderRadius: maskable ? 0 : size * 0.22,
        }}
      >
        <svg
          width={heart}
          height={heart}
          viewBox="0 0 48 48"
          xmlns="http://www.w3.org/2000/svg"
        >
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
    ),
    { width: size, height: size }
  );
}
