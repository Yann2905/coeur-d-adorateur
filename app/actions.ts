"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { registrationSchema } from "@/lib/validations";
import {
  sendNewRegistrationEmail,
  sendParticipantConfirmationEmail,
} from "@/lib/brevo";
import { normalizePhone } from "@/lib/utils";

export interface RegistrationResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * Inscription publique d'un participant.
 * - Validation serveur (Zod)
 * - Protection anti-spam (honeypot)
 * - Anti-doublon (numéro WhatsApp)
 * - Notification email aux admins (Brevo) — non bloquante
 */
export async function registerParticipant(
  formData: unknown
): Promise<RegistrationResult> {
  const parsed = registrationSchema.safeParse(formData);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    // Honeypot rempli → on fait comme si tout allait bien, sans rien enregistrer.
    if (fieldErrors.website) {
      return { ok: true };
    }
    return {
      ok: false,
      error: "Merci de corriger les champs indiqués.",
      fieldErrors,
    };
  }

  const data = parsed.data;
  const supabase = createAdminClient();

  const normalizedWhatsapp = normalizePhone(data.whatsapp);
  const whatsappDigits = normalizedWhatsapp.replace(/\D/g, "");

  // Anti-doublon : même numéro WhatsApp déjà inscrit ?
  const { data: existing } = await supabase
    .from("participants")
    .select("id")
    .filter(
      "whatsapp",
      "eq",
      normalizedWhatsapp
    )
    .maybeSingle();

  // Vérification supplémentaire (numéro identique en chiffres uniquement).
  if (!existing && whatsappDigits.length >= 7) {
    const { data: all } = await supabase
      .from("participants")
      .select("id, whatsapp")
      .ilike("whatsapp", `%${whatsappDigits.slice(-9)}%`);
    if (all && all.some((p) => p.whatsapp.replace(/\D/g, "") === whatsappDigits)) {
      return {
        ok: false,
        error: "Ce numéro WhatsApp est déjà inscrit. Merci !",
        fieldErrors: { whatsapp: "Numéro déjà inscrit." },
      };
    }
  }

  if (existing) {
    return {
      ok: false,
      error: "Ce numéro WhatsApp est déjà inscrit. Merci !",
      fieldErrors: { whatsapp: "Numéro déjà inscrit." },
    };
  }

  const { error } = await supabase.from("participants").insert({
    nom: data.nom,
    prenom: data.prenom,
    whatsapp: normalizedWhatsapp,
    telephone: normalizePhone(data.telephone),
    ville: data.ville,
    quartier: data.quartier,
    email: data.email || null,
    sexe: data.sexe,
    age: data.age,
    eglise: data.eglise || null,
    source: data.source || null,
    agape: data.agape,
    status: "nouveau",
    contacte: false,
  });

  if (error) {
    // Violation de contrainte d'unicité côté base.
    if (error.code === "23505") {
      return {
        ok: false,
        error: "Ce numéro WhatsApp est déjà inscrit. Merci !",
        fieldErrors: { whatsapp: "Numéro déjà inscrit." },
      };
    }
    return {
      ok: false,
      error: "Une erreur est survenue. Merci de réessayer dans un instant.",
    };
  }

  // Notification email à TOUS les administrateurs — échec non bloquant.
  try {
    const { data: admins } = await supabase.from("admins").select("email");
    const adminEmails = (admins ?? [])
      .map((a: { email: string }) => a.email)
      .filter(Boolean);
    await sendNewRegistrationEmail(data, adminEmails);
  } catch {
    /* on n'empêche pas l'inscription si l'email échoue */
  }

  // Email de confirmation au participant (s'il a laissé son adresse).
  if (data.email) {
    try {
      await sendParticipantConfirmationEmail({
        prenom: data.prenom,
        nom: data.nom,
        email: data.email,
        agape: data.agape,
      });
    } catch {
      /* non bloquant */
    }
  }

  return { ok: true };
}
