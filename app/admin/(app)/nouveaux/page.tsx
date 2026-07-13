import { UserPlus, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { ContactButtons } from "@/components/admin/contact-buttons";
import { getRecentParticipants } from "@/lib/data";
import { formatDateTime, initials } from "@/lib/utils";

export const metadata = { title: "Nouveaux inscrits" };
export const dynamic = "force-dynamic";

export default async function NouveauxPage() {
  const rows = await getRecentParticipants(50);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <UserPlus className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">
            Nouveaux inscrits
          </h1>
          <p className="text-muted-foreground">
            Les dernières personnes inscrites — contacte-les directement.
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            Aucune inscription pour le moment.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {rows.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-gradient font-semibold text-white">
                    {initials(p.nom, p.prenom)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">
                        {p.prenom} {p.nom}
                      </p>
                      <StatusBadge status={p.status} />
                      {p.agape && (
                        <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs font-medium text-gold-foreground ring-1 ring-inset ring-gold/30">
                          Agapé
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {p.ville} · {p.quartier}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDateTime(p.created_at)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Tél. {p.telephone} · WhatsApp {p.whatsapp}
                    </p>
                  </div>
                </div>

                <ContactButtons
                  id={p.id}
                  prenom={p.prenom}
                  telephone={p.telephone}
                  whatsapp={p.whatsapp}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
