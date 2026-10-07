"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Info, ShoppingBag, Trash2 } from "lucide-react";
import { useOrder } from "@/store/order-store";
import { useStoreConfig } from "@/store/store-config";
import { formatBRL } from "@/lib/pricing";
import { buildOrderMessage, whatsappLink } from "@/lib/whatsapp";
import { track, getSessionId } from "@/lib/analytics";
import { ProductImage } from "@/components/ui/ProductImage";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { WhatsAppIcon } from "@/components/ui/icons";
import { Sheet } from "@/components/ui/Sheet";

export function OrderView() {
  const { items, hydrated, count, total, setQuantity, remove, clear } = useOrder();
  const config = useStoreConfig();
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [preview, setPreview] = useState(false);
  // Barra fixa de envio no celular enquanto o botão principal não está visível
  const sendRef = useRef<HTMLDivElement>(null);
  const [sendVisible, setSendVisible] = useState(true);
  useEffect(() => {
    const el = sendRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setSendVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [items.length, hydrated]);

  const message = useMemo(
    () =>
      buildOrderMessage({
        items,
        settings: { storeName: config.storeName, orderMessage: config.orderMessage },
        siteUrl: config.siteUrl,
        customerName: name,
        note,
      }),
    [items, config, name, note],
  );
  const href = whatsappLink(config.whatsappNumber, message);

  const onSend = () => {
    track({ type: "order_sent", meta: { items: items.length, units: count, total } });
    // Registra o lead (não bloqueia a abertura do WhatsApp)
    try {
      const body = JSON.stringify({
        customerName: name || undefined,
        note: note || undefined,
        total,
        sessionId: getSessionId(),
        items: items.map((i) => ({ productId: i.productId, name: i.name, variant: i.variantLabel, quantity: i.quantity, unitPrice: i.unitPrice })),
      });
      navigator.sendBeacon?.("/api/leads", new Blob([body], { type: "application/json" }));
    } catch {
      /* ignore */
    }
  };

  if (!hydrated) {
    return (
      <div className="space-y-3">
        {[0, 1].map((i) => (
          <div key={i} className="skeleton h-28 rounded-[var(--radius-card)]" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="h-7 w-7" />}
        title="Seu pedido está vazio"
        description="Explore o catálogo e toque em “Adicionar” nos produtos que você quer. Depois é só enviar pelo WhatsApp."
        action={
          <>
            <ButtonLink href="/catalogo">Explorar produtos</ButtonLink>
            <ButtonLink href={whatsappLink(config.whatsappNumber, `Olá! Vim pelo catálogo da ${config.storeName}.`)} variant="outline">
              <WhatsAppIcon className="h-5 w-5 text-whatsapp" /> Falar com a Omega
            </ButtonLink>
          </>
        }
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
      <section aria-label="Itens do pedido">
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.key} className="flex gap-3 rounded-[var(--radius-card)] border border-line bg-surface p-3 sm:gap-4 sm:p-4">
              <Link href={`/produto/${item.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-2 sm:h-24 sm:w-24">
                <ProductImage src={item.image} alt={item.name} sizes="96px" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link href={`/produto/${item.slug}`} className="line-clamp-2 text-sm font-semibold leading-tight hover:text-gold-bright sm:text-[15px]">
                      {item.name}
                    </Link>
                    {item.variantLabel && <p className="mt-0.5 text-xs text-muted">{item.variantLabel}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(item.key)}
                    className="-mr-1 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-subtle transition hover:bg-danger/10 hover:text-danger"
                    aria-label={`Remover ${item.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-2">
                  <QuantityStepper size="sm" value={item.quantity} max={Math.min(item.maxQuantity, 20)} onChange={(q) => setQuantity(item.key, q)} />
                  <div className="text-right">
                    {item.quantity > 1 && <p className="tabular text-[11px] text-subtle">{formatBRL(item.unitPrice)} cada</p>}
                    <p className="tabular text-base font-extrabold">{formatBRL(item.unitPrice * item.quantity)}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between">
          <Link href="/catalogo" className="inline-flex h-10 items-center gap-1.5 text-sm font-semibold text-gold-bright">
            <ArrowLeft className="h-4 w-4" /> Continuar escolhendo
          </Link>
          <Button variant="danger" size="sm" onClick={() => setConfirmClear(true)}>
            <Trash2 className="h-4 w-4" /> Limpar pedido
          </Button>
        </div>
      </section>

      <aside className="rounded-[var(--radius-card)] border border-line bg-surface p-4 sm:p-5 lg:sticky lg:top-24">
        <h2 className="font-display text-base font-bold">Resumo</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between text-muted">
            <dt>
              {count} {count === 1 ? "item" : "itens"}
            </dt>
            <dd className="tabular">{formatBRL(total)}</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-line pt-3">
            <dt className="font-semibold">Total estimado</dt>
            <dd className="tabular text-2xl font-extrabold text-gold-bright">{formatBRL(total)}</dd>
          </div>
        </dl>
        <p className="mt-3 flex gap-2 rounded-xl bg-surface-2 p-3 text-xs leading-relaxed text-muted">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
          O valor final, a disponibilidade, o pagamento e a entrega são confirmados pelo vendedor no WhatsApp.
        </p>

        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          className="mt-4 flex h-10 w-full items-center justify-between text-sm font-semibold text-muted hover:text-text"
          aria-expanded={showDetails}
        >
          Adicionar nome e observação (opcional)
          <ChevronDown className={`h-4 w-4 transition ${showDetails ? "rotate-180" : ""}`} />
        </button>
        {showDetails && (
          <div className="mt-2 space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-subtle">Seu nome</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 60))}
                autoComplete="given-name"
                className="h-11 w-full rounded-[12px] border border-line bg-surface-2 px-3 text-[15px] outline-none focus:border-gold/60"
                placeholder="Como podemos te chamar?"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-subtle">Observação</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 300))}
                rows={3}
                className="w-full resize-none rounded-[12px] border border-line bg-surface-2 px-3 py-2.5 text-[15px] outline-none focus:border-gold/60"
                placeholder="Ex.: entrega no centro, pagamento no Pix…"
              />
            </label>
          </div>
        )}

        <div ref={sendRef}>
          <ButtonLink href={href} variant="whatsapp" size="lg" block className="mt-5" onClick={onSend}>
            <WhatsAppIcon className="h-5 w-5" /> Enviar pedido pelo WhatsApp
          </ButtonLink>
        </div>
        <button type="button" onClick={() => setPreview(true)} className="mt-2 h-10 w-full text-xs font-semibold text-subtle hover:text-muted">
          Ver mensagem que será enviada
        </button>
      </aside>

      <div
        className={`fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-40 border-t border-line bg-bg/95 px-4 py-2.5 backdrop-blur-xl transition-transform duration-300 md:bottom-0 lg:hidden ${
          sendVisible ? "pointer-events-none translate-y-[200%]" : "translate-y-0"
        }`}
        aria-hidden={sendVisible}
      >
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="shrink-0">
            <p className="text-[11px] text-muted">Total estimado</p>
            <p className="tabular text-base font-extrabold text-gold-bright">{formatBRL(total)}</p>
          </div>
          <ButtonLink href={href} variant="whatsapp" block onClick={onSend} tabIndex={sendVisible ? -1 : 0}>
            <WhatsAppIcon className="h-5 w-5" /> Enviar pedido
          </ButtonLink>
        </div>
      </div>

      <Sheet open={preview} onClose={() => setPreview(false)} title="Mensagem do pedido">
        <pre className="whitespace-pre-wrap rounded-2xl bg-surface-2 p-4 font-sans text-sm leading-relaxed text-muted">{message}</pre>
      </Sheet>

      <Sheet
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Limpar pedido?"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" block onClick={() => setConfirmClear(false)}>
              Cancelar
            </Button>
            <Button
              block
              variant="destructive"
              onClick={() => {
                clear();
                setConfirmClear(false);
              }}
            >
              Limpar tudo
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted">Todos os {count} itens serão removidos do seu pedido.</p>
      </Sheet>
    </div>
  );
}
