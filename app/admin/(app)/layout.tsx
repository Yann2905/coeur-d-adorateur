import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { admin } = await requireAdmin();

  // Première connexion : changement de mot de passe obligatoire.
  if (admin.must_change_password) {
    redirect("/admin/change-password");
  }
  return (
    <AdminShell adminEmail={admin.email} role={admin.role}>
      {children}
    </AdminShell>
  );
}
