"use client";

import { useState, useTransition } from "react";
import { Loader2, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { swalSuccess, swalError } from "@/lib/swal";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: `${window.location.origin}/admin/reset-password` }
      );
      if (error) {
        swalError("Erreur", error.message);
      } else {
        setSent(true);
        await swalSuccess(
          "Email envoyé",
          "Si ce compte existe, un lien de réinitialisation vient d'être envoyé. Vérifie ta boîte de réception (et les spams)."
        );
      }
    });
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
          <Mail className="h-6 w-6" />
        </div>
        <p className="text-sm text-muted-foreground">
          Un lien de réinitialisation a été envoyé à{" "}
          <strong className="text-foreground">{email}</strong> (s'il existe un
          compte). Pense à vérifier tes spams.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Saisis ton email : nous t'enverrons un lien pour choisir un nouveau mot
        de passe.
      </p>
      <div>
        <Label htmlFor="email" className="flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5" /> Email
        </Label>
        <Input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@exemple.com"
          className="mt-1.5"
        />
      </div>
      <Button type="submit" className="h-11 w-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Envoi...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" /> Envoyer le lien
          </>
        )}
      </Button>
    </form>
  );
}
