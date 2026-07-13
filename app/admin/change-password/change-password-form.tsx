"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { changePasswordAction } from "@/app/admin/actions";
import { swalError, swalSuccess } from "@/lib/swal";

export function ChangePasswordForm({
  forced,
  email,
}: {
  forced: boolean;
  email: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      swalError(
        "Mot de passe trop court",
        "Il doit contenir au moins 8 caractères."
      );
      return;
    }
    if (password !== confirm) {
      swalError(
        "Les mots de passe ne correspondent pas",
        "Vérifie la confirmation."
      );
      return;
    }

    startTransition(async () => {
      const res = await changePasswordAction(password, confirm);
      if (res.ok) {
        await swalSuccess(
          "Mot de passe mis à jour",
          "Bienvenue dans l'espace administrateur."
        );
        router.replace("/admin");
        router.refresh();
      } else {
        swalError("Échec", res.error ?? "Une erreur est survenue.");
      }
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {forced && (
        <div className="flex items-start gap-2 rounded-lg bg-primary/10 p-3 text-sm text-primary">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Pour ta sécurité, tu dois définir un nouveau mot de passe avant
            d'accéder à la plateforme.
          </span>
        </div>
      )}

      <div>
        <Label className="text-muted-foreground">Compte</Label>
        <p className="mt-1 truncate rounded-lg bg-muted px-3 py-2 text-sm font-medium">
          {email}
        </p>
      </div>

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
            <ShieldCheck className="h-4 w-4" /> Valider mon mot de passe
          </>
        )}
      </Button>
    </form>
  );
}
