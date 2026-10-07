"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import type { Brand, Category } from "@/lib/types";
import { deleteBrand, deleteCategory, saveBrand, saveCategory, type ActionResult } from "@/app/admin/actions";
import { CATEGORY_ICONS, CategoryIcon } from "@/components/ui/CategoryIcon";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { Field, FormError, Select, TextInput, Toggle, slugify } from "./fields";

type Row = { id?: string; name: string; slug: string; active: boolean; description?: string; icon?: string; sortOrder?: number; logo?: string; count: number };

/** Lista + edição em gaveta, usada para Categorias e Marcas */
export function TaxonomyEditor({ kind, items }: { kind: "category" | "brand"; items: Array<(Category | Brand) & { count: number }> }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Row | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const label = kind === "category" ? "categoria" : "marca";

  const rows: Row[] = items.map((i) => ({
    id: i.id,
    name: i.name,
    slug: i.slug,
    active: i.active,
    count: i.count,
    description: "description" in i ? i.description : undefined,
    icon: "icon" in i ? i.icon : undefined,
    sortOrder: "sortOrder" in i ? i.sortOrder : undefined,
    logo: "logo" in i ? i.logo : undefined,
  }));

  const run = (fn: () => Promise<ActionResult>, after?: () => void) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) return setError(r.error);
      setError(null);
      after?.();
      router.refresh();
    });

  const save = () => {
    if (!editing) return;
    run(
      () =>
        kind === "category"
          ? saveCategory({ id: editing.id, name: editing.name, slug: editing.slug || slugify(editing.name), description: editing.description, icon: editing.icon, sort_order: editing.sortOrder ?? 0, active: editing.active })
          : saveBrand({ id: editing.id, name: editing.name, slug: editing.slug || slugify(editing.name), logo_url: editing.logo, active: editing.active }),
      () => setEditing(null),
    );
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setEditing({ name: "", slug: "", active: true, count: 0, sortOrder: rows.length + 1, icon: "grid" })}>
          <Plus className="h-4 w-4" /> Nova {label}
        </Button>
      </div>
      {error && !editing && <FormError message={error} />}
      <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center gap-3 p-3">
            {kind === "category" && (
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-gold">
                <CategoryIcon name={r.icon} className="h-5 w-5" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {r.name} {!r.active && <span className="ml-1 text-xs font-normal text-warning">(oculta)</span>}
              </p>
              <p className="truncate text-xs text-subtle">
                /{kind === "category" ? `categoria/${r.slug}` : r.slug} · {r.count} produtos{kind === "category" ? ` · ordem ${r.sortOrder}` : ""}
              </p>
            </div>
            <button type="button" onClick={() => setEditing(r)} className="grid h-10 w-10 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-gold-bright" aria-label={`Editar ${r.name}`}>
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                const msg = r.count > 0 ? `Excluir "${r.name}"? ${r.count} produto(s) perderão esta ${label}.` : `Excluir "${r.name}"?`;
                if (window.confirm(msg)) run(() => (kind === "category" ? deleteCategory(r.id!) : deleteBrand(r.id!)));
              }}
              className="grid h-10 w-10 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-danger"
              aria-label={`Excluir ${r.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
        {rows.length === 0 && <li className="p-8 text-center text-sm text-muted">Nenhuma {label} cadastrada.</li>}
      </ul>

      <Sheet
        open={Boolean(editing)}
        onClose={() => {
          setEditing(null);
          setError(null);
        }}
        title={editing?.id ? `Editar ${label}` : `Nova ${label}`}
        footer={
          <Button block onClick={save} disabled={pending || !editing?.name.trim()}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />} Salvar
          </Button>
        }
      >
        {editing && (
          <div className="space-y-4">
            <Field label="Nome">
              <TextInput
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })}
                autoFocus
              />
            </Field>
            <Field label="Endereço (slug)" hint={kind === "category" ? `Link: /categoria/${editing.slug || "…"}` : undefined}>
              <TextInput value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} />
            </Field>
            {kind === "category" ? (
              <>
                <Field label="Descrição">
                  <TextInput value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Ícone">
                    <Select value={editing.icon ?? "grid"} onChange={(e) => setEditing({ ...editing, icon: e.target.value })}>
                      {Object.keys(CATEGORY_ICONS).map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Ordem">
                    <TextInput inputMode="numeric" value={String(editing.sortOrder ?? 0)} onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) || 0 })} />
                  </Field>
                </div>
              </>
            ) : (
              <Field label="URL do logo (opcional)">
                <TextInput value={editing.logo ?? ""} onChange={(e) => setEditing({ ...editing, logo: e.target.value })} />
              </Field>
            )}
            <Toggle checked={editing.active} onChange={(v) => setEditing({ ...editing, active: v })} label="Visível no site" />
            <FormError message={error} />
          </div>
        )}
      </Sheet>
    </div>
  );
}
