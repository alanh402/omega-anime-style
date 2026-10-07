import { test } from "node:test";
import assert from "node:assert/strict";
import { buildOrderMessage, whatsappLink } from "../src/lib/whatsapp";
import { applyFilters, EMPTY_FILTERS, filtersFromParams, filtersToQuery, searchProducts } from "../src/lib/search";
import { formatBRL, formatInstallments, getPriceInfo, getStartingPrice } from "../src/lib/pricing";
import { findVariant, optionState, selectOption } from "../src/lib/variants";
import { demoProducts } from "../src/data/demo/products";
import { demoBrands, demoCategories } from "../src/data/demo/categories";
import type { CartItem, ProductView } from "../src/lib/types";

const views: ProductView[] = demoProducts.map((p) => ({
  ...p,
  brand: demoBrands.find((b) => b.id === p.brandId),
  categories: p.categoryIds.map((id) => demoCategories.find((c) => c.id === id)!).filter(Boolean),
}));
const bySlug = (s: string) => views.find((p) => p.slug === s)!;

test("link do WhatsApp usa wa.me e codifica a mensagem", () => {
  const url = whatsappLink("+55 (99) 98553-1987", "Olá & tudo bem? 👇\nLinha 2");
  assert.ok(url.startsWith("https://wa.me/5599985531987?text="));
  assert.equal(new URL(url).searchParams.get("text"), "Olá & tudo bem? 👇\nLinha 2");
});

test("mensagem do pedido lista itens, variação, quantidade e total", () => {
  const items: CartItem[] = [
    { key: "a", productId: "a", slug: "iphone-15", name: "iPhone 15", variantLabel: "128 GB · Preto", unitPrice: 4699, quantity: 1, maxQuantity: 5 },
    { key: "b", productId: "b", slug: "fone", name: "Fone Bluetooth", unitPrice: 299, quantity: 2, maxQuantity: 5 },
  ];
  const msg = buildOrderMessage({
    items,
    settings: { storeName: "Omega Anime Style", orderMessage: { greeting: "Olá! Vim pelo catálogo da {loja}.", closing: "Fim." } },
    siteUrl: "https://loja.com/",
    customerName: "Ana",
  });
  assert.match(msg, /Vim pelo catálogo da Omega Anime Style\.\nMeu nome é Ana\./);
  assert.match(msg, /1\. \*iPhone 15\*\n {3}Opção: 128 GB · Preto\n {3}Quantidade: 1/);
  assert.match(msg, /R\$ 299,00 cada \(R\$ 598,00\)/);
  assert.match(msg, /https:\/\/loja\.com\/produto\/iphone-15/);
  assert.match(msg, /\*Total estimado: R\$ 5\.297,00\*/);
});

test("preço promocional e 'a partir de' com variações", () => {
  const iphone = bySlug("iphone-15");
  const start = getStartingPrice(iphone);
  assert.equal(start.current, 4699);
  assert.equal(start.original, 4999);
  assert.equal(start.hasRange, true);
  const v = findVariant(iphone, { Armazenamento: "512 GB", Cor: "Azul" })!;
  assert.deepEqual(getPriceInfo(iphone, v), { current: 6999 });
  assert.equal(formatBRL(1234.5), "R$ 1.234,50");
  assert.equal(formatInstallments(iphone, 1200), "ou 12x de R$ 100,00 sem juros");
});

test("variação esgotada é sinalizada e a troca de opção não cria combinação inválida", () => {
  const iphone = bySlug("iphone-15");
  assert.equal(optionState(iphone, { Armazenamento: "512 GB", Cor: "Preto" }, "Cor", "Rosa"), "out");
  const next = selectOption(iphone, { Armazenamento: "128 GB", Cor: "Preto" }, "Armazenamento", "512 GB");
  assert.ok(findVariant(iphone, next));
});

test("busca ignora acentos e entende sinônimos", () => {
  assert.ok(searchProducts(views, "pelicula").every((p) => p.categories.some((c) => c.slug === "peliculas")));
  assert.ok(searchProducts(views, "PS5").length >= 4);
  assert.ok(searchProducts(views, "celular").some((p) => p.slug === "iphone-15"));
  assert.ok(searchProducts(views, "fone").some((p) => p.slug === "airpods-4"));
  assert.equal(searchProducts(views, "geladeira").length, 0);
});

test("filtros combinados, esgotados no fim e ida/volta pela URL", () => {
  const f = { ...EMPTY_FILTERS, categories: ["games"], onSale: true, sort: "price_asc" as const };
  const res = applyFilters(views, f);
  assert.ok(res.length > 0);
  for (let i = 1; i < res.length; i++) assert.ok(getStartingPrice(res[i]).current >= getStartingPrice(res[i - 1]).current);
  const all = applyFilters(views, EMPTY_FILTERS);
  assert.equal(all.at(-1)!.slug, "nintendo-switch-oled");
  const qs = filtersToQuery({ ...f, q: "ps5", minPrice: 100 });
  assert.deepEqual(filtersFromParams(new URLSearchParams(qs.slice(1))), { ...f, q: "ps5", minPrice: 100, maxPrice: undefined });
});
