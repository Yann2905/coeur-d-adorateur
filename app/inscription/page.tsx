import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/brand";
import { Card, CardContent } from "@/components/ui/card";
import { RegistrationForm } from "./registration-form";
import { PROGRAM_NAME, PROGRAM_DATE_LABEL } from "@/lib/constants";

export const metadata = {
  title: "Inscription",
  description: `Inscris-toi pour participer au programme d'adoration du ${PROGRAM_DATE_LABEL}.`,
};

export default function InscriptionPage() {
  return (
    <main className="min-h-screen bg-muted/30">
      {/* Bandeau */}
      <div className="relative overflow-hidden bg-brand-gradient">
        <div className="absolute inset-0 starfield opacity-60" />
        <div className="container relative z-10 py-10 text-center text-white">
          <Link
            href="/"
            className="absolute left-0 top-0 inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Accueil
          </Link>
          <BrandMark className="mx-auto h-12 w-12" />
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            {PROGRAM_NAME}
          </h1>
          <p className="mx-auto mt-2 max-w-md text-white/85">
            Inscris-toi pour participer au programme d'adoration du{" "}
            <strong className="font-semibold">{PROGRAM_DATE_LABEL}</strong>.
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="container relative -mt-6 pb-20">
        <Card className="mx-auto max-w-2xl shadow-lg">
          <CardContent className="p-6 sm:p-9">
            <RegistrationForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
