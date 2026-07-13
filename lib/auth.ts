import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

/**
 * Récupère l'utilisateur admin courant.
 * Vérifie que l'email est présent dans la table `admins`.
 * Redirige vers /admin/login si non authentifié / non autorisé.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("id, email, nom, prenom, genre, telephone, role, must_change_password, created_at")
    .eq("email", user.email!)
    .maybeSingle();

  if (!admin) {
    // Authentifié mais pas dans la table admins.
    await supabase.auth.signOut();
    redirect("/admin/login?error=unauthorized");
  }

  return { user, admin };
}

/** Version non-redirigeante — renvoie null si non admin. */
export async function getAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: admin } = await supabase
    .from("admins")
    .select("id, email, nom, prenom, genre, telephone, role, must_change_password, created_at")
    .eq("email", user.email!)
    .maybeSingle();

  return admin ? { user, admin } : null;
}

/** Exige un super-administrateur (gestion des admins). Redirige sinon. */
export async function requireSuperAdmin() {
  const auth = await requireAdmin();
  if (auth.admin.role !== "super_admin") {
    redirect("/admin");
  }
  return auth;
}
