"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { swalToast, swalError } from "@/lib/swal";
import { Button } from "@/components/ui/button";
import { exportParticipantsAction } from "@/app/admin/actions";
import { downloadParticipantsExcel } from "@/lib/xlsx-export";

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
      const n = await downloadParticipantsExcel(res.rows);
      swalToast("success", `${n} inscrit(s) exporte(s)`);
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
