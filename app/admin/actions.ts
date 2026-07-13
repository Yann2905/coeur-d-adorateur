"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdmin } from "@/lib/auth";
import {
  updateParticipantSchema,
  createAdminSchema,
} from "@/lib/validations";
import { normalizePhone } from "@/lib/utils";
import { STATUS_LABELS, type Status } from "@/lib/constants";
import { getAllParticipantsForExport } from "@/lib/data";
import { sendNewAdminEmail } from "@/lib/brevo";
import type { Participant } from "@/lib/types";

/** Génère un mot de passe lisible et sécurisé (sans caractères ambigus). */
function generatePassword(length = 12): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#%";
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[bytes[i] % chars.length];
  }
  return out;
}

export interface ActionResult {
  ok: boolean;
  error?: string;
}

/** Connexion admin (email + mot de passe Supabase Auth). */
export async function loginAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const redirectTo = String(formData.get("redirect") || "/admin");

  if (!email || !password) {
    return { ok: false, error: "Email et mot de passe requis." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, error: "Identifiants incorrects." };
  }

  // Vérifie que l'utilisateur est bien un admin déclaré.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: admin } = await supabase
    .from("admins")
    .select("id")
    .eq("email", user?.email ?? "")
    .maybeSingle();

  if (!admin) {
    await supabase.auth.signOut();
    return {
      ok: false,
      error: "Ce compte n'est pas autorisé à accéder à l'administration.",
    };
  }

  redirect(redirectTo.startsWith("/admin") ? redirectTo : "/admin");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/**
 * Changement de mot de passe (imposé à la première connexion).
 * Met à jour le mot de passe Auth puis lève l'obligation dans la table admins.
 */
