import type { MetadataRoute } from "next";
import { PROGRAM_NAME } from "@/lib/constants";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: PROGRAM_NAME,
    short_name: PROGRAM_NAME,
    description:
      "Inscris-toi pour participer au programme d'adoration du 31 Octobre 2026.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#faf7ff",
    theme_color: "#7c3aed",
    lang: "fr",
    categories: ["lifestyle", "social"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-image?size=192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-image?size=512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-image?size=512&maskable=1",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "S'inscrire",
        short_name: "Inscription",
        url: "/inscription",
      },
      {
        name: "Espace admin",
        short_name: "Admin",
        url: "/admin",
      },
    ],
  };
}
