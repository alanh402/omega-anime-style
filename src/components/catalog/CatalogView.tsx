"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowDownWideNarrow, PackageSearch, Search, SlidersHorizontal, X } from "lucide-react";
import type { Brand, Category, ProductView } from "@/lib/types";
import {
  applyFilters,
  countActiveFilters,
  EMPTY_FILTERS,
  filtersToQuery,
  SORT_OPTIONS,
  type CatalogFilters,
  type SortKey,
} from "@/lib/search";
import { formatBRL } from "@/lib/pricing";
import { track } from "@/lib/analytics";
import { ProductCard } from "@/components/product/ProductCard";
import { Sheet } from "@/components/ui/Sheet";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { WhatsAppIcon } from "@/components/ui/icons";
import { useStoreConfig } from "@/store/store-config";
import { whatsappLink } from "@/lib/whatsapp";
import { FilterPanel } from "./FilterPanel";

const PAGE = 24;

interface Props {
  products: ProductView[];
  categories: Category[];
  brands: Brand[];
  initialFilters: CatalogFilters;
  /** Página de categoria: o filtro de categoria é fixo e oculto */
  lockedCategory?: string;
  /** Mensagem do estado vazio (categoria sem produtos) */
  emptyTitle?: string;
}

export function CatalogView({ products, categories, brands, initialFilters, lockedCategory, emptyTitle }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { whatsappNumber, storeName } = useStoreConfig();
  const [filters, setFilters] = useState<CatalogFilters>(initialFilters);
  const [query, setQuery] = useState(initialFilters.q);
  const [drawer, setDrawer] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const deferredQuery = useDeferredValue(query);

  const effective = useMemo(() => ({ ...filters, q: deferredQuery }), [filters, deferredQuery]);
  const results = useMemo(() => applyFilters(products, effective), [products, effective]);

  // Sincroniza filtros com a URL (links compartilháveis) sem rolar a página
  const firstSync = useRef(true);
  useEffect(() => {
    if (firstSync.current) {
      firstSync.current = false;
      return;
    }
    const t = setTimeout(() => router.replace(`${pathname}${filtersToQuery(effective)}`, { scroll: false }), 250);
    return () => clearTimeout(t);
  }, [effective, pathname, router]);

  // Registra buscas digitadas (após pausa)
  useEffect(() => {
    const q = deferredQuery.trim();
    if (q.length < 2) return;
    const t = setTimeout(() => track({ type: "search", query: q, meta: { results: results.length, from: "catalog" } }), 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deferredQuery]);

  useEffect(() => setLimit(PAGE), [effective]);

  const update = useCallback((f: CatalogFilters) => setFilters(f), []);
  const reset = () => {
    setFilters({ ...EMPTY_FILTERS });
    setQuery("");
  };

  // Contagens por categoria/marca dentro do escopo atual
  const catCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of products) for (const c of p.categories) m.set(c.slug, (m.get(c.slug) ?? 0) + 1);
    return categories.map((c) => ({ ...c, count: m.get(c.slug) ?? 0 }));
  }, [products, categories]);
  const brandCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of products) if (p.brand) m.set(p.brand.slug, (m.get(p.brand.slug) ?? 0) + 1);
    return brands.map((b) => ({ ...b, count: m.get(b.slug) ?? 0 }));
  }, [products, brands]);

  const activeCount = countActiveFilters(filters);
  const chips: Array<{ label: string; clear: () => void }> = [
    ...filters.categories.map((s) => ({
      label: categories.find((c) => c.slug === s)?.name ?? s,
      clear: () => update({ ...filters, categories: filters.categories.filter((x) => x !== s) }),
    })),
    ...filters.brands.map((s) => ({
      label: brands.find((b) => b.slug === s)?.name ?? s,
      clear: () => update({ ...filters, brands: filters.brands.filter((x) => x !== s) }),
    })),
    ...(filters.minPrice != null || filters.maxPrice != null
      ? [
          {
            label:
              filters.minPrice != null && filters.maxPrice != null
                ? `${formatBRL(filters.minPrice)} – ${formatBRL(filters.maxPrice)}`
                : filters.minPrice != null
                  ? `Acima de ${formatBRL(filters.minPrice)}`
                  : `Até ${formatBRL(filters.maxPrice!)}`,
            clear: () => update({ ...filters, minPrice: undefined, maxPrice: undefined }),
          },
        ]
      : []),
    ...(filters.onSale ? [{ label: "Em oferta", clear: () => update({ ...filters, onSale: false }) }] : []),
    ...(filters.inStock ? [{ label: "Disponíveis", clear: () => update({ ...filters, inStock: false }) }] : []),
    ...(filters.isNew ? [{ label: "Novidades", clear: () => update({ ...filters, isNew: false }) }] : []),
    ...(filters.featured ? [{ label: "Destaques", clear: () => update({ ...filters, featured: false }) }] : []),
  ];

  const panel = (
    <FilterPanel filters={filters} onChange={update} categories={catCounts} brands={brandCounts} hideCategories={Boolean(lockedCategory)} />
  );

  return (
    <div className="lg:grid lg:grid-cols-[256px_1fr] lg:gap-8">
      {/* Sidebar de filtros (desktop) */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-[var(--radius-card)] border border-line bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold">Filtros</h2>
            {activeCount > 0 && (
              <button type="button" onClick={() => update({ ...EMPTY_FILTERS, q: filters.q, sort: filters.sort })} className="text-xs font-semibold text-gold-bright">
                Limpar
              </button>
            )}
          </div>
          {panel}
        </div>
      </aside>

      <div className="min-w-0">
        {/* Barra de busca + ferramentas */}
        <div className="sticky top-16 z-30 -mx-4 border-b border-line/70 bg-bg/90 px-4 py-3 backdrop-blur-xl lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:pb-4 lg:backdrop-blur-none">
          <div className="flex gap-2">
            <label className="relative flex-1">
              <span className="sr-only">Buscar no catálogo</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-subtle" />
              <input
                type="search"
                inputMode="search"
                enterKeyHint="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar neste catálogo"
                className="h-11 w-full rounded-[var(--radius-control)] border border-line bg-surface pl-10 pr-9 text-[15px] outline-none placeholder:text-subtle focus:border-gold/60 [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center text-subtle" aria-label="Limpar busca">
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>
            <button
              type="button"
              onClick={() => setDrawer(true)}
              className="relative flex h-11 shrink-0 items-center gap-2 rounded-[var(--radius-control)] border border-line bg-surface px-3.5 text-sm font-semibold lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden xs:inline">Filtros</span>
              {activeCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[11px] font-bold text-gold-ink">{activeCount}</span>}
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-sm text-muted" aria-live="polite">
              <strong className="text-text tabular">{results.length}</strong> {results.length === 1 ? "produto" : "produtos"}
            </p>
            <label className="relative flex items-center gap-1.5 text-sm text-muted">
              <ArrowDownWideNarrow className="h-4 w-4" />
              <span className="sr-only">Ordenar por</span>
              <select
                value={filters.sort}
                onChange={(e) => update({ ...filters, sort: e.target.value as SortKey })}
                className="h-9 cursor-pointer appearance-none bg-transparent pr-1 font-semibold text-text outline-none"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-surface">
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {chips.length > 0 && (
            <div className="scrollbar-none -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0">
              {chips.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={c.clear}
                  className="flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-surface-3 pl-3 pr-2 text-xs font-semibold"
                  aria-label={`Remover filtro ${c.label}`}
                >
                  {c.label} <X className="h-3.5 w-3.5 text-subtle" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Resultados */}
        {results.length === 0 ? (
          <EmptyState
            className="mt-6"
            icon={<PackageSearch className="h-7 w-7" />}
            title={
              products.length === 0
                ? (emptyTitle ?? "Nenhum produto por aqui ainda")
                : query
                  ? `Nada encontrado para “${query}”`
                  : "Nenhum produto com esses filtros"
            }
            description={
              products.length === 0
                ? "Estamos abastecendo esta categoria. Fale com a gente: podemos ter o produto a caminho."
                : "Tente outra palavra, remova algum filtro ou peça ajuda a um vendedor."
            }
            action={
              <>
                {(activeCount > 0 || query) && (
                  <Button variant="secondary" onClick={reset}>
                    Limpar busca e filtros
                  </Button>
                )}
                <ButtonLink
                  variant="whatsapp"
                  href={whatsappLink(
                    whatsappNumber,
                    query
                      ? `Olá! Vim pelo catálogo da ${storeName}. Vocês têm "${query}"?`
                      : `Olá! Vim pelo catálogo da ${storeName} e estou procurando um produto.`,
                  )}
                >
                  <WhatsAppIcon className="h-5 w-5" /> Perguntar no WhatsApp
                </ButtonLink>
              </>
            }
          />
        ) : (
          <>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4 lg:mt-0">
              {results.slice(0, limit).map((p, i) => (
                <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}>
                  <ProductCard product={p} priority={i < 4} />
                </div>
              ))}
            </div>
            {results.length > limit && (
              <div className="mt-8 flex justify-center">
                <Button variant="outline" onClick={() => setLimit((l) => l + PAGE)}>
                  Carregar mais ({results.length - limit} restantes)
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Drawer de filtros (mobile) */}
      <Sheet
        open={drawer}
        onClose={() => setDrawer(false)}
        title="Filtros"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => update({ ...EMPTY_FILTERS, q: filters.q, sort: filters.sort })} disabled={activeCount === 0}>
              Limpar
            </Button>
            <Button block onClick={() => setDrawer(false)}>
              Ver {results.length} {results.length === 1 ? "produto" : "produtos"}
            </Button>
          </div>
        }
      >
        {panel}
      </Sheet>
    </div>
  );
}
