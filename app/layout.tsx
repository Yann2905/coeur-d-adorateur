import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { PwaRegister } from "@/components/pwa-register";
import { PROGRAM_NAME } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: `${PROGRAM_NAME} — Programme d'adoration du 1er Novembre 2026`,
    template: `%s · ${PROGRAM_NAME}`,
  },
  description:
    "Inscris-toi pour participer au grand programme d'adoration du 1er Novembre 2026. Cœur d'Adorateur — préparons ensemble ce moment de louange et l'agapé.",
  applicationName: PROGRAM_NAME,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: PROGRAM_NAME,
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-image?size=192", sizes: "192x192", type: "image/png" },
      { url: "/icon-image?size=512", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-image?size=180", sizes: "180x180" }],
  },
  openGraph: {
    title: `${PROGRAM_NAME} — 1er Novembre 2026`,
    description:
      "Inscris-toi pour participer au programme d'adoration du 1er Novembre 2026.",
    type: "website",
    locale: "fr_FR",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#7c3aed" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1024" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <PwaRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
