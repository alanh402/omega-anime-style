import type { ProductView } from "./types";
import { getStartingPrice, getTotalStock, isOnSale } from "./pricing";

/** Remove acentos e padroniza para comparação ("Película" → "pelicula") */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Sinônimos do vocabulário do cliente → termos do catálogo.
 * Mantido curto e editável; cada termo pesquisado é expandido antes da busca.
 */
const SYNONYMS: Record<string, string[]> = {
  celular: ["smartphone", "iphone", "xiaomi"],
  telefone: ["smartphone"],
  fone: ["fone", "headset", "airpods", "earbuds"],
  headphone: ["fone", "headset"],
  pelicula: ["pelicula", "protetor de tela"],
  capinha: ["capa"],
  case: ["capa"],
  playstation: ["ps5"],
  play: ["ps5"],
  videogame: ["games", "console"],
  console: ["console", "ps5"],
  notebook: ["notebook", "laptop"],
  computador: ["pc", "notebook", "computadores"],
  pc: ["pc", "computador"],
  gamer: ["gamer", "games", "setup"],
  carregador: ["carregador", "fonte"],
  camisa: ["camiseta"],
  blusa: ["moletom", "camiseta"],
  roupa: ["roupas", "camiseta", "moletom"],
  tablet: ["ipad", "tablet"],
  relogio: ["smartwatch"],
};

function haystack(p: ProductView): string {
  return normalize(
    [
      p.name,
      p.brand?.name,
      p.sku,
      ...p.tags,
      ...p.categories.map((c) => c.name),
      ...p.optionGroups.flatMap((g) => g.values),
    ]
      .filter(Boolean)
      .join(" "),
  );
}

/**
 * Busca tolerante: cada palavra digitada precisa casar (ela ou um sinônimo).
 * Retorna produtos ordenados por relevância (nome > marca > demais campos).
 */
export function searchProducts(products: ProductView[], query: string): ProductView[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return products;

  const scored: Array<{ p: ProductView; score: number }> = [];
  for (const p of products) {
    const hay = haystack(p);
    const name = normalize(p.name);
    let score = 0;
    let matchedAll = true;
    for (const term of terms) {
      const variants = [term, ...(SYNONYMS[term] ?? [])];
      const hit = variants.find((v) => hay.includes(v));
      if (!hit) {
        matchedAll = false;
        break;
      }
      score += name.includes(term) ? 10 : name.includes(hit) ? 6 : 2;
      if (name.startsWith(term)) score += 4;
    }
    if (matchedAll) scored.push({ p, score });
  }
  return scored.sort((a, b) => b.score - a.score).map((s) => s.p);
}

export type SortKey = "relevance" | "newest" | "price_asc" | "price_desc" | "discount" | "name";

export const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "relevance", label: "Mais relevantes" },
  { value: "newest", label: "Mais recentes" },
  { value: "price_asc", label: "Menor preço" },
  { value: "price_desc", label: "Maior preço" },
  { value: "discount", label: "Maior desconto" },
  { value: "name", label: "Nome (A–Z)" },
];

export interface CatalogFilters {
  q: string;
  categories: string[];
  brands: string[];
  minPrice?: number;
  maxPrice?: number;
  onSale: boolean;
  inStock: boolean;
  isNew: boolean;
  featured: boolean;
  sort: SortKey;
}

export const EMPTY_FILTERS: CatalogFilters = {
  q: "",
  categories: [],
  brands: [],
  onSale: false,
  inStock: false,
  isNew: false,
  featured: false,
  sort: "relevance",
};

export function countActiveFilters(f: CatalogFilters): number {
  return (
    f.categories.length +
    f.brands.length +
    (f.minPrice != null ? 1 : 0) +
    (f.maxPrice != null ? 1 : 0) +
    [f.onSale, f.inStock, f.isNew, f.featured].filter(Boolean).length
  );
}

export function applyFilters(products: ProductView[], f: CatalogFilters): ProductView[] {
  let list = f.q ? searchProducts(products, f.q) : products.slice();

  list = list.filter((p) => {
    const price = getStartingPrice(p).current;
    if (f.categories.length && !p.categories.some((c) => f.categories.includes(c.slug))) return false;
    if (f.brands.length && !(p.brand && f.brands.includes(p.brand.slug))) return false;
    if (f.minPrice != null && price < f.minPrice) return false;
    if (f.maxPrice != null && price > f.maxPrice) return false;
    if (f.onSale && !isOnSale(p)) return false;
    if (f.inStock && getTotalStock(p) <= 0) return false;
    if (f.isNew && !p.isNew) return false;
    if (f.featured && !p.isFeatured) return false;
    return true;
  });

  const price = (p: ProductView) => getStartingPrice(p).current;
  const discount = (p: ProductView) => getStartingPrice(p).discountPercent ?? 0;
  switch (f.sort) {
    case "newest":
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case "price_asc":
      list.sort((a, b) => price(a) - price(b));
      break;
    case "price_desc":
      list.sort((a, b) => price(b) - price(a));
      break;
    case "discount":
      list.sort((a, b) => discount(b) - discount(a));
      break;
    case "name":
      list.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
      break;
    default:
      // Sem busca: destaques primeiro e esgotados por último
      if (!f.q) list.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
  }
  // Esgotados sempre ao final, preservando a ordem anterior
  return [...list.filter((p) => getTotalStock(p) > 0), ...list.filter((p) => getTotalStock(p) <= 0)];
}

/* ---------- Serialização dos filtros na URL (links compartilháveis) ---------- */

export function filtersFromParams(params: URLSearchParams | Record<string, string | string[] | undefined>): CatalogFilters {
  const get = (k: string): string | undefined => {
    if (params instanceof URLSearchParams) return params.get(k) ?? undefined;
    const v = params[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const list = (k: string) => (get(k) ?? "").split(",").filter(Boolean);
  const num = (k: string) => {
    const v = get(k);
    if (v == null || v === "") return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  const sort = get("ordem") as SortKey | undefined;
  return {
    q: get("q") ?? "",
    categories: list("categoria"),
    brands: list("marca"),
    minPrice: num("min"),
    maxPrice: num("max"),
    onSale: get("oferta") === "1",
    inStock: get("disponivel") === "1",
    isNew: get("novo") === "1",
    featured: get("destaque") === "1",
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? sort! : "relevance",
  };
}

export function filtersToQuery(f: CatalogFilters): string {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.categories.length) p.set("categoria", f.categories.join(","));
  if (f.brands.length) p.set("marca", f.brands.join(","));
  if (f.minPrice != null) p.set("min", String(f.minPrice));
  if (f.maxPrice != null) p.set("max", String(f.maxPrice));
  if (f.onSale) p.set("oferta", "1");
  if (f.inStock) p.set("disponivel", "1");
  if (f.isNew) p.set("novo", "1");
  if (f.featured) p.set("destaque", "1");
  if (f.sort !== "relevance") p.set("ordem", f.sort);
  const s = p.toString();
  return s ? `?${s}` : "";
}
