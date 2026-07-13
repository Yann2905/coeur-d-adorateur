import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatte une date ISO en français (ex: "13 juillet 2026 à 14:32"). */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

/** Date courte (ex: "13 juil. 2026"). */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(
      new Date(iso)
    );
  } catch {
    return "—";
  }
}

/** Nettoie un numéro de téléphone : ne garde que le "+" initial et les chiffres. */
export function normalizePhone(raw: string): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
}

/** Construit un lien wa.me à partir d'un numéro (retire les caractères non numériques). */
export function whatsappLink(phone: string, message?: string): string {
  const digits = phone.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Lien d'appel tel: */
export function telLink(phone: string): string {
  return `tel:${normalizePhone(phone)}`;
}

/** Initiales pour les avatars. */
export function initials(nom?: string | null, prenom?: string | null): string {
  const a = (prenom ?? "").trim().charAt(0);
  const b = (nom ?? "").trim().charAt(0);
  return (a + b).toUpperCase() || "?";
}
