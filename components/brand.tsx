import { cn } from "@/lib/utils";
import { PROGRAM_NAME } from "@/lib/constants";

/** Logo cœur stylisé de "Cœur d'Adorateur". */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={cn("h-10 w-10", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="brandHeart" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(265 68% 52%)" />
          <stop offset="100%" stopColor="hsl(300 60% 48%)" />
        </linearGradient>
      </defs>
      <path
        d="M24 41c-1 0-2-.4-2.8-1.1C14.5 33.9 8 28.3 8 20.5 8 15 12.2 11 17.3 11c3 0 5.6 1.4 6.7 3.6C25.1 12.4 27.7 11 30.7 11 35.8 11 40 15 40 20.5c0 7.8-6.5 13.4-13.2 19.4-.8.7-1.8 1.1-2.8 1.1Z"
        fill="url(#brandHeart)"
      />
      {/* Flamme d'adoration */}
      <path
        d="M24 18c1.6 1.4 2.6 3 2.6 4.7 0 1.7-1.2 3.1-2.6 3.1s-2.6-1.4-2.6-3.1c0-1.7 1-3.3 2.6-4.7Z"
        fill="hsl(42 90% 70%)"
      />
    </svg>
  );
}

export function BrandLockup({
  className,
  subtitle,
}: {
  className?: string;
  subtitle?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <BrandMark />
      <div className="leading-tight">
        <p className="font-display text-lg font-semibold tracking-tight">
          {PROGRAM_NAME}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
