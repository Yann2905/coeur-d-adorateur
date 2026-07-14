"use client";

import {
  STATUS_LABELS,
  labelFor,
  SEXE_OPTIONS,
  AGE_OPTIONS,
  SOURCE_OPTIONS,
  type Status,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import type { Participant } from "@/lib/types";

/** Génère et télécharge un fichier Excel des participants fournis. */
export async function downloadParticipantsExcel(
  rows: Participant[],
  filenameSuffix = ""
): Promise<number> {
  const XLSX = await import("xlsx");
  const data = rows.map((p) => ({
    Prénom: p.prenom,
    Nom: p.nom,
    WhatsApp: p.whatsapp,
    Téléphone: p.telephone,
    Ville: p.ville,
    Quartier: p.quartier,
    Email: p.email ?? "",
    Sexe: labelFor(SEXE_OPTIONS, p.sexe),
    "Tranche d'âge": labelFor(AGE_OPTIONS, p.age),
    Église: p.eglise ?? "",
    Source: labelFor(SOURCE_OPTIONS, p.source),
    Agapé: p.agape ? "Oui" : "Non",
    Statut: STATUS_LABELS[p.status as Status] ?? p.status,
    Contacté: p.contacte ? "Oui" : "Non",
    "Date d'inscription": formatDateTime(p.created_at),
    Notes: p.notes_admin ?? "",
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = Object.keys(data[0] ?? { a: 1 }).map(() => ({ wch: 18 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Inscrits");
  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(
    wb,
    `coeur-adorateur-inscrits${filenameSuffix ? "-" + filenameSuffix : ""}-${stamp}.xlsx`
  );
  return data.length;
}
