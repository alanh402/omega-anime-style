import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCatalog, getCollection } from "@/data/catalog";
import { filtersFromParams } from "@/lib/search";
import { toListProduct } from "@/lib/order";
import { CatalogView } from "@/components/catalog/CatalogView";
import { PageHeader } from "@/components/layout/PageHeader";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCollection(slug);
  if (!data) return { title: "Coleção não encontrada" };
  return {
    title: data.collection.title,
    description: data.collection.subtitle,
    alternates: { canonical: `/colecao/${slug}` },
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, sp, { categories, brands }] = await Promise.all([params, searchParams, getCatalog()]);
  const data = await getCollection(slug);
  if (!data) notFound();
  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-6">
      <PageHeader
        title={data.collection.title}
        description={data.collection.subtitle}
        crumbs={[{ label: "Início", href: "/" }, { label: "Coleções" }, { label: data.collection.title }]}
      />
      <CatalogView products={data.products.map(toListProduct)} categories={categories} brands={brands} initialFilters={filtersFromParams(sp)} />
    </div>
  );
}
