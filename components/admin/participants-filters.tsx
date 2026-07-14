"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, Loader2, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  STATUSES,
  STATUS_LABELS,
  SEXE_OPTIONS,
  AGE_OPTIONS,
  SOURCE_OPTIONS,
} from "@/lib/constants";

const ALL = "__all__";

export function ParticipantsFilters({ villes }: { villes: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(params.get("search") ?? "");
  const [advanced, setAdvanced] = useState(
    !!(
      params.get("sexe") ||
      params.get("age") ||
      params.get("source") ||
      params.get("from") ||
      params.get("to")
    )
  );

  const pushParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === "" || v === ALL) next.delete(k);
        else next.set(k, v);
      }
      next.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${next.toString()}`);
      });
    },
    [params, pathname, router]
  );

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    pushParams({ search });
  };

  const hasFilters = [
    "search",
    "ville",
    "status",
    "agape",
    "sexe",
    "age",
    "source",
    "from",
    "to",
    "sort",
  ].some((k) => params.get(k));

  return (
    <div className="space-y-3">
      {/* Ligne principale */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <form onSubmit={onSearchSubmit} className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher (nom, prénom, téléphone…)"
            className="pl-9"
          />
          {pending && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </form>

        <Select
          value={params.get("sort") ?? "recent"}
          onValueChange={(v) => pushParams({ sort: v === "recent" ? null : v })}
        >
          <SelectTrigger className="w-full sm:w-[170px]">
            <ArrowUpDown className="mr-1 h-3.5 w-3.5 opacity-60" />
            <SelectValue placeholder="Trier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Plus récent</SelectItem>
            <SelectItem value="ancien">Plus ancien</SelectItem>
            <SelectItem value="nom">Nom (A → Z)</SelectItem>
            <SelectItem value="ville">Ville (A → Z)</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={params.get("status") ?? ALL}
          onValueChange={(v) => pushParams({ status: v })}
        >
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tous les statuts</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={params.get("ville") ?? ALL}
          onValueChange={(v) => pushParams({ ville: v })}
        >
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Ville" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Toutes les villes</SelectItem>
            {villes.map((v) => (
              <SelectItem key={v} value={v}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={advanced ? "secondary" : "outline"}
          size="default"
          onClick={() => setAdvanced((a) => !a)}
        >
          <SlidersHorizontal className="h-4 w-4" /> Filtres avancés
        </Button>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              startTransition(() => router.push(pathname));
            }}
          >
            <X className="h-4 w-4" /> Réinitialiser
          </Button>
        )}
      </div>

      {/* Filtres avancés */}
      {advanced && (
        <div className="grid gap-3 rounded-xl border border-border bg-muted/30 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label className="mb-1.5 block text-xs">Sexe</Label>
            <Select
              value={params.get("sexe") ?? ALL}
              onValueChange={(v) => pushParams({ sexe: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Tous</SelectItem>
                {SEXE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs">Tranche d'âge</Label>
            <Select
              value={params.get("age") ?? ALL}
              onValueChange={(v) => pushParams({ age: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Toutes</SelectItem>
                {AGE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs">Comment il a connu</Label>
            <Select
              value={params.get("source") ?? ALL}
              onValueChange={(v) => pushParams({ source: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Toutes</SelectItem>
                {SOURCE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="mb-1.5 block text-xs">Du</Label>
              <Input
                type="date"
                value={params.get("from") ?? ""}
                onChange={(e) => pushParams({ from: e.target.value || null })}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Au</Label>
              <Input
                type="date"
                value={params.get("to") ?? ""}
                onChange={(e) => pushParams({ to: e.target.value || null })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
