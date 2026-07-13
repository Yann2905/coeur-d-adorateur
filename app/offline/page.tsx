import { BrandMark } from "@/components/brand";

export const metadata = { title: "Hors-ligne" };

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <BrandMark className="h-14 w-14" />
      <h1 className="font-display text-2xl font-semibold">Tu es hors-ligne</h1>
      <p className="max-w-sm text-muted-foreground">
        La connexion internet semble indisponible. Reconnecte-toi pour continuer
        à préparer le programme du 31 Octobre 2026.
      </p>
    </main>
  );
}
