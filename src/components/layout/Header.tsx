"use client";

import Link from "next/link";
import { LayoutGrid, Search, ShoppingBag } from "lucide-react";
import { Logo } from "./Logo";
import { useUI } from "@/store/ui-store";
import { useOrder } from "@/store/order-store";
import { useStoreConfig } from "@/store/store-config";
import { whatsappLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/ui/icons";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

export function OrderCountBadge({ className }: { className?: string }) {
  const { count, bump, hydrated } = useOrder();
  if (!hydrated || count === 0) return null;
  return (
    <span
      key={bump}
      className={cn(
        "absolute -right-1 -top-1 grid h-5 min-w-5 animate-pop place-items-center rounded-full bg-gold-metal px-1 text-[11px] font-extrabold text-gold-ink tabular",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function Header() {
  const { openSearch, openCategories } = useUI();
  const { whatsappNumber, storeName } = useStoreConfig();

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-bg/85 backdrop-blur-xl supports-[backdrop-filter]:bg-bg/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-4 lg:px-6">
        <Logo priority />

        <button
          type="button"
          onClick={openCategories}
          className="hidden h-11 items-center gap-2 rounded-[var(--radius-control)] px-3 text-sm font-semibold text-muted transition hover:bg-surface-2 hover:text-text md:inline-flex"
        >
          <LayoutGrid className="h-4 w-4" /> Categorias
        </button>

        {/* Campo de busca: abre a busca instantânea */}
        <button
          type="button"
          onClick={openSearch}
          className="group flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-[var(--radius-control)] border border-line bg-surface px-3.5 text-left text-sm text-subtle transition hover:border-line-strong md:max-w-xl"
          aria-label="Pesquisar produtos"
        >
          <Search className="h-[18px] w-[18px] shrink-0 text-muted group-hover:text-gold-bright" />
          <span className="truncate">
            <span className="sm:hidden">Buscar produtos</span>
            <span className="hidden sm:inline">Buscar iPhone, PS5, fones, películas…</span>
          </span>
        </button>

        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Ações">
          <Link href="/catalogo" className="hidden h-11 items-center px-3 text-sm font-semibold text-muted hover:text-text lg:inline-flex">
            Catálogo
          </Link>
          <a
            href={whatsappLink(whatsappNumber, `Olá! Vim pelo catálogo da ${storeName}.`)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track({ type: "whatsapp_click", meta: { from: "header" } })}
            className="hidden h-11 items-center gap-2 rounded-[var(--radius-control)] px-3 text-sm font-semibold text-whatsapp transition hover:bg-whatsapp/10 md:inline-flex"
          >
            <WhatsAppIcon className="h-5 w-5" /> <span className="hidden lg:inline">WhatsApp</span>
          </a>
          <Link
            href="/pedido"
            className="relative grid h-11 w-11 place-items-center rounded-[var(--radius-control)] border border-line bg-surface text-text transition hover:border-gold/60"
            aria-label="Seu pedido"
          >
            <ShoppingBag className="h-5 w-5" />
            <OrderCountBadge />
          </Link>
        </nav>
      </div>
    </header>
  );
}
