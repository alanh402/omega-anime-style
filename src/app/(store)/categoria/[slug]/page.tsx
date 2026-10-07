import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCatalog, getCategoryBySlug } from "@/data/catalog";
import { filtersFromParams } from "@/lib/search";
import { toListProduct } from "@/lib/order";
import { CatalogView } from "@/components/catalog/CatalogView";
import { PageHeader } from "@/components/layout/PageHeader";
import { TrackView } from "@/components/analytics/TrackView";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Categoria não encontrada" };
  return {
    title: category.name,
    description: category.description ?? `${category.name} na Omega Anime Style. Monte seu pedido e finalize pelo WhatsApp.`,
    alternates: { canonical: `/categoria/${slug}` },
    openGraph: { title: `${category.name} | Omega Anime Style`, description: category.description, url: `/categoria/${slug}` },
  };
}

export async function generateStaticParams() {
  const { categories } = await getCatalog().catch(() => ({ categories: [] as Array<{ slug: string }> }));
  return categories.map((c) => ({ slug: c.slug }));
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, sp, { products, categories, brands }] = await Promise.all([params, searchParams, getCatalog()]);
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const inCategory = products.filter((p) => p.categoryIds.includes(category.id)).map(toListProduct);
  const filters = { ...filtersFromParams(sp), categories: [] };

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-6">
      <TrackView event={{ type: "category_view", categorySlug: slug }} />
      <PageHeader
        title={category.name}
        description={category.description}
        crumbs={[{ label: "Início", href: "/" }, { label: "Catálogo", href: "/catalogo" }, { label: category.name }]}
      />
      <CatalogView
        products={inCategory}
        categories={categories}
        brands={brands}
        initialFilters={filters}
        lockedCategory={slug}
        emptyTitle={`Ainda não há produtos em ${category.name}`}
      />
    </div>
  );
}
