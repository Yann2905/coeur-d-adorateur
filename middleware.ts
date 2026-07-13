import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Toutes les routes sauf :
     * - fichiers statiques (_next/static, _next/image)
     * - favicon / icônes / manifest / service worker
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|icon-image|sw.js|manifest.webmanifest|.*\\.(?:png|jpg|jpeg|gif|svg|webp)$).*)",
  ],
};
