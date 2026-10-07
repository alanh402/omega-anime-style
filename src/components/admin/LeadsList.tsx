"use client";

import { useState, useTransition } from "react";
import { MessageSquareText } from "lucide-react";
import type { Lead } from "@/lib/types";
import { formatBRL } from "@/lib/pricing";
import { updateLeadStatus } from "@/app/admin/actions";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";

const STATUS: Record<Lead["status"], { label: string; cls: string }> = {
  novo: { label: "Novo", cls: "bg-info/15 text-info" },
  em_atendimento: { label: "Em atendimento", cls: "bg-warning/15 text-warning" },
  vendido: { label: "Vendido", cls: "bg-success/15 text-success" },
  perdido: { label: "Perdido", cls: "bg-surface-3 text-subtle" },
};

const dateFmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

export function LeadsList({ leads }: { leads: Lead[] }) {
  const [status, setStatus] = useState<Record<string, Lead["status"]>>({});
  const [filter, setFilter] = useState<Lead["status"] | "">("");
  const [, start] = useTransition();

  if (!leads.length)
    return (
      <EmptyState
        icon={<MessageSquareText className="h-7 w-7" />}
        title="Nenhum pedido ainda"
        description="Quando um cliente tocar em “Enviar pedido pelo WhatsApp”, o resumo aparece aqui."
      />
    );

  const current = (l: Lead) => status[l.id] ?? l.status;
  const visible = leads.filter((l) => !filter || current(l) === filter);
  const sold = leads.filter((l) => current(l) === "vendido");

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["", "novo", "em_atendimento", "vendido", "perdido"] as const).map((k) => (
          <button
            key={k || "todos"}
            type="button"
            onClick={() => setFilter(k)}
            className={cn("h-9 rounded-full border px-3.5 text-xs font-semibold", filter === k ? "border-gold bg-gold/12 text-gold-bright" : "border-line text-muted")}
          >
            {k ? STATUS[k].label : "Todos"} ({k ? leads.filter((l) => current(l) === k).length : leads.length})
          </button>
        ))}
        <span className="ml-auto text-xs text-muted">
          Vendidos: <strong className="tabular text-success">{formatBRL(sold.reduce((s, l) => s + l.total, 0))}</strong>
        </span>
      </div>
      <ul className="space-y-3">
        {visible.map((l) => (
          <li key={l.id} className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{l.customerName ?? "Cliente sem nome"}</p>
                <p className="text-xs text-subtle">{dateFmt.format(new Date(l.createdAt))}</p>
              </div>
              <select
                value={current(l)}
                onChange={(e) => {
                  const v = e.target.value as Lead["status"];
                  setStatus((m) => ({ ...m, [l.id]: v }));
                  start(async () => {
                    await updateLeadStatus(l.id, v);
                  });
                }}
                className={cn("h-9 cursor-pointer rounded-full border-0 px-3 text-xs font-bold outline-none", STATUS[current(l)].cls)}
                aria-label="Status do pedido"
              >
                {Object.entries(STATUS).map(([k, v]) => (
                  <option key={k} value={k} className="bg-surface text-text">
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
            <ul className="mt-3 space-y-1 text-sm">
              {l.items.map((i, idx) => (
                <li key={idx} className="flex justify-between gap-3">
                  <span className="text-muted">
                    {i.quantity}× {i.name}
                    {i.variant && <span className="text-subtle"> · {i.variant}</span>}
                  </span>
                  <span className="tabular shrink-0">{formatBRL(i.unitPrice * i.quantity)}</span>
                </li>
              ))}
            </ul>
            {l.note && <p className="mt-2 rounded-xl bg-surface-2 p-2.5 text-xs text-muted">Obs.: {l.note}</p>}
            <p className="mt-3 border-t border-line pt-2 text-right text-sm font-bold">
              Total estimado <span className="tabular text-gold-bright">{formatBRL(l.total)}</span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
