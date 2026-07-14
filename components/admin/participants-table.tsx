"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Download, Check, X, Loader2, PhoneCall } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { ContactButtons } from "@/components/admin/contact-buttons";
import { formatDate, initials } from "@/lib/utils";
import { swalToast, swalError } from "@/lib/swal";
import { STATUSES, STATUS_LABELS, type Status } from "@/lib/constants";
import { downloadParticipantsExcel } from "@/lib/xlsx-export";
import {
  bulkUpdateStatusAction,
  bulkToggleContactedAction,
} from "@/app/admin/actions";
import type { Participant } from "@/lib/types";
import { useRouter } from "next/navigation";

export function ParticipantsTable({ rows }: { rows: Participant[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const allSelected = rows.length > 0 && selected.size === rows.length;
  const someSelected = selected.size > 0;

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)));

  const selectedRows = useMemo(
    () => rows.filter((r) => selected.has(r.id)),
    [rows, selected]
  );

  const doBulkStatus = (status: Status) => {
    startTransition(async () => {
      const res = await bulkUpdateStatusAction([...selected], status);
      if (res.ok) {
        swalToast("success", `${selected.size} mis à jour → ${STATUS_LABELS[status]}`);
        setSelected(new Set());
        router.refresh();
      } else swalError("Erreur", res.error);
    });
  };

  const doBulkContacted = () => {
    startTransition(async () => {
      const res = await bulkToggleContactedAction([...selected], true);
      if (res.ok) {
        swalToast("success", `${selected.size} marqué(s) contacté(s)`);
        setSelected(new Set());
        router.refresh();
      } else swalError("Erreur", res.error);
    });
  };

  const doExportSelection = async () => {
    try {
      const n = await downloadParticipantsExcel(selectedRows, "selection");
      swalToast("success", `${n} inscrit(s) exporté(s)`);
    } catch {
      swalError("Erreur", "Export impossible.");
    }
  };

  return (
    <div className="space-y-3">
      {/* Barre d'actions groupées */}
      {someSelected && (
        <div className="sticky top-16 z-20 flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3 lg:top-2">
          <span className="mr-1 text-sm font-medium">
            {selected.size} sélectionné(s)
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={doBulkContacted}
            disabled={pending}
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PhoneCall className="h-4 w-4" />
            )}
            Marquer contacté
          </Button>
          <Select onValueChange={(v) => doBulkStatus(v as Status)}>
            <SelectTrigger className="h-9 w-[180px]">
              <SelectValue placeholder="Changer le statut…" />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={doExportSelection}>
            <Download className="h-4 w-4" /> Exporter la sélection
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelected(new Set())}
          >
            <X className="h-4 w-4" /> Effacer
          </Button>
        </div>
      )}

      {/* Tableau (desktop) */}
      <div className="hidden rounded-xl border border-border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Tout sélectionner"
                />
              </TableHead>
              <TableHead>Participant</TableHead>
              <TableHead>Ville / Quartier</TableHead>
              <TableHead>Contacts</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Inscription</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow
                key={p.id}
                data-state={selected.has(p.id) ? "selected" : undefined}
              >
                <TableCell>
                  <Checkbox
                    checked={selected.has(p.id)}
                    onCheckedChange={() => toggle(p.id)}
                    aria-label="Sélectionner"
                  />
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/participant/${p.id}`}
                    className="flex items-center gap-3 hover:underline"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-xs font-semibold text-white">
                      {initials(p.nom, p.prenom)}
                    </span>
                    <span className="font-medium">
                      {p.prenom} {p.nom}
                      {p.agape && (
                        <span className="ml-2 rounded-full bg-gold/15 px-1.5 py-0.5 text-[10px] font-medium text-gold-foreground ring-1 ring-inset ring-gold/30">
                          Agapé
                        </span>
                      )}
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {p.ville}
                  <span className="block text-xs">{p.quartier}</span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {p.telephone}
                </TableCell>
                <TableCell>
                  <StatusBadge status={p.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(p.created_at)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <ContactButtons
                      id={p.id}
                      prenom={p.prenom}
                      telephone={p.telephone}
                      whatsapp={p.whatsapp}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Cartes (mobile) */}
      <div className="space-y-3 md:hidden">
        {rows.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-border p-4 data-[sel=true]:border-primary/50"
            data-sel={selected.has(p.id)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selected.has(p.id)}
                  onCheckedChange={() => toggle(p.id)}
                  aria-label="Sélectionner"
                />
                <Link
                  href={`/admin/participant/${p.id}`}
                  className="flex items-center gap-3"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-xs font-semibold text-white">
                    {initials(p.nom, p.prenom)}
                  </span>
                  <span>
                    <span className="block font-medium">
                      {p.prenom} {p.nom}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {p.ville} · {p.quartier}
                    </span>
                  </span>
                </Link>
              </div>
              <StatusBadge status={p.status} />
            </div>
            <div className="mt-3">
              <ContactButtons
                id={p.id}
                prenom={p.prenom}
                telephone={p.telephone}
                whatsapp={p.whatsapp}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
