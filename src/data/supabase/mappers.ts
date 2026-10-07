import type { Brand, Category, OptionGroup, Product, ProductSpec } from "@/lib/types";

/* Linhas como vêm do Postgres (snake_case). numeric chega como string. */

export interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  sort_order: number;
  active: boolean;
}

export interface BrandRow {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  active: boolean;
}

export interface ProductRow {
  id: string;
  slug: string;
  sku: string | null;
  name: string;
  short_description: string | null;
  description: string | null;
  brand_id: string | null;
  price: string | number;
  promo_price: string | number | null;
  installments_count: number | null;
  installments_interest_free: boolean;
  stock: number;
  specs: ProductSpec[] | null;
  option_groups: OptionGroup[] | null;
  tags: string[] | null;
  is_featured: boolean;
  is_new: boolean;
  active: boolean;
  created_at: string;
  product_images?: Array<{ url: string; alt: string | null; position: number }>;
  product_variants?: Array<{
    id: string;
    sku: string | null;
    options: Record<string, string>;
    price: string | number | null;
    promo_price: string | number | null;
    stock: number;
    image_url: string | null;
    position: number;
  }>;
  product_categories?: Array<{ category_id: string; position: number }>;
  product_relations?: Array<{ related_id: string; position: number }>;
}

export const PRODUCT_SELECT =
  "*, product_images(url, alt, position), product_variants(id, sku, options, price, promo_price, stock, image_url, position), product_categories(category_id, position), product_relations!product_relations_product_id_fkey(related_id, position)";

const num = (v: string | number | null | undefined) => (v == null ? undefined : Number(v));
const byPos = <T extends { position: number }>(a: T, b: T) => a.position - b.position;

export function mapCategory(r: CategoryRow): Category {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description ?? undefined,
    icon: r.icon ?? undefined,
    image: r.image_url ?? undefined,
    sortOrder: r.sort_order,
    active: r.active,
  };
}

export function mapBrand(r: BrandRow): Brand {
  return { id: r.id, slug: r.slug, name: r.name, logo: r.logo_url ?? undefined, active: r.active };
}

export function mapProduct(r: ProductRow): Product {
  return {
    id: r.id,
    slug: r.slug,
    sku: r.sku ?? undefined,
    name: r.name,
    shortDescription: r.short_description ?? undefined,
    description: r.description ?? undefined,
    brandId: r.brand_id ?? undefined,
    categoryIds: (r.product_categories ?? []).sort(byPos).map((c) => c.category_id),
    tags: r.tags ?? [],
    price: Number(r.price),
    promoPrice: num(r.promo_price),
    installments: r.installments_count
      ? { count: r.installments_count, interestFree: r.installments_interest_free }
      : undefined,
    stock: r.stock,
    images: (r.product_images ?? []).sort(byPos).map((i) => ({ url: i.url, alt: i.alt ?? undefined })),
    specs: r.specs ?? [],
    optionGroups: r.option_groups ?? [],
    variants: (r.product_variants ?? []).sort(byPos).map((v) => ({
      id: v.id,
      sku: v.sku ?? undefined,
      options: v.options,
      price: num(v.price),
      promoPrice: num(v.promo_price),
      stock: v.stock,
      image: v.image_url ?? undefined,
    })),
    isFeatured: r.is_featured,
    isNew: r.is_new,
    active: r.active,
    kitProductIds: (r.product_relations ?? []).sort(byPos).map((x) => x.related_id),
    createdAt: r.created_at,
  };
}
