"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Search,
  Check,
  X,
  Loader2,
  UserCheck,
  Utensils,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { cn, initials } from "@/lib/utils";
import { swalToast, swalError } from "@/lib/swal";
import { updateStatusAction } from "@/app/admin/actions";
import type { PresenceRow } from "@/lib/data";
import type { Status } from "@/lib/constants";

export function PresenceBoard({ rows }: { rows: PresenceRow[] }) {
  const [items, setItems] = useState<PresenceRow[]>(rows);
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const presents = items.filter((r) => r.status === "present").length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((r) =>
      `${r.prenom} ${r.nom} ${r.ville} ${r.quartier} ${r.telephone} ${r.whatsapp}`
        .toLowerCase()
        .includes(q)
    );
  }, [items, query]);

  const setStatus = (row: PresenceRow, status: Status) => {
    setPendingId(row.id);
    startTransition(async () => {
      const res = await updateStatusAction(row.id, status);
      if (res.ok) {
        setItems((prev) =>
          prev.map((r) => (r.id === row.id ? { ...r, status } : r))
        );
        swalToast(
          "success",
          `${row.prenom} — ${status === "present" ? "présent" : status === "absent" ? "absent" : "confirmé"}`
        );
      } else {
        swalError("Erreur", res.error);
      }
      setPendingId(null);
    });
  };

  return (
    <div className="space-y-4">
      {/* Barre de recherche + compteur (collante) */}
      <div className="sticky top-16 z-20 -mx-1 rounded-2xl border border-border bg-card/95 p-3 shadow-sm backdrop-blur lg:top-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un participant (nom, téléphone, ville…)"
              className="h-12 pl-9 text-base"
            />
          </div>
          <div className="flex items-center justify-center gap-2 rounded-xl bg-violet-500/10 px-4 py-2 text-violet-600 dark:text-violet-400">
            <UserCheck className="h-5 w-5" />
            <span className="font-semibold tabular-nums">
              {presents} / {items.length}
            </span>
            <span className="text-sm">présents</span>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Aucun participant trouvé.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((row) => {
            const isPending = pendingId === row.id;
            const isPresent = row.status === "present";
            const isAbsent = row.status === "absent";
            return (
              <div
                key={row.id}
                className={cn(
                  "flex flex-col gap-3 rounded-2xl border p-4 transition-colors sm:flex-row sm:items-center sm:justify-between",
                  isPresent
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-border bg-card"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-sm font-semibold text-white">
                    {initials(row.nom, row.prenom)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">
                        {row.prenom} {row.nom}
                      </p>
                      <StatusBadge status={row.status as Status} />
                      {row.agape && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-medium text-gold-foreground ring-1 ring-inset ring-gold/30">
                          <Utensils className="h-3 w-3" /> Agapé
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {row.ville} · {row.quartier}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button
                    variant={isPresent ? "success" : "outline"}
                    className="flex-1 sm:flex-none"
                    disabled={isPending}
                    onClick={() => setStatus(row, "present")}
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Présent
                  </Button>
                  <Button
                    variant={isAbsent ? "destructive" : "outline"}
                    className="flex-1 sm:flex-none"
                    disabled={isPending}
                    onClick={() => setStatus(row, "absent")}
                  >
                    <X className="h-4 w-4" />
                    Absent
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
