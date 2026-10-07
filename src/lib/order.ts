import type { CartItem, Product, ProductVariant } from "./types";
import { getPriceInfo, getTotalStock } from "./pricing";
import { variantLabel } from "./variants";

/** Converte produto (+ variação) em item do pedido, com preço e limite de estoque */
export function toCartItem(product: Product, variant?: ProductVariant): Omit<CartItem, "quantity"> {
  const stock = variant ? variant.stock : getTotalStock(product);
  return {
    key: variant ? `${product.id}::${variant.id}` : product.id,
    productId: product.id,
    slug: product.slug,
    name: product.name,
    image: variant?.image ?? product.images[0]?.url,
    variantId: variant?.id,
    variantLabel: variantLabel(variant, product),
    unitPrice: getPriceInfo(product, variant).current,
    maxQuantity: Math.max(1, stock),
  };
}

/** Versão enxuta do produto para listas (reduz o payload enviado ao navegador) */
export function toListProduct<T extends Product>(p: T): T {
  return { ...p, description: undefined, specs: [] };
}
