"use client";

import type { Brand, Category } from "@/lib/types";
import type { CatalogFilters } from "@/lib/search";
import { cn } from "@/lib/cn";
import { Check } from "lucide-react";

export const PRICE_RANGES: Array<{ label: string; min?: number; max?: number }> = [
  { label: "Até R$ 100", max: 100 },
  { label: "R$ 100 a R$ 500", min: 100, max: 500 },
  { label: "R$ 500 a R$ 2.000", min: 500, max: 2000 },
  { label: "R$ 2.000 a R$ 5.000", min: 2000, max: 5000 },
  { label: "Acima de R$ 5.000", min: 5000 },
];

interface Props {
  filters: CatalogFilters;
  onChange: (f: CatalogFilters) => void;
  categories: Array<Category & { count: number }>;
  brands: Array<Brand & { count: number }>;
  hideCategories?: boolean;
}

function toggle(list: string[], v: string) {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

function CheckRow({ checked, label, count, onClick }: { checked: boolean; label: string; count?: number; onClick: () => void }) {
  return (
    <button type="button" role="checkbox" aria-checked={checked} onClick={onClick} className="flex min-h-10 w-full items-center gap-3 text-left text-sm">
      <span className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-md border transition", checked ? "border-gold bg-gold text-gold-ink" : "border-line-strong")}>
        {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
      <span className={cn("flex-1", checked ? "font-semibold text-text" : "text-muted")}>{label}</span>
      {count != null && <span className="text-xs text-subtle tabular">{count}</span>}
    </button>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-line py-4 first:pt-0 last:border-0">
      <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-subtle">{title}</h3>
      {children}
    </div>
  );
}

export function FilterPanel({ filters, onChange, categories, brands, hideCategories }: Props) {
  const set = (patch: Partial<CatalogFilters>) => onChange({ ...filters, ...patch });

  return (
    <div>
      <Group title="Mostrar">
        <CheckRow checked={filters.onSale} label="Em oferta" onClick={() => set({ onSale: !filters.onSale })} />
        <CheckRow checked={filters.inStock} label="Disponíveis agora" onClick={() => set({ inStock: !filters.inStock })} />
        <CheckRow checked={filters.isNew} label="Novidades" onClick={() => set({ isNew: !filters.isNew })} />
        <CheckRow checked={filters.featured} label="Destaques" onClick={() => set({ featured: !filters.featured })} />
      </Group>

      {!hideCategories && (
        <Group title="Categoria">
          {categories
            .filter((c) => c.count > 0 || filters.categories.includes(c.slug))
            .map((c) => (
              <CheckRow
                key={c.id}
                checked={filters.categories.includes(c.slug)}
                label={c.name}
                count={c.count}
                onClick={() => set({ categories: toggle(filters.categories, c.slug) })}
              />
            ))}
        </Group>
      )}

      <Group title="Marca">
        {brands
          .filter((b) => b.count > 0 || filters.brands.includes(b.slug))
          .map((b) => (
            <CheckRow key={b.id} checked={filters.brands.includes(b.slug)} label={b.name} count={b.count} onClick={() => set({ brands: toggle(filters.brands, b.slug) })} />
          ))}
      </Group>

      <Group title="Faixa de preço">
        <div className="flex flex-wrap gap-2">
          {PRICE_RANGES.map((r) => {
            const active = filters.minPrice === r.min && filters.maxPrice === r.max;
            return (
              <button
                key={r.label}
                type="button"
                aria-pressed={active}
                onClick={() => set(active ? { minPrice: undefined, maxPrice: undefined } : { minPrice: r.min, maxPrice: r.max })}
                className={cn(
                  "h-9 rounded-full border px-3 text-xs font-semibold transition",
                  active ? "border-gold bg-gold/12 text-gold-bright" : "border-line text-muted hover:border-line-strong",
                )}
              >
                {r.label}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <PriceInput label="Mínimo" value={filters.minPrice} onChange={(v) => set({ minPrice: v })} />
          <span className="text-subtle">–</span>
          <PriceInput label="Máximo" value={filters.maxPrice} onChange={(v) => set({ maxPrice: v })} />
        </div>
      </Group>
    </div>
  );
}

function PriceInput({ label, value, onChange }: { label: string; value?: number; onChange: (v?: number) => void }) {
  return (
    <label className="relative flex-1">
      <span className="sr-only">{label}</span>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-subtle">R$</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        placeholder={label}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Math.max(0, Number(e.target.value)))}
        className="h-11 w-full rounded-[12px] border border-line bg-surface-2 pl-9 pr-2 text-sm outline-none focus:border-gold/60"
      />
    </label>
  );
}
