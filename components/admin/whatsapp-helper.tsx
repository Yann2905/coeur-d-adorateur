"use client";

import { useMemo, useState } from "react";
import { MessageCircle, Copy, Check, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { whatsappLink, initials } from "@/lib/utils";
import { swalToast, swalError } from "@/lib/swal";
import {
  STATUSES,
  STATUS_LABELS,
  PROGRAM_DATE_LABEL,
  type Status,
} from "@/lib/constants";
import type { PresenceRow } from "@/lib/data";

const ALL = "__all__";

const DEFAULT_MESSAGE = `Bonjour {prenom}, c'est l'équipe de Cœur d'Adorateur. Nous te rappelons le programme d'adoration du ${PROGRAM_DATE_LABEL}. Au plaisir de te voir !`;

export function WhatsappHelper({ rows }: { rows: PresenceRow[] }) {
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [statusFilter, setStatusFilter] = useState<string>(ALL);
  const [copied, setCopied] = useState(false);

  const filtered = useMemo(
    () =>
      statusFilter === ALL
        ? rows
        : rows.filter((r) => r.status === statusFilter),
    [rows, statusFilter]
  );

  const personalize = (prenom: string) =>
    message.replace(/\{prenom\}/gi, prenom);

  const copyNumbers = async () => {
    const numbers = filtered.map((r) => r.whatsapp).join("\n");
    try {
      await navigator.clipboard.writeText(numbers);
      setCopied(true);
      swalToast("success", `${filtered.length} numéro(s) copié(s)`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      swalError("Copie impossible");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div>
            <Label htmlFor="msg" className="mb-1.5 block">
              Message à envoyer
            </Label>
            <Textarea
              id="msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Astuce : écris <code className="rounded bg-muted px-1">{"{prenom}"}</code>{" "}
              — il sera remplacé par le prénom de chaque personne.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full sm:w-64">
              <Label className="mb-1.5 block text-xs">Filtrer par statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Tous les participants</SelectItem>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="h-4 w-4" /> {filtered.length} personne(s)
              </span>
              <Button variant="outline" onClick={copyNumbers}>
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                Copier les numéros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {filtered.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-xs font-semibold text-white">
                {initials(r.nom, r.prenom)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {r.prenom} {r.nom}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {r.whatsapp} · {r.ville}
                </p>
              </div>
            </div>
            <Button asChild size="sm" variant="success" className="shrink-0">
              <a
                href={whatsappLink(r.whatsapp, personalize(r.prenom))}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4" /> Envoyer
              </a>
            </Button>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Aucun participant pour ce filtre.
          </p>
        )}
      </div>
    </div>
  );
}
