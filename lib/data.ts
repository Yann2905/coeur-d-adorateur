import { createClient } from "@/lib/supabase/server";
import { AGE_OPTIONS, SOURCE_OPTIONS } from "@/lib/constants";
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

export interface ChartDatum {
  label: string;
  value: number;
}

export interface DashboardCharts {
  perDay: ChartDatum[]; // 14 derniers jours
  byVille: ChartDatum[]; // top villes
  byAge: ChartDatum[];
  bySource: ChartDatum[];
  sexe: { homme: number; femme: number; autre: number };
  agape: { oui: number; non: number };
  total: number;
}

/** Agrégats pour les graphiques du tableau de bord. */
export async function getDashboardCharts(): Promise<DashboardCharts> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("participants")
    .select("created_at, ville, sexe, age, source, agape");

  const rows =
    (data as Array<{
      created_at: string;
      ville: string | null;
      sexe: string | null;
      age: string | null;
      source: string | null;
      agape: boolean | null;
    }>) ?? [];

  // Par jour (14 derniers jours, du plus ancien au plus récent).
  const perDayMap = new Map<string, number>();
  const days: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    perDayMap.set(key, 0);
    days.push(key);
  }
  for (const r of rows) {
    const key = (r.created_at ?? "").slice(0, 10);
    if (perDayMap.has(key)) perDayMap.set(key, (perDayMap.get(key) ?? 0) + 1);
  }
  const perDay: ChartDatum[] = days.map((key) => ({
    label: new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    }).format(new Date(key)),
    value: perDayMap.get(key) ?? 0,
  }));

  // Comptage générique.
  const countBy = (
    selector: (r: (typeof rows)[number]) => string | null | undefined
  ) => {
    const m = new Map<string, number>();
    for (const r of rows) {
      const v = (selector(r) ?? "").trim();
      if (!v) continue;
      m.set(v, (m.get(v) ?? 0) + 1);
    }
    return m;
  };

  // Villes (top 8).
  const villeMap = countBy((r) => (r.ville ? r.ville.trim() : null));
  const byVille: ChartDatum[] = Array.from(villeMap.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Tranches d'âge (dans l'ordre défini).
  const ageMap = countBy((r) => r.age);
  const byAge: ChartDatum[] = AGE_OPTIONS.map((o) => ({
    label: o.label,
    value: ageMap.get(o.value) ?? 0,
  })).filter((d) => d.value > 0);

  // Source.
  const sourceMap = countBy((r) => r.source);
  const bySource: ChartDatum[] = SOURCE_OPTIONS.map((o) => ({
    label: o.label,
    value: sourceMap.get(o.value) ?? 0,
  })).filter((d) => d.value > 0);

  // Sexe.
  let homme = 0,
    femme = 0,
    autreSexe = 0;
  for (const r of rows) {
    if (r.sexe === "homme") homme++;
    else if (r.sexe === "femme") femme++;
    else if (r.sexe) autreSexe++;
  }

  // Agapé.
  let oui = 0,
    non = 0;
  for (const r of rows) {
    if (r.agape) oui++;
    else non++;
  }

  return {
    perDay,
    byVille,
    byAge,
    bySource,
    sexe: { homme, femme, autre: autreSexe },
    agape: { oui, non },
    total: rows.length,
  };
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

export interface PresenceRow {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  whatsapp: string;
  ville: string;
  quartier: string;
  agape: boolean;
  status: string;
}

/** Liste allégée pour le mode présence (jour J). */
export async function getParticipantsForPresence(): Promise<PresenceRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("participants")
    .select("id, nom, prenom, telephone, whatsapp, ville, quartier, agape, status")
    .order("nom", { ascending: true });
  return (data as PresenceRow[]) ?? [];
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
