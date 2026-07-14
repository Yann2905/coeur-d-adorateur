import Link from "next/link";
import { Users, Printer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ParticipantsFilters } from "@/components/admin/participants-filters";
import { ParticipantsTable } from "@/components/admin/participants-table";
import { ExportButton } from "@/components/admin/export-button";
import { Pagination } from "@/components/admin/pagination";
import { getParticipants, getVilles } from "@/lib/data";

export const metadata = { title: "Tous les participants" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function ParticipantsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = parseInt(sp.page ?? "1", 10) || 1;

  const filters = {
    search: sp.search,
    ville: sp.ville,
    status: sp.status,
    agape: sp.agape,
    sexe: sp.sexe,
    age: sp.age,
    source: sp.source,
    from: sp.from,
    to: sp.to,
    sort: sp.sort,
  };

  const [{ rows, total, pageSize }, villes] = await Promise.all([
    getParticipants({ ...filters, page }),
    getVilles(),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">
              Tous les participants
            </h1>
            <p className="text-muted-foreground">
              {total.toLocaleString("fr-FR")} inscrit(s) au total.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/impression" target="_blank">
              <Printer className="h-4 w-4" /> Imprimer
            </Link>
          </Button>
          <ExportButton />
        </div>
      </div>

      <Card>
        <CardContent className="space-y-5 p-5">
          <ParticipantsFilters villes={villes} />

          {rows.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Aucun participant ne correspond à ces critères.
            </p>
          ) : (
            <>
              <ParticipantsTable rows={rows} />
              <Pagination
                page={page}
                pageSize={pageSize}
                total={total}
                baseParams={filters}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
