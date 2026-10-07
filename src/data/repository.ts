import type { Brand, Category, Product, StoreSettings } from "@/lib/types";

/**
 * Contrato de acesso aos dados do catálogo.
 * Há duas implementações: demonstração (arquivos locais) e Supabase.
 * As telas nunca falam direto com uma fonte de dados — sempre via catalog.ts.
 */
export interface CatalogRepository {
  readonly source: "demo" | "supabase";
  getSettings(): Promise<Partial<StoreSettings>>;
  listCategories(): Promise<Category[]>;
  listBrands(): Promise<Brand[]>;
  /** Apenas produtos ativos */
  listProducts(): Promise<Product[]>;
}
