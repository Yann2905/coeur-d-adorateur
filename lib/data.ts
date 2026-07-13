import { createClient } from "@/lib/supabase/server";
import type {
  Participant,
  DashboardStats,
  ParticipantHistory,
  Admin,
} from "@/lib/types";

const SELECT =
  "id, created_at, updated_at, nom, prenom, whatsapp, telephone, ville, quartier, email, sexe, age, eglise, source, agape, status, contacte, notes_admin";

/** Statistiques du tableau de bord. */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const countBy = async (
    apply: (q: any) => any
  ): Promise<number> => {
    let query = supabase
      .from("participants")
      .select("id", { count: "exact", head: true });
    query = apply(query);
    const { count } = await query;
    return count ?? 0;
  };

  const [total, nouveaux, contactes, confirmes, presents, agape] =
    await Promise.all([
      countBy((q) => q),
      countBy((q) => q.eq("status", "nouveau")),
      countBy((q) => q.eq("status", "contacte")),
      countBy((q) => q.eq("status", "confirme")),
      countBy((q) => q.eq("status", "present")),
      countBy((q) => q.eq("agape", true)),
    ]);

  return { total, nouveaux, contactes, confirmes, presents, agape };
}

/** Les N dernières inscriptions. */
export async function getRecentParticipants(limit = 30): Promise<Participant[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("participants")
    .select(SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as Participant[]) ?? [];
}

export interface ParticipantFilters {
  search?: string;
  ville?: string;
  status?: string;
  agape?: string;
  page?: number;
  pageSize?: number;
}

/** Liste paginée + filtrée des participants. */
export async function getParticipants(filters: ParticipantFilters): Promise<{
  rows: Participant[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const supabase = await createClient();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("participants")
    .select(SELECT, { count: "exact" })
    .order("created_at", { ascending: false });

  if (filters.search) {
    const s = filters.search.trim().replace(/[%,]/g, " ");
    query = query.or(
      `nom.ilike.%${s}%,prenom.ilike.%${s}%,telephone.ilike.%${s}%,whatsapp.ilike.%${s}%`
    );
  }
  if (filters.ville) query = query.ilike("ville", `%${filters.ville}%`);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.agape === "oui") query = query.eq("agape", true);
  if (filters.agape === "non") query = query.eq("agape", false);

  const { data, count } = await query.range(from, to);

  return {
    rows: (data as Participant[]) ?? [],
    total: count ?? 0,
    page,
    pageSize,
  };
}

/** Villes distinctes (pour le filtre). */
export async function getVilles(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("participants")
    .select("ville")
    .order("ville", { ascending: true });
  const set = new Set<string>();
  (data ?? []).forEach((r: { ville: string }) => {
    if (r.ville) set.add(r.ville.trim());
  });
  return Array.from(set);
}

export async function getParticipant(id: string): Promise<Participant | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("participants")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();
  return (data as Participant) ?? null;
}

export async function getParticipantHistory(
  id: string
): Promise<ParticipantHistory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("participant_history")
    .select("id, participant_id, admin_email, action, details, created_at")
    .eq("participant_id", id)
    .order("created_at", { ascending: false })
    .limit(50);
  return (data as ParticipantHistory[]) ?? [];
}

/** Liste des administrateurs. */
export async function getAdmins(): Promise<Admin[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("admins")
    .select("id, email, nom, prenom, genre, telephone, role, must_change_password, created_at")
    .order("created_at", { ascending: true });
  return (data as Admin[]) ?? [];
}

/** Tous les participants pour l'export Excel. */
export async function getAllParticipantsForExport(): Promise<Participant[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("participants")
    .select(SELECT)
    .order("created_at", { ascending: false });
  return (data as Participant[]) ?? [];
}
