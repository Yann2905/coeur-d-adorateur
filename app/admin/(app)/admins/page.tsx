import { Users2 } from "lucide-react";
import { requireSuperAdmin } from "@/lib/auth";
import { getAdmins } from "@/lib/data";
import { AdminsManager } from "@/components/admin/admins-manager";
import { TestEmailButton } from "@/components/admin/test-email-button";

export const metadata = { title: "Administrateurs" };
export const dynamic = "force-dynamic";

export default async function AdminsPage() {
  const { admin } = await requireSuperAdmin();
  const admins = await getAdmins();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">
              Administrateurs
            </h1>
            <p className="text-muted-foreground">
              Ajoute des membres à l'équipe — ils reçoivent leurs accès par email.
            </p>
          </div>
        </div>
        <TestEmailButton />
      </div>

      <AdminsManager admins={admins} currentEmail={admin.email} />
    </div>
  );
}
