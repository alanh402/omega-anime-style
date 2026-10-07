"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ExternalLink, LayoutGrid, LogOut, MessageSquareText, Package, Settings, Tags } from "lucide-react";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/categorias", label: "Categorias", icon: LayoutGrid },
  { href: "/admin/marcas", label: "Marcas", icon: Tags },
  { href: "/admin/pedidos", label: "Pedidos / Leads", icon: MessageSquareText },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export function AdminShell({ email, children, signOut }: { email?: string; children: React.ReactNode; signOut?: () => Promise<void> }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur lg:h-dvh lg:border-b-0 lg:border-r">
        <div className="flex h-14 items-center justify-between px-4 lg:h-16">
          <Link href="/admin" className="flex items-center gap-2">
            <Image src="/brand/logo-mark-sm.webp" alt="Omega Anime Style" width={480} height={207} className="h-7 w-auto" />
            <span className="text-xs font-semibold uppercase tracking-widest text-subtle">Admin</span>
          </Link>
          <div className="flex items-center gap-1 lg:hidden">
            <Link href="/" target="_blank" className="flex h-9 items-center gap-1 px-2 text-xs text-muted hover:text-text">
              Ver loja <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            {signOut && (
              <form action={signOut}>
                <button className="grid h-9 w-9 place-items-center text-muted hover:text-danger" aria-label="Sair">
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>
        <nav className="scrollbar-none flex gap-1 overflow-x-auto px-2 pb-2 lg:flex-col lg:px-3 lg:pb-0" aria-label="Menu do painel">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex h-10 shrink-0 items-center gap-2.5 rounded-xl px-3 text-sm font-semibold transition",
                isActive(href) ? "bg-gold/12 text-gold-bright" : "text-muted hover:bg-surface-2 hover:text-text",
              )}
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>
        <div className="absolute inset-x-3 bottom-4 hidden space-y-2 lg:block">
          <Link href="/" target="_blank" className="flex h-10 items-center gap-2 rounded-xl px-3 text-sm text-muted hover:bg-surface-2 hover:text-text">
            <ExternalLink className="h-4 w-4" /> Ver loja
          </Link>
          {email && <p className="truncate px-3 text-xs text-subtle">{email}</p>}
          {signOut && (
            <form action={signOut}>
              <button className="flex h-10 w-full items-center gap-2 rounded-xl px-3 text-sm text-muted hover:bg-surface-2 hover:text-danger">
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </form>
          )}
        </div>
      </aside>
      <main className="min-w-0 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}

export function AdminTitle({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-xl font-bold sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
