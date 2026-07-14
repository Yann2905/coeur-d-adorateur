"use client";

import { useState } from "react";
import { MailCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { swalSuccess, swalError } from "@/lib/swal";
import { sendTestEmailAction } from "@/app/admin/actions";

export function TestEmailButton() {
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await sendTestEmailAction();
      if (res.ok) {
        await swalSuccess(
          "Email de test envoyé",
          `Envoyé via ${res.via} à ${res.to}. Vérifie ta boîte de réception (et les spams).`
        );
      } else {
        await swalError(
          `Échec de l'envoi (via ${res.via})`,
          res.error ?? "Erreur inconnue."
        );
      }
    } catch (e) {
      await swalError("Erreur", (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={run} disabled={loading}>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <MailCheck className="h-4 w-4" />
      )}
      Tester l'envoi d'email
    </Button>
  );
}
