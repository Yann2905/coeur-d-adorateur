"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { swalToast, swalError } from "@/lib/swal";
import { Button } from "@/components/ui/button";
import { exportParticipantsAction } from "@/app/admin/actions";
import {
  STATUS_LABELS,
  labelFor,
  SEXE_OPTIONS,
  AGE_OPTIONS,
  SOURCE_OPTIONS,
  type Status,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";

export function ExportButton() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await exportParticipantsAction();
      if (!res.ok || !res.rows) {
        swalError("Export impossible", res.error);
        return;
      }
      // Import dynamique de xlsx (allège le bundle initial).
      const XLSX = await import("xlsx");
      const data = res.rows.map((p) => ({
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
      XLSX.writeFile(wb, `coeur-adorateur-inscrits-${stamp}.xlsx`);
      swalToast("success", `${data.length} inscrit(s) exporte(s)`);
    } catch {
      swalError("Erreur", "Une erreur est survenue pendant l'export.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleExport} disabled={loading}>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      Export Excel
    </Button>
  );
}
