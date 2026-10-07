"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Search, ShoppingBag } from "lucide-react";
import { useUI } from "@/store/ui-store";
import { useStoreConfig } from "@/store/store-config";
import { whatsappLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/ui/icons";
import { OrderCountBadge } from "./Header";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

const item = "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition";

/** Navegação inferior fixa — só no mobile, onde o polegar alcança. */
export function BottomNav() {
  const pathname = usePathname();
  const { openSearch, openCategories, searchOpen, categoriesOpen } = useUI();
  const { whatsappNumber, storeName } = useStoreConfig();
  const overlay = searchOpen || categoriesOpen;
  const active = (match: boolean) => (match && !overlay ? "text-gold-bright" : "text-muted");

  return (
    <nav
      className="pb-safe fixed inset-x-0 bottom-0 z-[60] border-t border-line bg-bg/92 backdrop-blur-xl md:hidden"
      aria-label="Navegação principal"
    >
      <div className="mx-auto flex h-16 max-w-md items-stretch">
        <Link href="/" className={cn(item, active(pathname === "/"))}>
          <Home className="h-[22px] w-[22px]" strokeWidth={1.8} />
          Início
        </Link>
        <button type="button" onClick={openCategories} className={cn(item, categoriesOpen ? "text-gold-bright" : active(pathname.startsWith("/categoria") || pathname.startsWith("/catalogo")))}>
          <LayoutGrid className="h-[22px] w-[22px]" strokeWidth={1.8} />
          Categorias
        </button>
        <button type="button" onClick={openSearch} className={cn(item, searchOpen ? "text-gold-bright" : "text-muted")}>
          <Search className="h-[22px] w-[22px]" strokeWidth={1.8} />
          Buscar
        </button>
        <Link href="/pedido" className={cn(item, active(pathname === "/pedido"))}>
          <span className="relative">
            <ShoppingBag className="h-[22px] w-[22px]" strokeWidth={1.8} />
            <OrderCountBadge className="-right-2.5 -top-1.5" />
          </span>
          Pedido
        </Link>
        <a
          href={whatsappLink(whatsappNumber, `Olá! Vim pelo catálogo da ${storeName}.`)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track({ type: "whatsapp_click", meta: { from: "bottom-nav" } })}
          className={cn(item, "text-whatsapp")}
        >
          <WhatsAppIcon className="h-[22px] w-[22px]" />
          WhatsApp
        </a>
      </div>
    </nav>
  );
}
