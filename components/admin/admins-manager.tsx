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
  Pencil,
  X,
  Save,
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
  updateAdminAction,
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

  // Édition d'un admin existant.
  const [editing, setEditing] = useState<Admin | null>(null);
  const [editForm, setEditForm] = useState(empty);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const set = (k: keyof typeof empty, v: string) => {
    setValues((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };

  const setEdit = (k: keyof typeof empty, v: string) => {
    setEditForm((s) => ({ ...s, [k]: v }));
    if (editErrors[k]) setEditErrors((e) => ({ ...e, [k]: "" }));
  };

  const openEdit = (a: Admin) => {
    setEditErrors({});
    setEditForm({
      prenom: a.prenom ?? "",
      nom: a.nom ?? "",
      email: a.email,
      genre: a.genre ?? "",
      telephone: a.telephone ?? "",
      role: a.role,
    });
    setEditing(a);
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    startTransition(async () => {
      const res = await updateAdminAction({ id: editing.id, ...editForm });
      if (res.ok) {
        swalToast(
          res.emailSent === false ? "warning" : "success",
          res.emailSent === false
            ? "Modifié (email non envoyé)"
            : "Administrateur modifié, email envoyé"
        );
        setEditing(null);
        router.refresh();
      } else {
        if (res.fieldErrors) setEditErrors(res.fieldErrors);
        swalError("Modification impossible", res.error ?? "Une erreur est survenue.");
      }
    });
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
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-primary"
                        onClick={() => openEdit(a)}
                        disabled={pending}
                        aria-label="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
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
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modale d'édition */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !pending && setEditing(null)}
          />
          <div className="relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-card p-6 shadow-xl sm:max-w-md sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">
                Modifier l'administrateur
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditing(null)}
                disabled={pending}
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={saveEdit} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Prénom *</Label>
                  <Input
                    className={cn("mt-1.5", editErrors.prenom && "border-destructive")}
                    value={editForm.prenom}
                    onChange={(e) => setEdit("prenom", e.target.value)}
                  />
                  <FieldError msg={editErrors.prenom} />
                </div>
                <div>
                  <Label>Nom *</Label>
                  <Input
                    className={cn("mt-1.5", editErrors.nom && "border-destructive")}
                    value={editForm.nom}
                    onChange={(e) => setEdit("nom", e.target.value)}
                  />
                  <FieldError msg={editErrors.nom} />
                </div>
              </div>

              <div>
                <Label>Email (identifiant) *</Label>
                <Input
                  type="email"
                  className={cn("mt-1.5", editErrors.email && "border-destructive")}
                  value={editForm.email}
                  onChange={(e) => setEdit("email", e.target.value)}
                />
                <FieldError msg={editErrors.email} />
                <p className="mt-1 text-xs text-muted-foreground">
                  Modifier l'email change aussi l'identifiant de connexion.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Genre *</Label>
                  <Select
                    value={editForm.genre}
                    onValueChange={(v) => setEdit("genre", v)}
                  >
                    <SelectTrigger
                      className={cn("mt-1.5", editErrors.genre && "border-destructive")}
                    >
                      <SelectValue placeholder="Sélectionne" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homme">Homme</SelectItem>
                      <SelectItem value="femme">Femme</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError msg={editErrors.genre} />
                </div>
                <div>
                  <Label>Numéro *</Label>
                  <PhoneField
                    value={editForm.telephone}
                    onChange={(v) => setEdit("telephone", v)}
                    invalid={!!editErrors.telephone}
                    className="mt-1.5"
                  />
                  <FieldError msg={editErrors.telephone} />
                </div>
              </div>

              <div>
                <Label>Rôle</Label>
                <Select
                  value={editForm.role}
                  onValueChange={(v) => setEdit("role", v)}
                >
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
              </div>

              <div className="flex gap-2 pt-1">
                <Button type="submit" className="flex-1" disabled={pending}>
                  {pending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Enregistrer
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditing(null)}
                  disabled={pending}
                >
                  Annuler
                </Button>
              </div>
              <p className="text-center text-xs text-muted-foreground">
                L'administrateur recevra un email détaillant les changements.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
