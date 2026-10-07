"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ExternalLink, Pencil, Search } from "lucide-react";
import type { Brand, Category, Product } from "@/lib/types";
import { formatBRL, getStartingPrice, getTotalStock, isOnSale } from "@/lib/pricing";
import { normalize } from "@/lib/search";
import { setProductActive } from "@/app/admin/actions";
import { ProductImage } from "@/components/ui/ProductImage";
import { Badge } from "@/components/ui/Badge";
import { inputCls, Toggle } from "./fields";
import { cn } from "@/lib/cn";

export function ProductsTable({ products, categories, brands }: { products: Product[]; categories: Category[]; brands: Brand[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const catName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);
  const brandName = useMemo(() => new Map(brands.map((b) => [b.id, b.name])), [brands]);

  const list = products.filter((p) => {
    if (cat && !p.categoryIds.includes(cat)) return false;
    if (!q) return true;
    const hay = normalize(`${p.name} ${p.sku ?? ""} ${p.slug} ${brandName.get(p.brandId ?? "") ?? ""}`);
    return normalize(q).split(/\s+/).every((t) => hay.includes(t));
  });

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, SKU ou marca" className={cn(inputCls, "pl-9")} />
        </label>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className={cn(inputCls, "sm:w-56")}>
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="mb-3 text-sm text-danger">{error}</p>}

      <ul className={cn("divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface", pending && "opacity-70")}>
        {list.map((p) => {
          const price = getStartingPrice(p);
          const stock = getTotalStock(p);
          return (
            <li key={p.id} className="flex items-center gap-3 p-3 sm:gap-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                <ProductImage src={p.images[0]?.url} alt={p.name} sizes="56px" />
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/admin/produtos/${p.id}`} className="line-clamp-1 text-sm font-semibold hover:text-gold-bright">
                  {p.name}
                </Link>
                <p className="truncate text-xs text-subtle">
                  {[brandName.get(p.brandId ?? ""), catName.get(p.categoryIds[0]), p.sku].filter(Boolean).join(" · ")}
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {isOnSale(p) && <Badge tone="offer">Oferta</Badge>}
                  {p.isNew && <Badge tone="new">Novo</Badge>}
                  {p.isFeatured && <Badge tone="featured">Destaque</Badge>}
                  {p.variants.length > 0 && <Badge>{p.variants.length} variações</Badge>}
                </div>
              </div>
              <div className="hidden w-28 shrink-0 text-right sm:block">
                <p className="tabular text-sm font-bold">{formatBRL(price.current)}</p>
                <p className={cn("text-xs", stock <= 0 ? "text-danger" : stock <= 3 ? "text-warning" : "text-subtle")}>{stock} em estoque</p>
              </div>
              <div className="hidden shrink-0 md:block">
                <Toggle
                  checked={p.active}
                  label={p.active ? "Ativo" : "Oculto"}
                  onChange={(v) =>
                    start(async () => {
                      const r = await setProductActive(p.id, v);
                      setError(r.ok ? null : r.error);
                    })
                  }
                />
              </div>
              <div className="flex shrink-0 gap-1">
                <Link href={`/produto/${p.slug}`} target="_blank" className="grid h-10 w-10 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-text" aria-label="Ver na loja">
                  <ExternalLink className="h-4 w-4" />
                </Link>
                <Link href={`/admin/produtos/${p.id}`} className="grid h-10 w-10 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-gold-bright" aria-label="Editar">
                  <Pencil className="h-4 w-4" />
                </Link>
              </div>
            </li>
          );
        })}
        {list.length === 0 && <li className="p-8 text-center text-sm text-muted">Nenhum produto encontrado.</li>}
      </ul>
    </div>
  );
}
