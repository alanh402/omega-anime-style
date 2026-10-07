/**
 * Modelos de domínio do catálogo.
 * Espelham as tabelas do Supabase (ver supabase/migrations) já convertidas
 * para camelCase. Telas e componentes dependem apenas destes tipos.
 */

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  /** Ícone (nome do ícone lucide) usado quando não há imagem */
  icon?: string;
  image?: string;
  sortOrder: number;
  active: boolean;
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  logo?: string;
  active: boolean;
}

export interface ProductImage {
  url: string;
  alt?: string;
}

/** Grupo de opções de variação, ex.: { name: "Armazenamento", values: ["128 GB", "256 GB"] } */
export interface OptionGroup {
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  sku?: string;
  /** Combinação de valores, ex.: { Armazenamento: "128 GB", Cor: "Azul" } */
  options: Record<string, string>;
  /** Sobrescreve o preço do produto quando definido */
  price?: number;
  promoPrice?: number;
  stock: number;
  /** Foto exibida quando esta variação é escolhida (ex.: a cor) */
  image?: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  sku?: string;
  name: string;
  shortDescription?: string;
  description?: string;
  brandId?: string;
  /** Primeira categoria é a principal (breadcrumb, OG) */
  categoryIds: string[];
  tags: string[];
  price: number;
  promoPrice?: number;
  /** Parcelamento opcional, ex.: 12x sem juros */
  installments?: { count: number; interestFree: boolean };
  stock: number;
  images: ProductImage[];
  specs: ProductSpec[];
  optionGroups: OptionGroup[];
  variants: ProductVariant[];
  isFeatured: boolean;
  isNew: boolean;
  active: boolean;
  /** Produtos sugeridos para "Monte seu kit" */
  kitProductIds: string[];
  createdAt: string;
}

/** Produto já com marca e categorias resolvidas, pronto para a UI */
export interface ProductView extends Product {
  brand?: Brand;
  categories: Category[];
}

export interface Collection {
  slug: string;
  title: string;
  subtitle: string;
  /** Produtos com esta tag compõem a coleção */
  tag: string;
  image?: string;
  /** Destino opcional (ex.: categoria). Se ausente, usa /colecao/[slug] */
  href?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  /** Somente dígitos, com DDI e DDD. Ex.: 5599985531987 */
  whatsappNumber: string;
  instagram?: string;
  address?: string;
  openingHours?: string;
  logoUrl: string;
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
  };
  orderMessage: {
    greeting: string;
    closing: string;
  };
  shareMessage: string;
  collections: Collection[];
}

export interface CartItem {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image?: string;
  variantId?: string;
  variantLabel?: string;
  unitPrice: number;
  quantity: number;
  maxQuantity: number;
}

export type AnalyticsEventType =
  | "product_view"
  | "whatsapp_click"
  | "order_sent"
  | "add_to_order"
  | "remove_from_order"
  | "share"
  | "category_view"
  | "search";

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  productId?: string;
  categorySlug?: string;
  query?: string;
  meta?: Record<string, unknown>;
}

export interface Lead {
  id: string;
  createdAt: string;
  customerName?: string;
  note?: string;
  items: Array<{ productId: string; name: string; variant?: string; quantity: number; unitPrice: number }>;
  total: number;
  status: "novo" | "em_atendimento" | "vendido" | "perdido";
}
