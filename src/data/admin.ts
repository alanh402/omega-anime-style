import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Brand, Category, Lead, Product, StoreSettings } from "@/lib/types";
import { PRODUCT_SELECT, mapBrand, mapCategory, mapProduct, type BrandRow, type CategoryRow, type ProductRow } from "./supabase/mappers";
import { isOnSale } from "@/lib/pricing";

/** Consultas do painel: incluem itens inativos (permitido só para admins pelo RLS) */

export async function loadAdminCatalog(sb: SupabaseClient): Promise<{ products: Product[]; categories: Category[]; brands: Brand[] }> {
  const [p, c, b] = await Promise.all([
    sb.from("products").select(PRODUCT_SELECT).order("created_at", { ascending: false }),
    sb.from("categories").select("*").order("sort_order"),
    sb.from("brands").select("*").order("name"),
  ]);
  const err = p.error ?? c.error ?? b.error;
  if (err) throw new Error(err.message);
  return {
    products: (p.data as ProductRow[]).map(mapProduct),
    categories: (c.data as CategoryRow[]).map(mapCategory),
    brands: (b.data as BrandRow[]).map(mapBrand),
  };
}

export async function loadAdminSettings(sb: SupabaseClient): Promise<Partial<StoreSettings>> {
  const { data } = await sb.from("settings").select("data").eq("id", 1).maybeSingle();
  return (data?.data ?? {}) as Partial<StoreSettings>;
}

export async function loadLeads(sb: SupabaseClient, limit = 100): Promise<Lead[]> {
  const { data, error } = await sb.from("leads").select("*").order("created_at", { ascending: false }).limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    id: r.id,
    createdAt: r.created_at,
    customerName: r.customer_name ?? undefined,
    note: r.note ?? undefined,
    items: r.items,
    total: Number(r.total),
    status: r.status,
  }));
}

export interface DashboardData {
  totals: { products: number; active: number; onSale: number; outOfStock: number };
  last30: { views: number; whatsapp: number; orders: number; adds: number; shares: number; leads: number };
  topViewed: Array<{ product: Product; value: number }>;
  topAdded: Array<{ product: Product; value: number }>;
  topWhatsapp: Array<{ product: Product; value: number }>;
  topSearches: Array<{ term: string; value: number }>;
  topCategories: Array<{ slug: string; value: number }>;
}

export async function loadDashboard(sb: SupabaseClient, products: Product[]): Promise<DashboardData> {
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const count = (type: string) =>
    sb.from("events").select("id", { count: "exact", head: true }).eq("type", type).gte("created_at", since);

  const [views, whatsapp, orders, adds, shares, leads, stats, searches, cats] = await Promise.all([
    count("product_view"),
    count("whatsapp_click"),
    count("order_sent"),
    count("add_to_order"),
    count("share"),
    sb.from("leads").select("id", { count: "exact", head: true }).gte("created_at", since),
    sb.from("product_event_stats").select("*"),
    sb.from("events").select("query").eq("type", "search").gte("created_at", since).order("created_at", { ascending: false }).limit(2000),
    sb.from("events").select("category_slug").eq("type", "category_view").gte("created_at", since).limit(5000),
  ]);

  const byId = new Map(products.map((p) => [p.id, p]));
  type StatRow = { product_id: string; views: number; adds: number; whatsapp_clicks: number };
  const statRows = (stats.data ?? []) as StatRow[];
  const top = (key: keyof Omit<StatRow, "product_id">) =>
    statRows
      .filter((r) => byId.has(r.product_id) && Number(r[key]) > 0)
      .sort((a, b) => Number(b[key]) - Number(a[key]))
      .slice(0, 5)
      .map((r) => ({ product: byId.get(r.product_id)!, value: Number(r[key]) }));

  const tally = (values: Array<string | null | undefined>) => {
    const m = new Map<string, number>();
    for (const v of values) {
      const k = v?.trim().toLowerCase();
      if (k) m.set(k, (m.get(k) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  };

  return {
    totals: {
      products: products.length,
      active: products.filter((p) => p.active).length,
      onSale: products.filter((p) => p.active && isOnSale(p)).length,
      outOfStock: products.filter((p) => p.active && (p.variants.length ? p.variants.every((v) => v.stock <= 0) : p.stock <= 0)).length,
    },
    last30: {
      views: views.count ?? 0,
      whatsapp: whatsapp.count ?? 0,
      orders: orders.count ?? 0,
      adds: adds.count ?? 0,
      shares: shares.count ?? 0,
      leads: leads.count ?? 0,
    },
    topViewed: top("views"),
    topAdded: top("adds"),
    topWhatsapp: top("whatsapp_clicks"),
    topSearches: tally((searches.data ?? []).map((r) => r.query)).map(([term, value]) => ({ term, value })),
    topCategories: tally((cats.data ?? []).map((r) => r.category_slug)).map(([slug, value]) => ({ slug, value })),
  };
}
