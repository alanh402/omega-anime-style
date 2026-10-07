import type { Product, ProductVariant } from "./types";

export type Selection = Record<string, string>;

export function variantLabel(variant: ProductVariant | undefined, product: Product): string | undefined {
  if (!variant) return undefined;
  return product.optionGroups
    .map((g) => variant.options[g.name])
    .filter(Boolean)
    .join(" · ");
}

export function findVariant(product: Product, selection: Selection): ProductVariant | undefined {
  if (!product.variants.length) return undefined;
  const complete = product.optionGroups.every((g) => selection[g.name]);
  if (!complete) return undefined;
  return product.variants.find((v) =>
    product.optionGroups.every((g) => v.options[g.name] === selection[g.name]),
  );
}

/** Seleção inicial: primeira variação com estoque (ou a primeira de todas) */
export function initialSelection(product: Product): Selection {
  const v = product.variants.find((x) => x.stock > 0) ?? product.variants[0];
  return v ? { ...v.options } : {};
}

/**
 * Indica se um valor de opção ainda leva a alguma variação existente/com estoque,
 * mantendo as demais escolhas. Usado para esmaecer opções indisponíveis.
 */
export function optionState(
  product: Product,
  selection: Selection,
  group: string,
  value: string,
): "available" | "out" | "missing" {
  const candidates = product.variants.filter((v) => {
    if (v.options[group] !== value) return false;
    return product.optionGroups.every(
      (g) => g.name === group || !selection[g.name] || v.options[g.name] === selection[g.name],
    );
  });
  if (!candidates.length) return "missing";
  return candidates.some((v) => v.stock > 0) ? "available" : "out";
}

/**
 * Ao trocar uma opção, mantém o que for compatível e completa o restante
 * com a primeira variação válida — evita o cliente ficar "preso" numa combinação inexistente.
 */
export function selectOption(product: Product, selection: Selection, group: string, value: string): Selection {
  const next = { ...selection, [group]: value };
  if (findVariant(product, next)) return next;
  const fallback =
    product.variants.find((v) => v.options[group] === value && v.stock > 0) ??
    product.variants.find((v) => v.options[group] === value);
  return fallback ? { ...fallback.options } : next;
}
