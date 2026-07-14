import { cn } from "@/lib/utils";
import type { ChartDatum } from "@/lib/data";

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
