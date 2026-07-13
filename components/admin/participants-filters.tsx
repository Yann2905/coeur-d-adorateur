"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { STATUSES, STATUS_LABELS } from "@/lib/constants";

const ALL = "__all__";

export function ParticipantsFilters({ villes }: { villes: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(params.get("search") ?? "");

  const pushParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === "" || v === ALL) next.delete(k);
        else next.set(k, v);
      }
      next.delete("page"); // retour à la page 1 à chaque changement de filtre
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

  const hasFilters =
    params.get("search") ||
    params.get("ville") ||
    params.get("status") ||
    params.get("agape");

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
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
        value={params.get("status") ?? ALL}
        onValueChange={(v) => pushParams({ status: v })}
      >
        <SelectTrigger className="w-full sm:w-[160px]">
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
        <SelectTrigger className="w-full sm:w-[160px]">
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

      <Select
        value={params.get("agape") ?? ALL}
        onValueChange={(v) => pushParams({ agape: v })}
      >
        <SelectTrigger className="w-full sm:w-[150px]">
          <SelectValue placeholder="Agapé" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Agapé (tous)</SelectItem>
          <SelectItem value="oui">Agapé : Oui</SelectItem>
          <SelectItem value="non">Agapé : Non</SelectItem>
        </SelectContent>
      </Select>

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
  );
}
