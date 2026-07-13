import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { BrandMark } from "@/components/brand";
import { ChangePasswordForm } from "./change-password-form";
import { PROGRAM_NAME } from "@/lib/constants";

export const metadata = { title: "Changer le mot de passe" };
export const dynamic = "force-dynamic";

export default async function ChangePasswordPage() {
  const auth = await getAdmin();
  if (!auth) redirect("/admin/login");

  // Si le changement n'est pas requis, on renvoie vers le tableau de bord.
  const forced = auth.admin.must_change_password;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-gradient px-6 py-16">
      <div className="absolute inset-0 starfield opacity-60" />
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center text-white">
          <BrandMark className="h-12 w-12" />
          <h1 className="mt-3 font-display text-2xl font-bold">{PROGRAM_NAME}</h1>
          <p className="text-sm text-white/80">
            {forced
              ? "Première connexion : choisis ton mot de passe"
              : "Modifier mon mot de passe"}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8">
          <ChangePasswordForm forced={forced} email={auth.admin.email} />
        </div>
      </div>
    </main>
  );
}
