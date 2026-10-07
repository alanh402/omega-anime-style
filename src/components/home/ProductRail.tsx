import type { ProductView } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionHeader } from "./SectionHeader";

/**
 * Vitrine de produtos: rolagem horizontal com "snap" no celular
 * (mostra que há mais itens) e grade no desktop.
 */
export function ProductRail({
  index,
  title,
  subtitle,
  href,
  products,
}: {
  index?: string;
  title: string;
  subtitle?: string;
  href?: string;
  products: ProductView[];
}) {
  if (!products.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 pt-12 lg:px-6">
      <SectionHeader index={index} title={title} subtitle={subtitle} href={href} />
      <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-4">
        {products.map((p) => (
          <div key={p.id} className="w-[46%] shrink-0 snap-start xs:w-[44%] sm:w-auto">
            <ProductCard product={p} compact />
          </div>
        ))}
      </div>
    </section>
  );
}
