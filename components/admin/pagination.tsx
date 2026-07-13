import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface Props {
  page: number;
  pageSize: number;
  total: number;
  /** searchParams courants (hors "page") pour construire les liens. */
  baseParams: Record<string, string | undefined>;
}

export function Pagination({ page, pageSize, total, baseParams }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const buildHref = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(baseParams)) {
      if (v) sp.set(k, v);
    }
    sp.set("page", String(p));
    return `?${sp.toString()}`;
  };

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        {from}–{to} sur {total.toLocaleString("fr-FR")}
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={buildHref(page - 1)}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <ChevronLeft className="h-4 w-4" /> Précédent
          </Link>
        ) : (
          <span
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "pointer-events-none opacity-50"
            )}
          >
            <ChevronLeft className="h-4 w-4" /> Précédent
          </span>
        )}
        <span className="text-sm font-medium tabular-nums">
          Page {page} / {totalPages}
        </span>
        {page < totalPages ? (
          <Link
            href={buildHref(page + 1)}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Suivant <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "pointer-events-none opacity-50"
            )}
          >
            Suivant <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </div>
  );
}
