import type { Metadata } from "next";
import { getCatalog } from "@/data/catalog";
import { filtersFromParams } from "@/lib/search";
import { toListProduct } from "@/lib/order";
import { CatalogView } from "@/components/catalog/CatalogView";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Catálogo completo",
  description: "Todos os produtos da Omega Anime Style: smartphones, games, computadores, acessórios e roupas.",
  alternates: { canonical: "/catalogo" },
};

export default async function CatalogPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [params, { products, categories, brands }] = await Promise.all([searchParams, getCatalog()]);
  const filters = filtersFromParams(params);
  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-6">
      <PageHeader
        title={filters.q ? `Resultados para “${filters.q}”` : "Catálogo"}
        crumbs={[{ label: "Início", href: "/" }, { label: "Catálogo" }]}
      />
      <CatalogView products={products.map(toListProduct)} categories={categories} brands={brands} initialFilters={filters} />
    </div>
  );
}
