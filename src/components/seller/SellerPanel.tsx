"use client";

import { Link2, MessageSquareText, Search, Share2 } from "lucide-react";
import { setSellerMode, useSellerMode } from "@/store/seller-mode";
import { useUI } from "@/store/ui-store";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const steps = [
  { icon: Search, title: "Cliente pergunta “tem iPhone?”", text: "Toque em Buscar e digite “iphone”." },
  { icon: Link2, title: "Toque em “Copiar” no card", text: "Copia a mensagem “Temos esse modelo aqui 👇” com o link." },
  { icon: MessageSquareText, title: "Cole na conversa", text: "O link mostra foto, nome e preço do produto." },
  { icon: Share2, title: "O pedido volta organizado", text: "O cliente monta o pedido e envia pelo WhatsApp." },
];

export function SellerPanel() {
  const on = useSellerMode();
  const { openSearch } = useUI();
  return (
    <div className="space-y-6">
      <div className={cn("flex items-center justify-between gap-4 rounded-[var(--radius-card)] border p-5 transition", on ? "border-gold/60 bg-gold/8" : "border-line bg-surface")}>
        <div>
          <p className="font-semibold">Modo vendedor</p>
          <p className="mt-1 text-sm text-muted">
            {on ? "Ativo neste aparelho. Os cards mostram o botão “Copiar”." : "Mostra o botão “Copiar link” em todos os produtos deste aparelho."}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          onClick={() => setSellerMode(!on)}
          className={cn("relative h-8 w-14 shrink-0 rounded-full transition", on ? "bg-gold" : "bg-surface-3")}
          aria-label="Ativar modo vendedor"
        >
          <span className={cn("absolute top-1 h-6 w-6 rounded-full bg-text shadow transition-all", on ? "left-7" : "left-1")} />
        </button>
      </div>

      <ol className="space-y-3">
        {steps.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="flex gap-4 rounded-2xl border border-line bg-surface p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-gold">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">
                <span className="text-gold">{i + 1}.</span> {title}
              </p>
              <p className="mt-0.5 text-sm text-muted">{text}</p>
            </div>
          </li>
        ))}
      </ol>
      <Button block size="lg" onClick={openSearch}>
        <Search className="h-5 w-5" /> Buscar um produto agora
      </Button>
    </div>
  );
}
