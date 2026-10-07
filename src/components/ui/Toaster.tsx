"use client";

import Link from "next/link";
import Image from "next/image";
import { Check, X } from "lucide-react";
import { useOrder } from "@/store/order-store";

/** Feedback de sucesso ao adicionar ao pedido. Fica acima da barra inferior no mobile. */
export function Toaster() {
  const { toasts, dismiss } = useOrder();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(76px+env(safe-area-inset-bottom))] z-[80] flex flex-col items-center gap-2 px-3 md:bottom-6 md:right-6 md:left-auto md:items-end" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex w-full max-w-sm animate-fade-up items-center gap-3 rounded-2xl border border-line-strong bg-surface-2/95 p-2.5 pr-2 shadow-[var(--shadow-pop)] backdrop-blur"
        >
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-surface-3">
            {t.image ? (
              <Image src={t.image} alt="" fill sizes="44px" unoptimized={t.image.endsWith(".svg")} className="object-cover" />
            ) : (
              <span className="grid h-full place-items-center text-success">
                <Check className="h-5 w-5" />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <Check className="h-4 w-4 text-success" /> {t.title}
            </p>
            {t.description && <p className="truncate text-xs text-muted">{t.description}</p>}
          </div>
          {t.action && (
            <Link
              href={t.action.href}
              onClick={() => dismiss(t.id)}
              className="shrink-0 rounded-[10px] bg-gold-metal px-3 py-2 text-xs font-bold text-gold-ink"
            >
              {t.action.label}
            </Link>
          )}
          <button type="button" onClick={() => dismiss(t.id)} className="grid h-8 w-8 shrink-0 place-items-center text-subtle hover:text-text" aria-label="Fechar aviso">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
