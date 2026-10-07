import type { CatalogRepository } from "../repository";
import type { StoreSettings } from "@/lib/types";
import { getPublicSupabase } from "./public-client";
import {
  PRODUCT_SELECT,
  mapBrand,
  mapCategory,
  mapProduct,
  type BrandRow,
  type CategoryRow,
  type ProductRow,
} from "./mappers";

function fail(what: string, error: { message: string }): never {
  throw new Error(`Supabase: falha ao carregar ${what} — ${error.message}`);
}

export const supabaseRepository: CatalogRepository = {
  source: "supabase",

  async getSettings() {
    const { data, error } = await getPublicSupabase().from("settings").select("data").eq("id", 1).maybeSingle();
    if (error) fail("configurações", error);
    return (data?.data ?? {}) as Partial<StoreSettings>;
  },

  async listCategories() {
    const { data, error } = await getPublicSupabase()
      .from("categories")
      .select("*")
      .eq("active", true)
      .order("sort_order");
    if (error) fail("categorias", error);
    return (data as CategoryRow[]).map(mapCategory);
  },

  async listBrands() {
    const { data, error } = await getPublicSupabase().from("brands").select("*").eq("active", true).order("name");
    if (error) fail("marcas", error);
    return (data as BrandRow[]).map(mapBrand);
  },

  async listProducts() {
    const { data, error } = await getPublicSupabase()
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(2000);
    if (error) fail("produtos", error);
    return (data as ProductRow[]).map(mapProduct);
  },
};
