"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /** bottom: gaveta de baixo no mobile e modal central no desktop; right: painel lateral */
  side?: "bottom" | "right";
}

/** Drawer/modal acessível: fecha com Esc e clique fora, trava rolagem do fundo. */
export function Sheet({ open, onClose, title, children, footer, side = "bottom" }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 animate-fade-in bg-black/70 backdrop-blur-[2px]" onClick={onClose} />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          "absolute flex flex-col bg-surface shadow-[var(--shadow-pop)] outline-none",
          side === "bottom" &&
            "inset-x-0 bottom-0 max-h-[88dvh] animate-slide-up rounded-t-3xl border-t border-line md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:w-full md:max-w-lg md:-translate-x-1/2 md:-translate-y-1/2 md:animate-fade-in md:rounded-3xl md:border",
          side === "right" && "inset-y-0 right-0 w-full max-w-sm animate-slide-left border-l border-line",
        )}
      >
        {side === "bottom" && <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-line-strong md:hidden" />}
        <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-4">
          <h2 className="font-display text-base font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-text"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-5">{children}</div>
        {footer && <div className="pb-safe border-t border-line bg-surface px-5 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
