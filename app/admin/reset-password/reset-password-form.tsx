"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, KeyRound, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { createClient } from "@/lib/supabase/client";
import { swalSuccess, swalError } from "@/lib/swal";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      swalError("Mot de passe trop court", "Au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      swalError("Les mots de passe ne correspondent pas", "Vérifie la confirmation.");
      return;
    }
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        swalError(
          "Lien invalide ou expiré",
          "Ouvre à nouveau le lien reçu par email, ou refais une demande de réinitialisation."
        );
        return;
      }
      await supabase.auth.signOut();
      await swalSuccess(
        "Mot de passe modifié",
        "Tu peux maintenant te connecter avec ton nouveau mot de passe."
      );
      router.replace("/admin/login");
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label htmlFor="new-password" className="flex items-center gap-1.5">
          <KeyRound className="h-3.5 w-3.5" /> Nouveau mot de passe
        </Label>
        <PasswordInput
          id="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          placeholder="Au moins 8 caractères"
          className="mt-1.5"
          required
        />
      </div>
      <div>
        <Label htmlFor="confirm-password">Confirmation du mot de passe</Label>
        <PasswordInput
          id="confirm-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          placeholder="Retape le mot de passe"
          className="mt-1.5"
          required
        />
      </div>
      <Button type="submit" className="h-11 w-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Enregistrement...
          </>
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" /> Valider
          </>
        )}
      </Button>
    </form>
  );
}
