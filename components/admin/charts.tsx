import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChartDatum } from "@/lib/data";

/* ─── Jauge d'objectif (X / objectif) ─── */
export function GoalGauge({ value, goal }: { value: number; goal: number }) {
  const pct = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0;
  const remaining = Math.max(0, goal - value);
  return (
    <div>
      <div className="flex items-end justify-between">
        <p>
          <span className="text-4xl font-bold tabular-nums">
            {value.toLocaleString("fr-FR")}
          </span>
          <span className="text-lg text-muted-foreground">
            {" "}
            / {goal.toLocaleString("fr-FR")}
          </span>
        </p>
        <span className="text-2xl font-bold tabular-nums text-primary">
          {pct}%
        </span>
      </div>
      <div className="mt-3 h-3.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-fuchsia-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {remaining > 0
          ? `Encore ${remaining.toLocaleString("fr-FR")} inscription(s) pour atteindre l'objectif.`
          : "Objectif atteint, bravo !"}
      </p>
    </div>
  );
}

/* ─── Indicateur de tendance (7 jours vs 7 précédents) ─── */
export function TrendBadge({ last7, prev7 }: { last7: number; prev7: number }) {
  let pct = 0;
  if (prev7 === 0) pct = last7 > 0 ? 100 : 0;
  else pct = Math.round(((last7 - prev7) / prev7) * 100);
  const up = pct > 0;
  const flat = pct === 0;
  const Icon = flat ? Minus : up ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
        flat
          ? "bg-muted text-muted-foreground"
          : up
            ? "bg-emerald-500/10 text-emerald-600"
            : "bg-rose-500/10 text-rose-600"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {up ? "+" : ""}
      {pct}%
    </span>
  );
}

/* ─── Liste de barres horizontales (villes, âge, source…) ─── */
export function BarList({
  items,
  accent = "primary",
  emptyLabel = "Aucune donnée",
}: {
  items: ChartDatum[];
  accent?: "primary" | "gold";
  emptyLabel?: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  const total = items.reduce((s, i) => s + i.value, 0);

  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const pct = total ? Math.round((item.value / total) * 100) : 0;
        return (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="truncate pr-2 font-medium">{item.label}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {item.value}
                <span className="ml-1 text-xs">({pct}%)</span>
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full",
                  accent === "gold"
                    ? "bg-gradient-to-r from-amber-400 to-gold"
                    : "bg-gradient-to-r from-primary to-fuchsia-500"
                )}
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Répartition en 2 (ou 3) segments : Sexe, Agapé ─── */
export function SplitBar({
  segments,
}: {
  segments: { label: string; value: number; className: string }[];
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  return (
    <div>
      <div className="flex h-4 w-full overflow-hidden rounded-full bg-muted">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={cn("h-full", seg.className)}
            style={{ width: `${(seg.value / total) * 100}%` }}
            title={`${seg.label} : ${seg.value}`}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
        {segments.map((seg) => {
          const pct = Math.round((seg.value / total) * 100);
          return (
            <div key={seg.label} className="flex items-center gap-2 text-sm">
              <span
                className={cn("h-3 w-3 shrink-0 rounded-full", seg.className)}
              />
              <span className="font-medium">{seg.label}</span>
              <span className="tabular-nums text-muted-foreground">
                {seg.value} ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Tendance : barres verticales (inscriptions par jour) ─── */
export function TrendBars({ data }: { data: ChartDatum[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    // overflow-x-auto : si trop de jours pour l'écran, on défile DANS la carte
    // (jamais de débordement horizontal de la page).
    <div className="-mx-1 overflow-x-auto px-1 pb-1">
      <div
        className="flex min-w-[420px] items-end gap-1.5"
        style={{ height: 160 }}
      >
        {data.map((d, i) => (
          <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            {/* Valeur au-dessus de la barre (visible seulement si > 0) */}
            <span
              className={cn(
                "text-[10px] font-bold tabular-nums",
                d.value > 0 ? "text-primary" : "text-transparent"
              )}
            >
              {d.value}
            </span>
            <div className="flex w-full flex-1 items-end">
              <div
                className={cn(
                  "w-full rounded-t-md transition-all",
                  d.value > 0
                    ? "bg-gradient-to-t from-primary/70 to-fuchsia-500"
                    : "bg-muted"
                )}
                style={{
                  height: d.value > 0 ? `${Math.max(6, (d.value / max) * 100)}%` : "4px",
                }}
              />
            </div>
            <span className="whitespace-nowrap text-[9px] tabular-nums text-muted-foreground">
              {d.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
