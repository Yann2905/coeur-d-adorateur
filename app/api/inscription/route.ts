import { NextResponse } from "next/server";
import { registerParticipant } from "@/app/actions";

export const dynamic = "force-dynamic";

/**
 * Point d'entrée API alternatif pour l'inscription (JSON).
 * Le formulaire du site utilise la Server Action `registerParticipant`,
 * mais cette route permet une intégration externe.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Corps de requête JSON invalide." },
      { status: 400 }
    );
  }

  const result = await registerParticipant(body);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
