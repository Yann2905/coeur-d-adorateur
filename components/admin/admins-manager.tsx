"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { swalToast, swalError, swalConfirm } from "@/lib/swal";
import {
  UserPlus,
  Loader2,
  Trash2,
  Mail,
  Phone,
  ShieldCheck,
  Shield,
  Copy,
  Check,
  AlertTriangle,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneField } from "@/components/ui/phone-field";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatDate, initials } from "@/lib/utils";
import type { Admin } from "@/lib/types";
import {
  createAdminAction,
  deleteAdminAction,
} from "@/app/admin/actions";

const empty = {
  prenom: "",
  nom: "",
  email: "",
  genre: "",
  telephone: "",
  role: "admin",
};

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs font-medium text-destructive">{msg}</p>;
}

export function AdminsManager({
  admins,
  currentEmail,
}: {
  admins: Admin[];
  currentEmail: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [created, setCreated] = useState<{
    email: string;
    password: string;
    emailSent: boolean;
    emailError?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const set = (k: keyof typeof empty, v: string) => {
    setValues((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreated(null);
    startTransition(async () => {
      const res = await createAdminAction(values);
      if (res.ok) {
        setCreated({
          email: values.email,
          password: res.password ?? "",
          emailSent: !!res.emailSent,
          emailError: res.emailError,
        });
        swalToast(
          res.emailSent ? "success" : "warning",
          res.emailSent
            ? "Administrateur cree, email envoye"
            : "Administrateur cree (email non envoye, voir le mot de passe)"
        );
        setValues(empty);
        setErrors({});
        router.refresh();
      } else {
        if (res.fieldErrors) setErrors(res.fieldErrors);
        swalError("Creation impossible", res.error ?? "Une erreur est survenue.");
      }
    });
  };

  const remove = async (a: Admin) => {
    const confirmed = await swalConfirm({
      title: "Retirer cet administrateur ?",
      text: `${a.prenom ?? ""} ${a.nom ?? a.email} perdra son acces a la plateforme.`,
      confirmText: "Oui, retirer",
      danger: true,
    });
    if (!confirmed) return;
    startTransition(async () => {
      const res = await deleteAdminAction(a.id);
      if (res.ok) {
        swalToast("success", "Administrateur retire");
        router.refresh();
      } else swalError("Erreur", res.error);
    });
  };

  const copyPassword = async () => {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(
        `Identifiant : ${created.email}\nMot de passe : ${created.password}`
      );
      setCopied(true);
      swalToast("success", "Identifiants copies");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      swalError("Copie impossible");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Formulaire d'ajout */}
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-semibold">
              <UserPlus className="h-5 w-5 text-primary" /> Ajouter un
              administrateur
            </h2>
            <p className="mb-5 text-sm text-muted-foreground">
              Son compte est créé automatiquement et ses identifiants lui sont
              envoyés par email.
            </p>

            <form onSubmit={submit} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Prénom *</Label>
                  <Input
                    className={cn("mt-1.5", errors.prenom && "border-destructive")}
                    value={values.prenom}
                    onChange={(e) => set("prenom", e.target.value)}
                    placeholder="Prénom"
                  />
                  <FieldError msg={errors.prenom} />
                </div>
                <div>
                  <Label>Nom *</Label>
                  <Input
                    className={cn("mt-1.5", errors.nom && "border-destructive")}
                    value={values.nom}
                    onChange={(e) => set("nom", e.target.value)}
                    placeholder="Nom"
                  />
                  <FieldError msg={errors.nom} />
                </div>
              </div>

              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  className={cn("mt-1.5", errors.email && "border-destructive")}
                  value={values.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="admin@exemple.com"
                />
                <FieldError msg={errors.email} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Genre *</Label>
                  <Select
                    value={values.genre}
                    onValueChange={(v) => set("genre", v)}
                  >
                    <SelectTrigger
                      className={cn("mt-1.5", errors.genre && "border-destructive")}
                    >
                      <SelectValue placeholder="Sélectionne" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homme">Homme</SelectItem>
                      <SelectItem value="femme">Femme</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError msg={errors.genre} />
                </div>
                <div>
                  <Label>Numéro *</Label>
                  <PhoneField
                    value={values.telephone}
                    onChange={(v) => set("telephone", v)}
                    invalid={!!errors.telephone}
                    className="mt-1.5"
                  />
                  <FieldError msg={errors.telephone} />
                </div>
              </div>

              <div>
                <Label>Rôle</Label>
                <Select value={values.role} onValueChange={(v) => set("role", v)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="super_admin">
                      Super administrateur
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-muted-foreground">
                  Un super administrateur peut lui aussi ajouter / retirer des
                  admins.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Création…
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" /> Créer l'administrateur
                  </>
                )}
              </Button>
            </form>

            {/* Résultat : identifiants générés */}
            {created && (
              <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <KeyRound className="h-4 w-4" />
                  <p className="text-sm font-semibold">Compte créé</p>
                </div>
                <div className="mt-3 space-y-1.5 rounded-lg bg-background p-3 font-mono text-sm">
                  <p>
                    <span className="text-muted-foreground">Identifiant : </span>
                    {created.email}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Mot de passe : </span>
                    <strong>{created.password}</strong>
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={copyPassword}>
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    Copier
                  </Button>
                  {!created.emailSent && (
                    <span className="flex items-center gap-1 text-xs text-amber-600">
                      <AlertTriangle className="h-3.5 w-3.5" /> Email non envoyé —
                      transmets ces infos manuellement.
                    </span>
                  )}
                </div>
                {!created.emailSent && created.emailError && (
                  <p className="mt-2 break-words rounded-md bg-amber-500/10 p-2 text-[11px] text-amber-700 dark:text-amber-400">
                    Raison : {created.emailError}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Liste des admins */}
      <div className="lg:col-span-3">
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 font-display text-lg font-semibold">
              Équipe administrateur ({admins.length})
            </h2>
            <div className="space-y-3">
              {admins.map((a) => {
                const isSuper = a.role === "super_admin";
                const isSelf = a.email === currentEmail;
                return (
                  <div
                    key={a.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border p-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-sm font-semibold text-white">
                        {a.prenom || a.nom
                          ? initials(a.nom, a.prenom)
                          : a.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-2 font-medium">
                          {a.prenom || a.nom
                            ? `${a.prenom ?? ""} ${a.nom ?? ""}`.trim()
                            : a.email}
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset",
                              isSuper
                                ? "bg-primary/10 text-primary ring-primary/20"
                                : "bg-muted text-muted-foreground ring-border"
                            )}
                          >
                            {isSuper ? (
                              <ShieldCheck className="h-3 w-3" />
                            ) : (
                              <Shield className="h-3 w-3" />
                            )}
                            {isSuper ? "Super admin" : "Admin"}
                          </span>
                          {isSelf && (
                            <span className="text-[10px] text-muted-foreground">
                              (toi)
                            </span>
                          )}
                        </p>
                        <p className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {a.email}
                          </span>
                          {a.telephone && (
                            <span className="inline-flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {a.telephone}
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Ajouté le {formatDate(a.created_at)}
                        </p>
                      </div>
                    </div>
                    {!isSelf && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => remove(a)}
                        disabled={pending}
                        aria-label="Retirer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
