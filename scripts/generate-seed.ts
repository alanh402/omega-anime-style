/**
 * Gera os arquivos SQL de carga inicial a partir dos dados deste projeto:
 *   supabase/seed.sql               → categorias, marcas e configurações (estrutura real da loja)
 *   supabase/seed-demo-products.sql → produtos de DEMONSTRAÇÃO (opcional; apague depois)
 * Uso: npm run db:seed-sql
 */
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { demoBrands, demoCategories } from "../src/data/demo/categories";
import { demoProducts } from "../src/data/demo/products";
import { defaultSettings } from "../src/config/default-settings";

/** UUID determinístico a partir de um texto (reexecutar o seed não duplica dados) */
function uuid(seed: string): string {
  const h = createHash("md5").update(`omega:${seed}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}
const q = (v: unknown): string => {
  if (v == null) return "null";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "true" : "false";
  return `'${String(v).replace(/'/g, "''")}'`;
};
const json = (v: unknown) => `${q(JSON.stringify(v))}::jsonb`;
const arr = (v: string[]) => `array[${v.map(q).join(", ")}]::text[]`;

const catId = new Map(demoCategories.map((c) => [c.id, uuid(`cat:${c.slug}`)]));
const brandId = new Map(demoBrands.map((b) => [b.id, uuid(`brand:${b.slug}`)]));
const prodId = new Map(demoProducts.map((p) => [p.id, uuid(`prod:${p.slug}`)]));

const base: string[] = [
  "-- Gerado por scripts/generate-seed.ts — categorias, marcas e configurações iniciais",
  "begin;",
  ...demoCategories.map(
    (c) =>
      `insert into categories (id, slug, name, description, icon, sort_order, active) values (${q(catId.get(c.id))}, ${q(c.slug)}, ${q(c.name)}, ${q(c.description)}, ${q(c.icon)}, ${c.sortOrder}, true) on conflict (slug) do nothing;`,
  ),
  ...demoBrands.map((b) => `insert into brands (id, slug, name, active) values (${q(brandId.get(b.id))}, ${q(b.slug)}, ${q(b.name)}, true) on conflict (slug) do nothing;`),
  `insert into settings (id, data) values (1, ${json({ ...defaultSettings, instagram: undefined, address: undefined, openingHours: undefined })}) on conflict (id) do nothing;`,
  "commit;",
  "",
];
writeFileSync(join(process.cwd(), "supabase", "seed.sql"), base.join("\n"));

const demo: string[] = [
  "-- PRODUTOS DE DEMONSTRAÇÃO (preços e imagens ilustrativos). Rode depois de seed.sql.",
  "-- Para remover todos depois: delete from products where 'demo' = any(tags);",
  "begin;",
];
for (const p of demoProducts) {
  const id = prodId.get(p.id)!;
  demo.push(
    `insert into products (id, slug, sku, name, short_description, description, brand_id, price, promo_price, installments_count, installments_interest_free, stock, specs, option_groups, tags, is_featured, is_new, active, created_at) values (${[
      q(id),
      q(p.slug),
      q(p.sku),
      q(p.name),
      q(p.shortDescription),
      q(p.description),
      q(p.brandId ? brandId.get(p.brandId) : null),
      p.price,
      q(p.promoPrice ?? null),
      q(p.installments?.count ?? null),
      q(p.installments?.interestFree ?? true),
      p.stock,
      json(p.specs),
      json(p.optionGroups),
      arr([...p.tags, "demo"]),
      q(p.isFeatured),
      q(p.isNew),
      "true",
      q(p.createdAt),
    ].join(", ")}) on conflict (slug) do nothing;`,
  );
  p.categoryIds.forEach((c, i) =>
    demo.push(`insert into product_categories (product_id, category_id, position) values (${q(id)}, ${q(catId.get(c))}, ${i}) on conflict do nothing;`),
  );
  p.images.forEach((img, i) => demo.push(`insert into product_images (product_id, url, alt, position) values (${q(id)}, ${q(img.url)}, ${q(img.alt)}, ${i});`));
  p.variants.forEach((v, i) =>
    demo.push(
      `insert into product_variants (product_id, sku, options, price, promo_price, stock, image_url, position) values (${q(id)}, ${q(v.sku)}, ${json(v.options)}, ${q(v.price ?? null)}, ${q(v.promoPrice ?? null)}, ${v.stock}, ${q(v.image)}, ${i});`,
    ),
  );
}
for (const p of demoProducts)
  p.kitProductIds.forEach((k, i) =>
    demo.push(`insert into product_relations (product_id, related_id, position) values (${q(prodId.get(p.id))}, ${q(prodId.get(k))}, ${i}) on conflict do nothing;`),
  );
demo.push("commit;", "");
writeFileSync(join(process.cwd(), "supabase", "seed-demo-products.sql"), demo.join("\n"));
console.log(`✓ seed.sql (${demoCategories.length} categorias, ${demoBrands.length} marcas) e seed-demo-products.sql (${demoProducts.length} produtos)`);