export async function changePasswordAction(
  password: string,
  confirm: string
): Promise<ActionResult> {
  const auth = await getAdmin();
  if (!auth) return { ok: false, error: "Non autorisé." };

  if (!password || password.length < 8) {
    return {
      ok: false,
      error: "Le mot de passe doit contenir au moins 8 caractères.",
    };
  }
  if (password !== confirm) {
    return { ok: false, error: "Les deux mots de passe ne correspondent pas." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return {
      ok: false,
      error:
        "Impossible de mettre à jour le mot de passe. Choisis-en un différent de l'actuel.",
    };
  }

  // Lève l'obligation de changement.
  const adminClient = createAdminClient();
  await adminClient
    .from("admins")
    .update({ must_change_password: false })
    .eq("email", auth.admin.email);

  return { ok: true };
}

async function logHistory(
  participantId: string,
  adminEmail: string | null,
  action: string,
  details?: string
) {
  const supabase = await createClient();
  await supabase.from("participant_history").insert({
    participant_id: participantId,
    admin_email: adminEmail,
    action,
    details: details ?? null,
  });
}

/** Mise à jour complète d'une fiche participant. */
export async function updateParticipantAction(
  formData: unknown
): Promise<ActionResult> {
  const auth = await getAdmin();
  if (!auth) return { ok: false, error: "Non autorisé." };

  const parsed = updateParticipantSchema.safeParse(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }
  const d = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase
    .from("participants")
    .update({
      nom: d.nom,
      prenom: d.prenom,
      whatsapp: normalizePhone(d.whatsapp),
      telephone: normalizePhone(d.telephone),
      ville: d.ville,
      quartier: d.quartier,
      email: d.email || null,
      sexe: d.sexe || null,
      age: d.age || null,
      eglise: d.eglise || null,
      source: d.source || null,
      agape: d.agape,
      status: d.status,
      contacte: d.contacte,
      notes_admin: d.notes_admin || null,
    })
    .eq("id", d.id);

  if (error) return { ok: false, error: "Échec de la mise à jour." };

  await logHistory(d.id, auth.admin.email, "modification", "Fiche mise à jour");
  revalidatePath(`/admin/participant/${d.id}`);
  revalidatePath("/admin/participants");
  revalidatePath("/admin/nouveaux");
  revalidatePath("/admin");
  return { ok: true };
}

/** Change uniquement le statut. */
export async function updateStatusAction(
  id: string,
  status: Status
): Promise<ActionResult> {
  const auth = await getAdmin();
  if (!auth) return { ok: false, error: "Non autorisé." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("participants")
    .update({ status, contacte: status !== "nouveau" ? true : undefined })
    .eq("id", id);

  if (error) return { ok: false, error: "Échec du changement de statut." };

  await logHistory(id, auth.admin.email, "statut", `Statut → ${STATUS_LABELS[status]}`);
  revalidatePath(`/admin/participant/${id}`);
  revalidatePath("/admin/participants");
  revalidatePath("/admin/nouveaux");
  revalidatePath("/admin");
  return { ok: true };
}

/** Marque comme contacté / non contacté. */
export async function toggleContactedAction(
  id: string,
  contacte: boolean
): Promise<ActionResult> {
  const auth = await getAdmin();
  if (!auth) return { ok: false, error: "Non autorisé." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("participants")
    .update({
      contacte,
      status: contacte ? "contacte" : "nouveau",
    })
    .eq("id", id);

  if (error) return { ok: false, error: "Échec." };

  await logHistory(
    id,
    auth.admin.email,
    "contact",
    contacte ? "Marqué comme contacté" : "Marqué comme non contacté"
  );
  revalidatePath(`/admin/participant/${id}`);
  revalidatePath("/admin/participants");
  revalidatePath("/admin/nouveaux");
  revalidatePath("/admin");
  return { ok: true };
}

/** Ajoute / remplace la note interne. */
export async function saveNoteAction(
  id: string,
  note: string
): Promise<ActionResult> {
  const auth = await getAdmin();
  if (!auth) return { ok: false, error: "Non autorisé." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("participants")
    .update({ notes_admin: note || null })
    .eq("id", id);

  if (error) return { ok: false, error: "Échec de l'enregistrement de la note." };

  await logHistory(id, auth.admin.email, "note", "Note interne mise à jour");
  revalidatePath(`/admin/participant/${id}`);
  return { ok: true };
}

/** Renvoie tous les participants pour l'export Excel (réservé admin). */
export async function exportParticipantsAction(): Promise<{
  ok: boolean;
  rows?: Participant[];
  error?: string;
}> {
  const auth = await getAdmin();
  if (!auth) return { ok: false, error: "Non autorisé." };
  const rows = await getAllParticipantsForExport();
  return { ok: true, rows };
}

// ─────────────────────────────────────────────────────────────
//  GESTION DES ADMINISTRATEURS (réservé au super_admin)
// ─────────────────────────────────────────────────────────────

export interface CreateAdminResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  /** Mot de passe généré, renvoyé une seule fois (secours si l'email échoue). */
  password?: string;
  emailSent?: boolean;
}

/** Crée un administrateur : compte Supabase Auth + ligne admins + email d'accès. */
export async function createAdminAction(
  formData: unknown
): Promise<CreateAdminResult> {
  const auth = await getAdmin();
  if (!auth) return { ok: false, error: "Non autorisé." };
  if (auth.admin.role !== "super_admin") {
    return {
      ok: false,
      error: "Seul un super-administrateur peut ajouter des administrateurs.",
    };
  }

  const parsed = createAdminSchema.safeParse(formData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0];
      if (typeof k === "string" && !fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return { ok: false, error: "Merci de corriger les champs.", fieldErrors };
  }

  const d = parsed.data;
  const admin = createAdminClient();

  // Déjà administrateur ?
  const { data: existing } = await admin
    .from("admins")
    .select("id")
    .eq("email", d.email)
    .maybeSingle();
  if (existing) {
    return {
      ok: false,
      error: "Cet email est déjà administrateur.",
      fieldErrors: { email: "Déjà administrateur." },
    };
  }

  const password = generatePassword();

  // 1) Création du compte d'authentification (email confirmé d'office).
  const { error: authError } = await admin.auth.admin.createUser({
    email: d.email,
    password,
    email_confirm: true,
    user_metadata: { nom: d.nom, prenom: d.prenom },
  });

  if (authError) {
    // L'utilisateur existe peut-être déjà dans Auth mais pas dans admins.
    const alreadyExists = /already|exist|registered/i.test(authError.message);
    return {
      ok: false,
      error: alreadyExists
        ? "Un compte existe déjà avec cet email. Utilise « Réinitialiser le mot de passe » depuis Supabase, ou un autre email."
        : `Échec de la création du compte : ${authError.message}`,
      fieldErrors: alreadyExists ? { email: "Compte déjà existant." } : undefined,
    };
  }

  // 2) Enregistrement dans la table admins.
  const { error: insertError } = await admin.from("admins").insert({
    email: d.email,
    nom: d.nom,
    prenom: d.prenom,
    genre: d.genre,
    telephone: normalizePhone(d.telephone),
    role: d.role,
    must_change_password: true,
  });

  if (insertError) {
    return {
      ok: false,
      error:
        "Le compte a été créé mais l'enregistrement dans la liste des admins a échoué. Réessaie.",
    };
  }

  // 3) Envoi de l'email avec les identifiants (non bloquant).
  let emailSent = false;
  try {
    const res = await sendNewAdminEmail({
      email: d.email,
      prenom: d.prenom,
      nom: d.nom,
      password,
      role: d.role,
    });
    emailSent = res.ok;
  } catch {
    emailSent = false;
  }

  revalidatePath("/admin/admins");
  return { ok: true, password, emailSent };
}

/** Supprime un administrateur (compte Auth + ligne admins). */
export async function deleteAdminAction(
  adminId: string
): Promise<ActionResult> {
  const auth = await getAdmin();
  if (!auth) return { ok: false, error: "Non autorisé." };
  if (auth.admin.role !== "super_admin") {
    return { ok: false, error: "Action réservée au super-administrateur." };
  }

  const admin = createAdminClient();
  const { data: target } = await admin
    .from("admins")
    .select("id, email, role")
    .eq("id", adminId)
    .maybeSingle();

  if (!target) return { ok: false, error: "Administrateur introuvable." };
  if (target.email === auth.admin.email) {
    return { ok: false, error: "Tu ne peux pas supprimer ton propre compte." };
  }

  // Retire de la table admins.
  const { error } = await admin.from("admins").delete().eq("id", adminId);
  if (error) return { ok: false, error: "Échec de la suppression." };

  // Retire le compte d'authentification correspondant (best-effort).
  try {
    const { data: list } = await admin.auth.admin.listUsers();
    const authUser = list?.users.find((u) => u.email === target.email);
    if (authUser) await admin.auth.admin.deleteUser(authUser.id);
  } catch {
    /* on garde la suppression admins même si le compte Auth persiste */
  }

  revalidatePath("/admin/admins");
  return { ok: true };
}

/** Suppression d'un participant. */
export async function deleteParticipantAction(id: string): Promise<ActionResult> {
  const auth = await getAdmin();
  if (!auth) return { ok: false, error: "Non autorisé." };

  const supabase = await createClient();
  const { error } = await supabase.from("participants").delete().eq("id", id);
  if (error) return { ok: false, error: "Échec de la suppression." };

  revalidatePath("/admin/participants");
  revalidatePath("/admin");
  return { ok: true };
}
