import Link from "next/link";
import { ArrowRight, Heart, Sparkles, Users, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand";
import { PublicCounter } from "@/components/public-counter";
import { Countdown } from "@/components/countdown";
import { ThemeToggle } from "@/components/theme-toggle";
import { createAdminClient } from "@/lib/supabase/admin";
import { PROGRAM_NAME, PROGRAM_DATE_LABEL } from "@/lib/constants";

export const revalidate = 30;

async function getCount(): Promise<number | null> {
  try {
    const supabase = createAdminClient();
    const { count } = await supabase
      .from("participants")
      .select("id", { count: "exact", head: true });
    return count ?? 0;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const count = await getCount();

  return (
    <main className="min-h-screen">
      {/* HERO */}
      <section className="relative overflow-hidden bg-brand-gradient">
        <div className="absolute inset-0 starfield opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

        <header className="relative z-10">
          <div className="container flex items-center justify-between py-5">
            <div className="flex items-center gap-2.5 text-white">
              <BrandMark className="h-9 w-9" />
              <span className="font-display text-lg font-semibold">
                {PROGRAM_NAME}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <Button
                asChild
                variant="ghost"
                className="text-white hover:bg-white/15 hover:text-white"
              >
                <Link href="/admin">Espace admin</Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="container relative z-10 flex flex-col items-center pb-28 pt-10 text-center sm:pt-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            Programme d'adoration · {PROGRAM_DATE_LABEL}
          </div>

          <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight text-white sm:text-6xl">
            Prépare ton cœur
            <br />
            <span className="text-gold">à l'adoration</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg text-white/85">
            Inscris-toi pour participer au grand programme d'adoration du{" "}
            <strong className="font-semibold text-white">
              {PROGRAM_DATE_LABEL}
            </strong>
            . Ensemble, préparons ce moment de louange — et l'agapé qui suivra.
          </p>

          <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              variant="gold"
              className="group h-14 px-8 text-base shadow-xl shadow-black/20"
            >
              <Link href="/inscription">
                <Heart className="h-5 w-5" />
                Je m'inscris maintenant
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <PublicCounter initial={count} />
          </div>

          <div className="mt-14 w-full max-w-md">
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-white/70">
              Le programme commence dans
            </p>
            <Countdown />
          </div>
        </div>
      </section>

      {/* POINTS CLÉS */}
      <section className="container -mt-16 relative z-10 grid gap-5 pb-20 sm:grid-cols-3">
        {[
          {
            icon: Calendar,
            title: "31 Octobre 2026",
            text: "Une journée entière dédiée à l'adoration et à la louange.",
          },
          {
            icon: Users,
            title: "Inscription anticipée",
            text: "Nous préparons l'accueil en connaissant le nombre de participants.",
          },
          {
            icon: Heart,
            title: "Agapé fraternelle",
            text: "Un repas de communion après le programme, préparé selon les présents.",
          },
        ].map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="animate-fade-up rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-semibold">{title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{text}</p>
          </div>
        ))}
      </section>

      {/* APPEL FINAL */}
      <section className="container pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-brand-gradient px-8 py-14 text-center">
          <div className="absolute inset-0 starfield opacity-60" />
          <div className="relative z-10">
            <MapPin className="mx-auto mb-4 h-8 w-8 text-gold" />
            <h2 className="font-display text-3xl font-bold text-white">
              Ta place t'attend
            </h2>
            <p className="mx-auto mt-3 max-w-md text-white/85">
              Quelques instants suffisent pour t'inscrire. Rejoins la famille des
              adorateurs.
            </p>
            <Button
              asChild
              size="lg"
              variant="gold"
              className="mt-8 h-14 px-8 font-semibold shadow-md"
            >
              <Link href="/inscription">
                S'inscrire au programme
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
          <BrandMark className="h-7 w-7" />
          <p>
            {PROGRAM_NAME} — Programme d'adoration du {PROGRAM_DATE_LABEL}
          </p>
        </div>
      </footer>
    </main>
  );
}
