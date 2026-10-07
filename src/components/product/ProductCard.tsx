"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Link2, Plus } from "lucide-react";
import type { ProductView } from "@/lib/types";
import { formatInstallments, getStartingPrice, getTotalStock, isOnSale } from "@/lib/pricing";
import { buildQuickBuyMessage, whatsappLink } from "@/lib/whatsapp";
import { toCartItem } from "@/lib/order";
import { absoluteUrl, copyText } from "@/lib/share";
import { track } from "@/lib/analytics";
import { useOrder } from "@/store/order-store";
import { useStoreConfig } from "@/store/store-config";
import { useSellerMode } from "@/store/seller-mode";
import { ProductImage } from "@/components/ui/ProductImage";
import { Badge } from "@/components/ui/Badge";
import { Price } from "@/components/ui/Price";
import { StockStatus } from "@/components/ui/StockStatus";
import { WhatsAppIcon } from "@/components/ui/icons";
import { QuickAddSheet } from "./QuickAddSheet";
import { cn } from "@/lib/cn";

interface Props {
  product: ProductView;
  priority?: boolean;
  /** Layout compacto para carrosséis horizontais */
  compact?: boolean;
}

export function ProductCard({ product, priority, compact }: Props) {
  const { add } = useOrder();
  const config = useStoreConfig();
  const seller = useSellerMode();
  const [quickOpen, setQuickOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const price = getStartingPrice(product);
  const stock = getTotalStock(product);
  const out = stock <= 0;
  const sale = isOnSale(product);
  const href = `/produto/${product.slug}`;
  const hasVariants = product.variants.length > 0;

  const onAdd = () => {
    if (hasVariants) setQuickOpen(true);
    else add(toCartItem(product));
  };

  const waHref = whatsappLink(
    config.whatsappNumber,
    buildQuickBuyMessage({
      productName: product.name,
      price: price.current,
      // URL do servidor (não window) para o HTML ser idêntico no SSR e no navegador
      url: `${config.siteUrl}${href}`,
      settings: config,
    }),
  );

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-0.5 hover:border-line-strong",
        out && "opacity-75",
      )}
    >
      <Link href={href} className="relative block aspect-square overflow-hidden bg-surface-2" aria-label={product.name}>
        <ProductImage
          src={product.images[0]?.url}
          alt={product.images[0]?.alt ?? product.name}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
          className="transition duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {out ? (
            <Badge tone="danger">Esgotado</Badge>
          ) : (
            <>
              {sale && <Badge tone="offer">Oferta{price.discountPercent ? ` -${price.discountPercent}%` : ""}</Badge>}
              {product.isNew && <Badge tone="new">Novo</Badge>}
              {product.isFeatured && !sale && !product.isNew && <Badge tone="featured">Destaque</Badge>}
            </>
          )}
        </div>
      </Link>

      {seller && (
        <button
          type="button"
          onClick={async () => {
            const url = absoluteUrl(href, config.siteUrl);
            if (await copyText(`Temos esse modelo aqui 👇\n\n*${product.name}*\n${url}`)) {
              setCopied(true);
              track({ type: "share", productId: product.id, meta: { channel: "seller_card" } });
              setTimeout(() => setCopied(false), 1600);
            }
          }}
          className="absolute right-2 top-2 z-10 flex h-9 items-center gap-1.5 rounded-full bg-bg/85 px-3 text-xs font-bold text-gold-bright backdrop-blur"
          aria-label="Copiar link do produto"
        >
          {copied ? <Check className="h-4 w-4 text-success" /> : <Link2 className="h-4 w-4" />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      )}

      <div className={cn("flex flex-1 flex-col gap-2 p-3", !compact && "sm:p-4")}>
        <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-subtle">
          {[product.brand?.name, product.categories[0]?.name].filter(Boolean).join(" · ")}
        </p>
        <Link href={href} className="line-clamp-2 min-h-[2.5em] text-sm font-semibold leading-tight hover:text-gold-bright sm:text-[15px]">
          {product.name}
        </Link>
        <div className="mt-auto pt-1">
          <Price
            info={price}
            prefix={price.hasRange ? "a partir de" : undefined}
            installments={!compact ? formatInstallments(product, price.current) : undefined}
          />
          {!out && stock <= 3 && <StockStatus stock={stock} className="mt-1.5" />}
        </div>
        <div className="mt-1 flex gap-2">
          <button
            type="button"
            onClick={onAdd}
            disabled={out}
            className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-[12px] bg-surface-3 text-[13px] font-bold transition hover:bg-gold hover:text-gold-ink active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40"
          >
            <Plus className="h-4 w-4" /> {out ? "Esgotado" : "Adicionar"}
          </button>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track({ type: "whatsapp_click", productId: product.id, meta: { from: "card" } })}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-whatsapp/12 text-whatsapp transition hover:bg-whatsapp hover:text-[#04260f]"
            aria-label={`Comprar ${product.name} pelo WhatsApp`}
            title="Comprar pelo WhatsApp"
          >
            <WhatsAppIcon className="h-5 w-5" />
          </a>
        </div>
      </div>

      {hasVariants && <QuickAddSheet product={product} open={quickOpen} onClose={() => setQuickOpen(false)} />}
    </article>
  );
}
