import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { CATALOG_REVALIDATE_SECONDS, isSupabaseEnabled } from "@/config/site";
import { defaultSettings } from "@/config/default-settings";
import type { Brand, Category, Collection, Product, ProductView, StoreSettings } from "@/lib/types";
import { getTotalStock, isOnSale } from "@/lib/pricing";
import type { CatalogRepository } from "./repository";
import { demoRepository } from "./demo/demo-repository";
import { supabaseRepository } from "./supabase/supabase-repository";

/**
 * Serviço de catálogo: única porta de entrada de dados para as páginas.
 * Escolhe a fonte (demo ou Supabase) e resolve marcas/categorias dos produtos.
 */
export function getRepository(): CatalogRepository {
  return isSupabaseEnabled ? supabaseRepository : demoRepository;
}

/** Tag usada pelo admin para invalidar o cache após salvar */
export const CATALOG_CACHE_TAG = "catalog";

const loadRemoteSettings = unstable_cache(() => getRepository().getSettings(), ["settings"], {
  revalidate: CATALOG_REVALIDATE_SECONDS,
  tags: [CATALOG_CACHE_TAG],
});

const loadRaw = unstable_cache(
  async () => {
    const repo = getRepository();
    const [products, categories, brands] = await Promise.all([repo.listProducts(), repo.listCategories(), repo.listBrands()]);
    return { products, categories, brands, source: repo.source };
  },
  ["catalog-raw"],
  { revalidate: CATALOG_REVALIDATE_SECONDS, tags: [CATALOG_CACHE_TAG] },
);

export const getSettings = cache(async (): Promise<StoreSettings> => {
  const remote = await loadRemoteSettings();
  return {
    ...defaultSettings,
    ...remote,
    whatsappNumber: remote.whatsappNumber || defaultSettings.whatsappNumber,
    hero: { ...defaultSettings.hero, ...remote.hero },
    orderMessage: { ...defaultSettings.orderMessage, ...remote.orderMessage },
    collections: remote.collections?.length ? remote.collections : defaultSettings.collections,
  };
});

export interface Catalog {
  products: ProductView[];
  categories: Category[];
  brands: Brand[];
  source: "demo" | "supabase";
}

export const getCatalog = cache(async (): Promise<Catalog> => {
  const { products, categories, brands, source } = await loadRaw();
  const catById = new Map(categories.map((c) => [c.id, c]));
  const brandById = new Map(brands.map((b) => [b.id, b]));
  const views: ProductView[] = products.map((p: Product) => ({
    ...p,
    brand: p.brandId ? brandById.get(p.brandId) : undefined,
    categories: p.categoryIds.map((id) => catById.get(id)).filter((c): c is Category => Boolean(c)),
  }));
  return { products: views, categories, brands, source };
});

/* ----------------------------- Consultas prontas ----------------------------- */

const inStockFirst = (list: ProductView[]) => [
  ...list.filter((p) => getTotalStock(p) > 0),
  ...list.filter((p) => getTotalStock(p) <= 0),
];

export async function getHomeSections() {
  const { products, categories } = await getCatalog();
  const featured = inStockFirst(products.filter((p) => p.isFeatured)).slice(0, 8);
  // Novidades: marcados como "novo" primeiro, completando com os mais recentes
  const byDate = [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const newest = inStockFirst([...byDate.filter((p) => p.isNew), ...byDate.filter((p) => !p.isNew)]).slice(0, 8);
  const offers = products
    .filter((p) => isOnSale(p) && getTotalStock(p) > 0)
    .slice(0, 8);
  const categoryCounts = new Map<string, number>();
  for (const p of products) for (const c of p.categories) categoryCounts.set(c.id, (categoryCounts.get(c.id) ?? 0) + 1);
  return { featured, newest, offers, categories, categoryCounts };
}

export async function getProductBySlug(slug: string): Promise<ProductView | undefined> {
  const { products } = await getCatalog();
  return products.find((p) => p.slug === slug);
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const { categories } = await getCatalog();
  return categories.find((c) => c.slug === slug);
}

export async function getKitProducts(product: ProductView): Promise<ProductView[]> {
  const { products } = await getCatalog();
  const byId = new Map(products.map((p) => [p.id, p]));
  return product.kitProductIds
    .map((id) => byId.get(id))
    .filter((p): p is ProductView => Boolean(p) && getTotalStock(p!) > 0);
}

/** "Você também pode gostar": mesma categoria principal, depois mesma marca */
export async function getRelatedProducts(product: ProductView, exclude: string[] = [], limit = 8): Promise<ProductView[]> {
  const { products } = await getCatalog();
  const skip = new Set([product.id, ...exclude]);
  const mainCat = product.categoryIds[0];
  const score = (p: ProductView) =>
    (p.categoryIds.includes(mainCat) ? 3 : 0) +
    p.categoryIds.filter((c) => product.categoryIds.includes(c)).length +
    (p.brandId && p.brandId === product.brandId ? 1 : 0);
  return products
    .filter((p) => !skip.has(p.id) && getTotalStock(p) > 0)
    .map((p) => ({ p, s: score(p) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.p);
}

export async function getCollection(slug: string): Promise<{ collection: Collection; products: ProductView[] } | undefined> {
  const [settings, { products }] = await Promise.all([getSettings(), getCatalog()]);
  const collection = settings.collections.find((c) => c.slug === slug);
  if (!collection) return undefined;
  return { collection, products: inStockFirst(products.filter((p) => p.tags.includes(collection.tag))) };
}
