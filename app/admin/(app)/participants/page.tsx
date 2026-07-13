import Link from "next/link";
import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { ContactButtons } from "@/components/admin/contact-buttons";
import { ParticipantsFilters } from "@/components/admin/participants-filters";
import { ExportButton } from "@/components/admin/export-button";
import { Pagination } from "@/components/admin/pagination";
import { getParticipants, getVilles } from "@/lib/data";
import { formatDate, initials } from "@/lib/utils";

export const metadata = { title: "Tous les participants" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function ParticipantsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = parseInt(sp.page ?? "1", 10) || 1;

  const [{ rows, total, pageSize }, villes] = await Promise.all([
    getParticipants({
      search: sp.search,
      ville: sp.ville,
      status: sp.status,
      agape: sp.agape,
      page,
    }),
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
        <ExportButton />
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
              {/* Vue tableau (desktop) */}
              <div className="hidden rounded-xl border border-border md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Participant</TableHead>
                      <TableHead>Ville / Quartier</TableHead>
                      <TableHead>Contacts</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Inscription</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <Link
                            href={`/admin/participant/${p.id}`}
                            className="flex items-center gap-3 hover:underline"
                          >
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-xs font-semibold text-white">
                              {initials(p.nom, p.prenom)}
                            </span>
                            <span className="font-medium">
                              {p.prenom} {p.nom}
                              {p.agape && (
                                <span className="ml-2 rounded-full bg-gold/15 px-1.5 py-0.5 text-[10px] font-medium text-gold-foreground ring-1 ring-inset ring-gold/30">
                                  Agapé
                                </span>
                              )}
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {p.ville}
                          <span className="block text-xs">{p.quartier}</span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {p.telephone}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={p.status} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(p.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end">
                            <ContactButtons
                              id={p.id}
                              prenom={p.prenom}
                              telephone={p.telephone}
                              whatsapp={p.whatsapp}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Vue cartes (mobile) */}
              <div className="space-y-3 md:hidden">
                {rows.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-border p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/admin/participant/${p.id}`}
                        className="flex items-center gap-3"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-xs font-semibold text-white">
                          {initials(p.nom, p.prenom)}
                        </span>
                        <span>
                          <span className="block font-medium">
                            {p.prenom} {p.nom}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {p.ville} · {p.quartier}
                          </span>
                        </span>
                      </Link>
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="mt-3">
                      <ContactButtons
                        id={p.id}
                        prenom={p.prenom}
                        telephone={p.telephone}
                        whatsapp={p.whatsapp}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                page={page}
                pageSize={pageSize}
                total={total}
                baseParams={{
                  search: sp.search,
                  ville: sp.ville,
                  status: sp.status,
                  agape: sp.agape,
                }}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
