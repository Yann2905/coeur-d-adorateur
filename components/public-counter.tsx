"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { PROGRAM_GOAL } from "@/lib/constants";

/** Compteur public d'inscrits avec objectif (300). */
export function PublicCounter({ initial }: { initial: number | null }) {
  const [count, setCount] = useState<number | null>(initial);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/count", { cache: "no-store" });
        const json = await res.json();
        if (active && typeof json.count === "number") setCount(json.count);
      } catch {
        /* ignore */
      }
    };
    if (initial === null) load();
    const id = setInterval(load, 60_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [initial]);

  const value = count ?? 0;
  const pct = Math.min(100, Math.round((value / PROGRAM_GOAL) * 100));

  return (
    <div className="w-full max-w-xs rounded-2xl border border-white/20 bg-white/10 p-4 text-white backdrop-blur">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-sm text-white/85">
          <Users className="h-4 w-4 text-gold" /> Déjà inscrits
        </span>
        <span className="text-sm font-semibold tabular-nums">
          {count === null ? "—" : value.toLocaleString("fr-FR")} / {PROGRAM_GOAL}
        </span>
      </div>
      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-white/20">
        <div
          className="h-full rounded-full bg-gold transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-white/70">
        Objectif : {PROGRAM_GOAL} adorateurs
      </p>
    </div>
  );
}
