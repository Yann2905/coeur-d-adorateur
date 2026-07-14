import { Calendar, Clock, MapPin, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PROGRAM_DATE_LABEL,
  PROGRAM_TIME_LABEL,
  PROGRAM_VENUE,
  PROGRAM_DIRECTIONS_URL,
} from "@/lib/constants";

/**
 * Bloc "Où & quand" : date, heure, lieu + bouton itinéraire.
 * `variant="glass"` pour l'afficher sur un fond en dégradé (texte clair).
 */
export function EventDetails({
  variant = "card",
  className,
}: {
  variant?: "card" | "glass";
  className?: string;
}) {
  const glass = variant === "glass";

  const Item = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: React.ElementType;
    label: string;
    value: string;
  }) => (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          glass ? "bg-white/15 text-gold" : "bg-primary/10 text-primary"
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            "text-xs uppercase tracking-wide",
            glass ? "text-white/60" : "text-muted-foreground"
          )}
        >
          {label}
        </p>
        <p className={cn("font-semibold", glass && "text-white")}>{value}</p>
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        "rounded-2xl border p-5",
        glass
          ? "border-white/20 bg-white/10 backdrop-blur"
          : "border-border bg-card shadow-sm",
        className
      )}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Item icon={Calendar} label="Date" value={PROGRAM_DATE_LABEL} />
        <Item icon={Clock} label="Heure" value={PROGRAM_TIME_LABEL} />
        <Item icon={MapPin} label="Lieu" value={PROGRAM_VENUE} />
      </div>
      <a
        href={PROGRAM_DIRECTIONS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors sm:w-auto",
          glass
            ? "bg-gold text-gold-foreground hover:bg-gold/90"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        <Navigation className="h-4 w-4" />
        Voir l'itinéraire sur Google Maps
      </a>
    </div>
  );
}
