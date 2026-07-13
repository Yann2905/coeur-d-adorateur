import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Maintient le projet Supabase actif (évite la mise en pause du plan gratuit).
 * Déclenché quotidiennement par Vercel Cron (voir vercel.json).
 * Protégé par le header Authorization: Bearer $CRON_SECRET.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  // Vercel Cron envoie automatiquement `Authorization: Bearer <CRON_SECRET>`.
  if (secret) {
    const provided = authHeader?.replace("Bearer ", "").trim();
    if (provided !== secret) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
  }

  try {
    const supabase = createAdminClient();
    // Petite requête légère pour générer de l'activité.
    const { count, error } = await supabase
      .from("participants")
      .select("id", { count: "exact", head: true });

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      pingedAt: new Date().toISOString(),
      participants: count ?? 0,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
