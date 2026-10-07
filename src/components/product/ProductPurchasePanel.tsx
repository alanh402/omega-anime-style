"use client";

import { useEffect, useRef, useState } from "react";
import { BadgeCheck, MessagesSquare, Share2, ShoppingBag, Truck } from "lucide-react";
import type { ProductView } from "@/lib/types";
import { formatBRL, formatInstallments, getPriceInfo, getStartingPrice, getTotalStock } from "@/lib/pricing";
import { findVariant, initialSelection, variantLabel, type Selection } from "@/lib/variants";
import { buildQuickBuyMessage, whatsappLink } from "@/lib/whatsapp";
import { toCartItem } from "@/lib/order";
import { track } from "@/lib/analytics";
import { useOrder } from "@/store/order-store";
import { useStoreConfig } from "@/store/store-config";
import { Price } from "@/components/ui/Price";
import { StockStatus } from "@/components/ui/StockStatus";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Button, ButtonLink } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { VariantSelector } from "./VariantSelector";
import { ShareSheet } from "./ShareSheet";
import { cn } from "@/lib/cn";
import { useProductDetail } from "./ProductDetailContext";

/** Painel de compra: variação, quantidade, adicionar ao pedido e WhatsApp */
export function ProductPurchasePanel({ product }: { product: ProductView }) {
  const { add } = useOrder();
  const config = useStoreConfig();
  const [selection, setSelection] = useState<Selection>(() => initialSelection(product));
  const [qty, setQty] = useState(1);
  const [shareOpen, setShareOpen] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  const hasVariants = product.variants.length > 0;
  const variant = hasVariants ? findVariant(product, selection) : undefined;
  const price = hasVariants && !variant ? getStartingPrice(product) : getPriceInfo(product, variant);
  const stock = hasVariants ? (variant?.stock ?? 0) : getTotalStock(product);
  const out = stock <= 0;
  const label = variantLabel(variant, product);
  const maxQty = Math.max(1, Math.min(stock, 20));

  useEffect(() => setQty((q) => Math.min(q, maxQty)), [maxQty]);

  const { setActiveImage } = useProductDetail();
  useEffect(() => setActiveImage(variant?.image), [variant?.image, setActiveImage]);

  // Barra fixa no mobile quando os botões principais saem da tela
  useEffect(() => {
    const el = actionsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setStickyVisible(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const waHref = whatsappLink(
    config.whatsappNumber,
    buildQuickBuyMessage({
      productName: qty > 1 ? `${qty}x ${product.name}` : product.name,
      variantLabel: label,
      price: price.current * qty,
      url: `${config.siteUrl}/produto/${product.slug}`,
      settings: config,
    }),
  );
  const onWhatsApp = () => track({ type: "whatsapp_click", productId: product.id, meta: { from: "product", variant: label } });
  const onAdd = () => add(toCartItem(product, variant), qty);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Price info={price} size="lg" prefix={hasVariants && !variant ? "a partir de" : undefined} installments={formatInstallments(product, price.current)} />
        <StockStatus stock={stock} className="mt-3" />
      </div>

      {hasVariants && <VariantSelector product={product} selection={selection} onChange={setSelection} />}

      <div ref={actionsRef} className="flex flex-col gap-3">
        <div className="flex gap-3">
          <QuantityStepper value={qty} onChange={setQty} max={maxQty} />
          <Button size="lg" block disabled={out} onClick={onAdd}>
            <ShoppingBag className="h-5 w-5" /> {out ? "Indisponível" : <>Adicionar<span className="hidden xs:inline">&nbsp;ao pedido</span></>}
          </Button>
        </div>
        <ButtonLink href={waHref} variant="whatsapp" size="lg" block onClick={onWhatsApp}>
          <WhatsAppIcon className="h-5 w-5" /> {out ? "Avise-me quando chegar" : "Comprar pelo WhatsApp"}
        </ButtonLink>
        <Button variant="ghost" onClick={() => setShareOpen(true)} className="self-start">
          <Share2 className="h-4 w-4" /> Compartilhar produto
        </Button>
      </div>

      <ul className="grid gap-2.5 rounded-2xl border border-line bg-surface p-4 text-sm text-muted">
        <li className="flex items-center gap-3">
          <MessagesSquare className="h-4 w-4 shrink-0 text-gold" /> Atendimento humano direto no WhatsApp
        </li>
        <li className="flex items-center gap-3">
          <BadgeCheck className="h-4 w-4 shrink-0 text-gold" /> Preço e disponibilidade confirmados pelo vendedor
        </li>
        <li className="flex items-center gap-3">
          <Truck className="h-4 w-4 shrink-0 text-gold" /> Pagamento e entrega combinados na conversa
        </li>
      </ul>

      {/* Barra de ação fixa (mobile) — fica acima da navegação inferior */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-40 border-t border-line bg-bg/95 px-4 py-2.5 backdrop-blur-xl transition-transform duration-300 md:hidden",
          stickyVisible ? "translate-y-0" : "pointer-events-none translate-y-[200%]",
        )}
        aria-hidden={!stickyVisible}
      >
        <div className="flex items-center gap-2.5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted">{label ?? product.name}</p>
            <p className="tabular text-base font-extrabold">{formatBRL(price.current)}</p>
          </div>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onWhatsApp}
            tabIndex={stickyVisible ? 0 : -1}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-whatsapp text-[#04260f]"
            aria-label="Comprar pelo WhatsApp"
          >
            <WhatsAppIcon className="h-5 w-5" />
          </a>
          <Button disabled={out} onClick={onAdd} tabIndex={stickyVisible ? 0 : -1} className="px-4">
            <ShoppingBag className="h-4 w-4" /> Adicionar
          </Button>
        </div>
      </div>

      <ShareSheet open={shareOpen} onClose={() => setShareOpen(false)} productId={product.id} slug={product.slug} name={product.name} />
    </div>
  );
}
