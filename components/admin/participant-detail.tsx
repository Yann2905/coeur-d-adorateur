"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { swalToast, swalError, swalConfirm } from "@/lib/swal";
import {
  Pencil,
  Save,
  X,
  Trash2,
  Check,
  PhoneCall,
  StickyNote,
  Loader2,
  History,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { ContactButtons } from "@/components/admin/contact-buttons";
import {
  STATUSES,
  STATUS_LABELS,
  SEXE_OPTIONS,
  AGE_OPTIONS,
  SOURCE_OPTIONS,
  labelFor,
  type Status,
} from "@/lib/constants";
import { formatDateTime, initials } from "@/lib/utils";
import type { Participant, ParticipantHistory } from "@/lib/types";
import {
  updateParticipantAction,
  updateStatusAction,
  toggleContactedAction,
  saveNoteAction,
  deleteParticipantAction,
} from "@/app/admin/actions";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value || "—"}</span>
    </div>
  );
}

export function ParticipantDetail({
  participant,
  history,
}: {
  participant: Participant;
  history: ParticipantHistory[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState(participant.notes_admin ?? "");
  const [form, setForm] = useState(participant);

  const setField = (k: keyof Participant, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleStatus = (status: Status) => {
    startTransition(async () => {
      const r = await updateStatusAction(participant.id, status);
      if (r.ok) {
        swalToast("success", `Statut : ${STATUS_LABELS[status]}`);
        router.refresh();
      } else swalError("Erreur", r.error);
    });
  };

  const handleContacted = () => {
    startTransition(async () => {
      const r = await toggleContactedAction(participant.id, !participant.contacte);
      if (r.ok) {
        swalToast(
          "success",
          participant.contacte ? "Marque non contacte" : "Marque comme contacte"
        );
        router.refresh();
      } else swalError("Erreur", r.error);
    });
  };

  const handleSaveNote = () => {
    startTransition(async () => {
      const r = await saveNoteAction(participant.id, note);
      if (r.ok) {
        swalToast("success", "Note enregistree");
        router.refresh();
      } else swalError("Erreur", r.error);
    });
  };

  const handleSaveEdit = () => {
    startTransition(async () => {
      const r = await updateParticipantAction({
        id: form.id,
        nom: form.nom,
        prenom: form.prenom,
        whatsapp: form.whatsapp,
        telephone: form.telephone,
        ville: form.ville,
        quartier: form.quartier,
        email: form.email ?? "",
        sexe: form.sexe ?? "",
        age: form.age ?? "",
        eglise: form.eglise ?? "",
        source: form.source ?? "",
        agape: form.agape,
        status: form.status,
        contacte: form.contacte,
        notes_admin: note,
      });
      if (r.ok) {
        swalToast("success", "Fiche mise a jour");
        setEditing(false);
        router.refresh();
      } else swalError("Erreur", r.error);
    });
  };

  const handleDelete = async () => {
    const confirmed = await swalConfirm({
      title: "Supprimer ce participant ?",
      text: `${participant.prenom} ${participant.nom} sera definitivement supprime. Cette action est irreversible.`,
      confirmText: "Oui, supprimer",
      danger: true,
    });
    if (!confirmed) return;
    startTransition(async () => {
      const r = await deleteParticipantAction(participant.id);
      if (r.ok) {
        swalToast("success", "Participant supprime");
        router.push("/admin/participants");
      } else swalError("Erreur", r.error);
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Colonne principale */}
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient text-lg font-semibold text-white">
                  {initials(participant.nom, participant.prenom)}
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold">
                    {participant.prenom} {participant.nom}
                  </h1>
                  <div className="mt-1 flex items-center gap-2">
                    <StatusBadge status={participant.status} />
                    {participant.contacte && (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                        <ShieldCheck className="h-3.5 w-3.5" /> Contacté
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {!editing && (
                <Button variant="outline" onClick={() => setEditing(true)}>
                  <Pencil className="h-4 w-4" /> Modifier
                </Button>
              )}
            </div>

            <div className="mt-5">
              <ContactButtons
                id={participant.id}
                prenom={participant.prenom}
                telephone={participant.telephone}
                whatsapp={participant.whatsapp}
                size="default"
                showDetails={false}
              />
            </div>
          </CardContent>
        </Card>

        {/* Informations / Édition */}
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-2 font-display text-lg font-semibold">
              {editing ? "Modifier les informations" : "Informations"}
            </h2>

            {!editing ? (
              <div className="divide-y divide-border">
                <Row label="Prénom" value={participant.prenom} />
                <Row label="Nom" value={participant.nom} />
                <Row label="WhatsApp" value={participant.whatsapp} />
                <Row label="Téléphone" value={participant.telephone} />
                <Row label="Email" value={participant.email} />
                <Row label="Ville" value={participant.ville} />
                <Row label="Quartier" value={participant.quartier} />
                <Row label="Sexe" value={labelFor(SEXE_OPTIONS, participant.sexe)} />
                <Row label="Tranche d'âge" value={labelFor(AGE_OPTIONS, participant.age)} />
                <Row label="Église" value={participant.eglise} />
                <Row label="Source" value={labelFor(SOURCE_OPTIONS, participant.source)} />
                <Row
                  label="Agapé"
                  value={
                    participant.agape ? (
                      <span className="text-gold-foreground">Oui</span>
                    ) : (
                      "Non"
                    )
                  }
                />
                <Row
                  label="Date d'inscription"
                  value={formatDateTime(participant.created_at)}
                />
                {participant.updated_at && (
                  <Row
                    label="Dernière modification"
                    value={formatDateTime(participant.updated_at)}
                  />
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Prénom</Label>
                    <Input
                      className="mt-1.5"
                      value={form.prenom}
                      onChange={(e) => setField("prenom", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Nom</Label>
                    <Input
                      className="mt-1.5"
                      value={form.nom}
                      onChange={(e) => setField("nom", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>WhatsApp</Label>
                    <Input
                      className="mt-1.5"
                      value={form.whatsapp}
                      onChange={(e) => setField("whatsapp", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Téléphone</Label>
                    <Input
                      className="mt-1.5"
                      value={form.telephone}
                      onChange={(e) => setField("telephone", e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Email</Label>
                    <Input
                      className="mt-1.5"
                      value={form.email ?? ""}
                      onChange={(e) => setField("email", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Ville</Label>
                    <Input
                      className="mt-1.5"
                      value={form.ville}
                      onChange={(e) => setField("ville", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Quartier</Label>
                    <Input
                      className="mt-1.5"
                      value={form.quartier}
                      onChange={(e) => setField("quartier", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Sexe</Label>
                    <Select
                      value={form.sexe ?? ""}
                      onValueChange={(v) => setField("sexe", v)}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                      <SelectContent>
                        {SEXE_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tranche d'âge</Label>
                    <Select
                      value={form.age ?? ""}
                      onValueChange={(v) => setField("age", v)}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                      <SelectContent>
                        {AGE_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Église</Label>
                    <Input
                      className="mt-1.5"
                      value={form.eglise ?? ""}
                      onChange={(e) => setField("eglise", e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <input
                    type="checkbox"
                    id="agape-edit"
                    checked={form.agape}
                    onChange={(e) => setField("agape", e.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                  <Label htmlFor="agape-edit" className="cursor-pointer">
                    Disponible pour l'agapé
                  </Label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveEdit} disabled={pending}>
                    {pending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Enregistrer
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setForm(participant);
                      setEditing(false);
                    }}
                    disabled={pending}
                  >
                    <X className="h-4 w-4" /> Annuler
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Historique */}
        {history.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
                <History className="h-4 w-4" /> Historique des modifications
              </h2>
              <ol className="relative space-y-4 border-l border-border pl-5">
                {history.map((h) => (
                  <li key={h.id} className="relative">
                    <span className="absolute -left-[22px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                    <p className="text-sm font-medium">{h.details ?? h.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(h.created_at)}
                      {h.admin_email ? ` · ${h.admin_email}` : ""}
                    </p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Colonne latérale — Actions rapides */}
      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="font-display text-lg font-semibold">Actions rapides</h2>

            <div>
              <Label className="mb-1.5 block">Statut</Label>
              <Select
                value={participant.status}
                onValueChange={(v) => handleStatus(v as Status)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant={participant.contacte ? "secondary" : "success"}
              className="w-full"
              onClick={handleContacted}
              disabled={pending}
            >
              {participant.contacte ? (
                <>
                  <PhoneCall className="h-4 w-4" /> Marquer non contacté
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" /> Marquer comme contacté
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Note interne */}
        <Card>
          <CardContent className="space-y-3 p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <StickyNote className="h-4 w-4" /> Note interne
            </h2>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ajoute une note visible uniquement par l'équipe…"
              rows={5}
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={handleSaveNote}
              disabled={pending}
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Enregistrer la note
            </Button>
          </CardContent>
        </Card>

        <Button
          variant="ghost"
          className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleDelete}
          disabled={pending}
        >
          <Trash2 className="h-4 w-4" /> Supprimer ce participant
        </Button>
      </div>
    </div>
  );
}
