import Link from "next/link";
import { Heart, Check, Home, CalendarHeart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand";
import { EventDetails } from "@/components/event-details";
import { getAppBaseUrl } from "@/lib/app-url";
import {
  PROGRAM_NAME,
  PROGRAM_DATE_LABEL,
  PROGRAM_TIME_LABEL,
  PROGRAM_VENUE_SHORT,
} from "@/lib/constants";

export const metadata = {
  title: "Merci pour ton inscription",
};

export default function ConfirmationPage() {
  const inscriptionUrl = `${getAppBaseUrl()}/inscription`;
  const inviteText = `Je viens de m'inscrire à ${PROGRAM_NAME} — programme d'adoration le ${PROGRAM_DATE_LABEL} à ${PROGRAM_TIME_LABEL}, ${PROGRAM_VENUE_SHORT}. Inscris-toi aussi : ${inscriptionUrl}`;
  const inviteUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    inviteText
  )}`;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-brand-gradient px-6 py-16 text-center">
      <div className="absolute inset-0 starfield opacity-70" />

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center">
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/15 backdrop-blur">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold text-gold-foreground shadow-lg">
              <Check className="h-9 w-9" strokeWidth={3} />
            </div>
          </div>
        </div>

        <h1 className="mt-8 font-display text-3xl font-bold text-white sm:text-4xl">
          Merci pour ton inscription à<br />
          <span className="text-gold">{PROGRAM_NAME}</span>
        </h1>

        <p className="mt-4 max-w-md text-lg text-white/90">
          Nous avons hâte de t'accueillir le{" "}
          <strong className="font-semibold text-white">
            {PROGRAM_DATE_LABEL}
          </strong>{" "}
          à{" "}
          <strong className="font-semibold text-white">
            {PROGRAM_TIME_LABEL}
          </strong>
          .
        </p>

        {/* Où & quand */}
        <EventDetails variant="glass" className="mt-6 w-full text-left" />

        {/* Message spirituel */}
        <div className="mt-6 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur">
          <CalendarHeart className="mx-auto mb-3 h-6 w-6 text-gold" />
          <p className="font-display text-lg italic leading-relaxed text-white">
            « Que tout ce qui respire loue l'Éternel ! »
          </p>
          <p className="mt-2 text-sm text-white/70">Psaume 150.6</p>
          <p className="mt-4 text-sm text-white/85">
            Prépare ton cœur dès aujourd'hui. Que ce temps d'adoration soit une
            rencontre profonde avec la présence de Dieu. Nous prions pour toi et
            t'attendons avec joie.
          </p>
        </div>

        {/* Inviter un ami */}
        <a
          href={inviteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white shadow-md transition-colors hover:bg-emerald-600"
        >
          <Share2 className="h-5 w-5" />
          Inviter un ami sur WhatsApp
        </a>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="gold" size="lg" className="h-12">
            <Link href="/">
              <Home className="h-5 w-5" />
              Retour à l'accueil
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
          >
            <Link href="/inscription">
              <Heart className="h-5 w-5" />
              Inscrire quelqu'un d'autre
            </Link>
          </Button>
        </div>

        <div className="mt-10 flex items-center gap-2 text-white/70">
          <BrandMark className="h-6 w-6" />
          <span className="text-sm">{PROGRAM_NAME}</span>
        </div>
      </div>
    </main>
  );
}
