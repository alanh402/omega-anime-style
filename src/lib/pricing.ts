import type { Product, ProductVariant } from "./types";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatBRL(value: number): string {
  // Intl usa espaço não separável; normalizamos para mensagens de WhatsApp
  return brl.format(value).replace(/ /g, " ");
}

export interface PriceInfo {
  /** Preço cobrado (promocional, se houver) */
  current: number;
  /** Preço "de", presente apenas quando há promoção */
  original?: number;
  discountPercent?: number;
}

function resolve(price: number, promo?: number): PriceInfo {
  if (promo != null && promo > 0 && promo < price) {
    return {
      current: promo,
      original: price,
      discountPercent: Math.round((1 - promo / price) * 100),
    };
  }
  return { current: price };
}

export function getPriceInfo(product: Product, variant?: ProductVariant): PriceInfo {
  if (variant?.price != null) return resolve(variant.price, variant.promoPrice);
  return resolve(product.price, product.promoPrice);
}

/** Menor preço entre as variações — usado no card ("a partir de") */
export function getStartingPrice(product: Product): PriceInfo & { hasRange: boolean } {
  const base = getPriceInfo(product);
  if (!product.variants.length) return { ...base, hasRange: false };
  const infos = product.variants.map((v) => getPriceInfo(product, v));
  const min = infos.reduce((a, b) => (b.current < a.current ? b : a));
  const hasRange = infos.some((i) => i.current !== min.current);
  return { ...min, hasRange };
}

export function isOnSale(product: Product): boolean {
  if (getPriceInfo(product).original) return true;
  return product.variants.some((v) => getPriceInfo(product, v).original);
}

export function getTotalStock(product: Product): number {
  if (product.variants.length) return product.variants.reduce((s, v) => s + Math.max(0, v.stock), 0);
  return Math.max(0, product.stock);
}

export type StockStatus = "available" | "low" | "out";

export function getStockStatus(stock: number): StockStatus {
  if (stock <= 0) return "out";
  if (stock <= 3) return "low";
  return "available";
}

export function formatInstallments(product: Product, price: number): string | undefined {
  const inst = product.installments;
  if (!inst || inst.count < 2) return undefined;
  // Com juros o valor da parcela depende da operadora; não exibimos um número impreciso
  if (!inst.interestFree) return `em até ${inst.count}x no cartão`;
  return `ou ${inst.count}x de ${formatBRL(price / inst.count)} sem juros`;
}
