"use client";

import { useActionState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Lock, LogIn } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { loginAction, type ActionResult } from "@/app/admin/actions";
import { swalError } from "@/lib/swal";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="h-11 w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Connexion...
        </>
      ) : (
        <>
          <LogIn className="h-4 w-4" /> Se connecter
        </>
      )}
    </Button>
  );
}

export function LoginForm() {
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/admin";
  const urlError = params.get("error");

  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    loginAction,
    null
  );

  // Affiche l'erreur du serveur via SweetAlert2.
  useEffect(() => {
    if (state?.error) {
      swalError("Connexion refusee", state.error);
    }
  }, [state]);

  // Erreur transmise par l'URL (ex. compte non autorise) : une seule fois.
  const urlShown = useRef(false);
  useEffect(() => {
    if (urlError === "unauthorized" && !urlShown.current) {
      urlShown.current = true;
      swalError(
        "Acces non autorise",
        "Ce compte n'est pas autorise a acceder a l'administration."
      );
    }
  }, [urlError]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirect" value={redirect} />

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="admin@exemple.com"
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="password" className="flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5" /> Mot de passe
        </Label>
        <PasswordInput
          id="password"
          name="password"
          required
          autoComplete="current-password"
          placeholder="Ton mot de passe"
          className="mt-1.5"
        />
      </div>

      <SubmitButton />

      <p className="text-center text-xs text-muted-foreground">
        Acces reserve a l'equipe organisatrice.
      </p>
    </form>
  );
}
