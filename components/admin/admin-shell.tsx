"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  LogOut,
  Menu,
  X,
  ExternalLink,
  QrCode,
  Users2,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/admin/actions";
import { PROGRAM_NAME } from "@/lib/constants";

const NAV = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/admin/nouveaux", label: "Nouveaux inscrits", icon: UserPlus },
  { href: "/admin/participants", label: "Tous les participants", icon: Users },
  { href: "/admin/presence", label: "Présence (jour J)", icon: CheckSquare },
  { href: "/admin/partager", label: "Partager (QR code)", icon: QrCode },
  {
    href: "/admin/admins",
    label: "Administrateurs",
    icon: Users2,
    superOnly: true,
  },
];

function NavLinks({
  onNavigate,
  role,
}: {
  onNavigate?: () => void;
  role: string;
}) {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {NAV.filter((item) => !item.superOnly || role === "super_admin").map(
        ({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4.5 w-4.5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({
  children,
  adminEmail,
  role,
}: {
  children: React.ReactNode;
  adminEmail: string;
  role: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-2 py-1">
        <BrandMark className="h-9 w-9" />
        <div className="leading-tight">
          <p className="font-display text-sm font-semibold">{PROGRAM_NAME}</p>
          <p className="text-xs text-muted-foreground">Administration</p>
        </div>
      </div>

      <div className="mt-6 min-h-0 flex-1 overflow-y-auto">
        <NavLinks role={role} onNavigate={() => setMobileOpen(false)} />
      </div>

      <div className="mt-3 shrink-0 space-y-2 border-t border-border pt-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-3 text-xs text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="h-3.5 w-3.5" /> Voir le site public
        </Link>
        <div className="rounded-lg bg-muted/60 p-2.5">
          <p className="truncate text-xs font-medium">{adminEmail}</p>
          <p className="text-[10px] text-muted-foreground">Connecté</p>
        </div>
        <form action={logoutAction}>
          <Button
            variant="outline"
            type="submit"
            className="w-full justify-center gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" /> Se déconnecter
          </Button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-card p-4 lg:block">
        {Sidebar}
      </aside>

      {/* Topbar mobile */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/80 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <BrandMark className="h-8 w-8" />
          <span className="font-display text-sm font-semibold">{PROGRAM_NAME}</span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Drawer mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-card p-4 shadow-xl">
            <div className="mb-2 flex shrink-0 justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col">{Sidebar}</div>
          </div>
        </div>
      )}

      {/* Contenu */}
      <div className="lg:pl-64">
        <div className="hidden items-center justify-end gap-2 px-6 pt-4 lg:flex">
          <ThemeToggle />
        </div>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
