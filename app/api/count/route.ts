import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/** Compteur public d'inscrits (aucune donnée personnelle exposée). */
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { count, error } = await supabase
      .from("participants")
      .select("id", { count: "exact", head: true });

    if (error) throw error;

    return NextResponse.json(
      { count: count ?? 0 },
      { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } }
    );
  } catch {
    return NextResponse.json({ count: null }, { status: 500 });
  }
}
