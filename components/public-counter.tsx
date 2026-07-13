"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";

/** Compteur public animé du nombre d'inscrits. */
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

  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur">
      <Users className="h-4 w-4 text-gold" />
      <span className="tabular-nums">
        {count === null ? "—" : count.toLocaleString("fr-FR")}
      </span>
      <span className="text-white/80">
        {count === 1 ? "personne inscrite" : "personnes inscrites"}
      </span>
    </div>
  );
}
