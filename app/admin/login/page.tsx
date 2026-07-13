import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/brand";
import { LoginForm } from "./login-form";
import { PROGRAM_NAME } from "@/lib/constants";

export const metadata = { title: "Connexion administrateur" };

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-gradient px-6 py-16">
      <div className="absolute inset-0 starfield opacity-60" />

      <Link
        href="/"
        className="absolute left-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-sm text-white backdrop-blur transition-colors hover:bg-white/20"
      >
        <ArrowLeft className="h-4 w-4" /> Retour au site
      </Link>

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center text-white">
          <BrandMark className="h-12 w-12" />
          <h1 className="mt-3 font-display text-2xl font-bold">{PROGRAM_NAME}</h1>
          <p className="text-sm text-white/80">Espace administrateur</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
