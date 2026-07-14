import Link from "next/link";
import {
  Users,
  UserPlus,
  CheckCircle2,
  Utensils,
  PhoneCall,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { BarList, SplitBar, TrendBars } from "@/components/admin/charts";
import {
  getDashboardStats,
  getRecentParticipants,
  getDashboardCharts,
} from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { PROGRAM_DATE_LABEL } from "@/lib/constants";

export const metadata = { title: "Tableau de bord" };

const STAT_CARDS = [
  {
    key: "total",
    label: "Total inscrits",
    icon: Users,
    accent: "from-violet-500 to-purple-600",
    hint: "Participants attendus",
  },
  {
    key: "nouveaux",
    label: "Nouveaux",
    icon: UserPlus,
    accent: "from-blue-500 to-indigo-600",
    hint: "Pas encore contactés",
  },
  {
    key: "confirmes",
    label: "Confirmés",
    icon: CheckCircle2,
    accent: "from-emerald-500 to-green-600",
    hint: "Présence confirmée",
  },
  {
    key: "agape",
    label: "Agapé",
    icon: Utensils,
    accent: "from-amber-500 to-orange-600",
    hint: "Intéressés par le repas",
  },
] as const;

export default async function DashboardPage() {
  const [stats, recent, charts] = await Promise.all([
    getDashboardStats(),
    getRecentParticipants(6),
    getDashboardCharts(),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">
          Tableau de bord
        </h1>
        <p className="mt-1 text-muted-foreground">
          Vue d'ensemble des inscriptions au programme du {PROGRAM_DATE_LABEL}.
        </p>
      </div>

      {/* Cartes statistiques */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, accent, hint }) => (
          <Card key={key} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-sm`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-3xl font-bold tabular-nums">
                  {stats[key].toLocaleString("fr-FR")}
                </span>
              </div>
              <p className="mt-3 font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ligne secondaire */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <PhoneCall className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">
                {stats.contactes.toLocaleString("fr-FR")}
              </p>
              <p className="text-sm text-muted-foreground">
                Personnes contactées
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">
                {stats.presents.toLocaleString("fr-FR")}
              </p>
              <p className="text-sm text-muted-foreground">
                Marqués présents
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tendance des inscriptions */}
      <Card>
        <CardContent className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-semibold">
              Inscriptions (14 derniers jours)
            </h2>
            <span className="text-sm text-muted-foreground">
              {charts.total.toLocaleString("fr-FR")} au total
            </span>
          </div>
          <TrendBars data={charts.perDay} />
        </CardContent>
      </Card>

      {/* Répartitions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5 sm:p-6">
            <h2 className="mb-4 font-display text-lg font-semibold">
              Agapé — préparation du repas
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              <span className="text-2xl font-bold text-gold-foreground">
                {charts.agape.oui.toLocaleString("fr-FR")}
              </span>{" "}
              personne(s) attendue(s) pour l'agapé.
            </p>
            <SplitBar
              segments={[
                {
                  label: "Oui, présent",
                  value: charts.agape.oui,
                  className: "bg-gold",
                },
                {
                  label: "Non / pas sûr",
                  value: charts.agape.non,
                  className: "bg-muted-foreground/40",
                },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 sm:p-6">
            <h2 className="mb-4 font-display text-lg font-semibold">
              Répartition par sexe
            </h2>
            <SplitBar
              segments={[
                {
                  label: "Hommes",
                  value: charts.sexe.homme,
                  className: "bg-primary",
                },
                {
                  label: "Femmes",
                  value: charts.sexe.femme,
                  className: "bg-fuchsia-400",
                },
                ...(charts.sexe.autre
                  ? [
                      {
                        label: "Autre",
                        value: charts.sexe.autre,
                        className: "bg-muted-foreground/40",
                      },
                    ]
                  : []),
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 sm:p-6">
            <h2 className="mb-4 font-display text-lg font-semibold">
              Villes (top 8)
            </h2>
            <BarList items={charts.byVille} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 sm:p-6">
            <h2 className="mb-4 font-display text-lg font-semibold">
              Tranches d'âge
            </h2>
            <BarList items={charts.byAge} accent="gold" />
          </CardContent>
        </Card>

        {charts.bySource.length > 0 && (
          <Card className="lg:col-span-2">
            <CardContent className="p-5 sm:p-6">
              <h2 className="mb-4 font-display text-lg font-semibold">
                Comment ont-ils connu le programme ?
              </h2>
              <BarList items={charts.bySource} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dernières inscriptions */}
      <Card>
        <CardContent className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">
              Dernières inscriptions
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/nouveaux">
                Tout voir <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aucune inscription pour le moment.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {recent.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/participant/${p.id}`}
                  className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-muted/40 -mx-2 rounded-lg px-2"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {p.prenom} {p.nom}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.ville} · {p.quartier} · {formatDate(p.created_at)}
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
