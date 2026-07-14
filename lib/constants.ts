export const PROGRAM_NAME = "Cœur d'Adorateur";
export const PROGRAM_DATE_LABEL = "31 Octobre 2026";
export const PROGRAM_DATE_ISO = "2026-10-31T00:00:00.000Z";

/** Heure et lieu du programme. */
export const PROGRAM_TIME_LABEL = "9h00";
export const PROGRAM_VENUE = "MIDC, Daloa";
export const PROGRAM_VENUE_SHORT = "MIDC Daloa";
/** Lien Google Maps (localisation) et itinéraire (navigation). */
export const PROGRAM_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=MIDC+Daloa";
export const PROGRAM_DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=MIDC+Daloa";

/** Statuts possibles d'un participant. */
export const STATUSES = [
  "nouveau",
  "contacte",
  "confirme",
  "present",
  "absent",
] as const;

export type Status = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<Status, string> = {
  nouveau: "Nouveau",
  contacte: "Contacté",
  confirme: "Confirmé",
  present: "Présent",
  absent: "Absent",
};

/** Classes Tailwind pour le badge de chaque statut. */
export const STATUS_STYLES: Record<Status, string> = {
  nouveau:
    "bg-blue-500/10 text-blue-600 ring-blue-500/20 dark:text-blue-400",
  contacte:
    "bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:text-amber-400",
  confirme:
    "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400",
  present:
    "bg-violet-500/10 text-violet-600 ring-violet-500/20 dark:text-violet-400",
  absent:
    "bg-rose-500/10 text-rose-600 ring-rose-500/20 dark:text-rose-400",
};

export const SEXE_OPTIONS = [
  { value: "homme", label: "Homme" },
  { value: "femme", label: "Femme" },
] as const;

export const AGE_OPTIONS = [
  { value: "moins_18", label: "Moins de 18 ans" },
  { value: "18_25", label: "18 – 25 ans" },
  { value: "26_35", label: "26 – 35 ans" },
  { value: "36_45", label: "36 – 45 ans" },
  { value: "46_60", label: "46 – 60 ans" },
  { value: "plus_60", label: "Plus de 60 ans" },
] as const;

export const SOURCE_OPTIONS = [
  { value: "eglise", label: "Mon église" },
  { value: "ami", label: "Un ami / proche" },
  { value: "reseaux", label: "Réseaux sociaux" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "affiche", label: "Affiche / flyer" },
  { value: "autre", label: "Autre" },
] as const;

export function labelFor(
  options: readonly { value: string; label: string }[],
  value: string | null | undefined
): string {
  if (!value) return "—";
  return options.find((o) => o.value === value)?.label ?? value;
}
