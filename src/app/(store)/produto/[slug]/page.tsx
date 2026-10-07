import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCatalog, getKitProducts, getProductBySlug, getRelatedProducts, getSettings } from "@/data/catalog";
import { getSiteUrl } from "@/config/site";
import { formatBRL, getStartingPrice, getTotalStock, isOnSale } from "@/lib/pricing";
import { toListProduct } from "@/lib/order";
import { Breadcrumbs } from "@/components/layout/PageHeader";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { ProductDetailProvider } from "@/components/product/ProductDetailContext";
import { KitBuilder } from "@/components/product/KitBuilder";
import { ProductRail } from "@/components/home/ProductRail";
import { Badge } from "@/components/ui/Badge";
import { TrackView } from "@/components/analytics/TrackView";

// Deve ser literal (Next.js); mantenha igual a CATALOG_REVALIDATE_SECONDS
export const revalidate = 60;

type Params = { slug: string };

export async function generateStaticParams() {
  const { products } = await getCatalog();
  return products.map((p) => ({ slug: p.slug }));
}

/** Título, descrição e Open Graph por produto — gera a prévia ao colar o link no WhatsApp */
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSettings()]);
  if (!product) return { title: "Produto não encontrado" };
  const price = getStartingPrice(product);
  const priceText = `${price.hasRange ? "A partir de " : ""}${formatBRL(price.current)}`;
  const description = [product.shortDescription ?? product.description?.slice(0, 140), priceText].filter(Boolean).join(" · ");
  const title = product.name;
  return {
    title,
    description,
    alternates: { canonical: `/produto/${slug}` },
    openGraph: {
      type: "website",
      title: `${title} | ${settings.storeName}`,
      description,
      url: `/produto/${slug}`,
      siteName: settings.storeName,
      // imagem gerada em opengraph-image.tsx
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const kit = await getKitProducts(product);
  const related = await getRelatedProducts(product, product.kitProductIds);
  const mainCategory = product.categories[0];
  const sale = isOnSale(product);
  const out = getTotalStock(product) <= 0;
  const price = getStartingPrice(product);

  const badges = (
    <>
      {out && <Badge tone="danger">Esgotado</Badge>}
      {!out && sale && <Badge tone="offer">Oferta{price.discountPercent ? ` -${price.discountPercent}%` : ""}</Badge>}
      {product.isNew && <Badge tone="new">Novo</Badge>}
      {product.isFeatured && <Badge tone="featured">Destaque</Badge>}
    </>
  );

  // Dados estruturados (Google Shopping / rich results)
  const siteUrl = getSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.shortDescription ?? product.description,
    brand: product.brand ? { "@type": "Brand", name: product.brand.name } : undefined,
    image: product.images.map((i) => (i.url.startsWith("http") ? i.url : `${siteUrl}${i.url}`)),
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: price.current.toFixed(2),
      availability: out ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url: `${siteUrl}/produto/${product.slug}`,
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-6 lg:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <TrackView event={{ type: "product_view", productId: product.id }} />

      <div className="py-4">
        <Breadcrumbs
          items={[
            { label: "Início", href: "/" },
            ...(mainCategory ? [{ label: mainCategory.name, href: `/categoria/${mainCategory.slug}` }] : []),
            { label: product.name },
          ]}
        />
      </div>

      <ProductDetailProvider>
      <div className="grid gap-6 md:grid-cols-2 md:gap-10 lg:gap-14">
        <div className="min-w-0 md:sticky md:top-24 md:self-start">
          <ProductGallery images={product.images} name={product.name} badges={badges} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-subtle">
            {product.brand && <span className="text-gold">{product.brand.name}</span>}
            {product.brand && mainCategory && " · "}
            {mainCategory && (
              <Link href={`/categoria/${mainCategory.slug}`} className="hover:text-text">
                {mainCategory.name}
              </Link>
            )}
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">{product.name}</h1>
          {product.shortDescription && <p className="mt-3 text-[15px] leading-relaxed text-muted">{product.shortDescription}</p>}
          {product.sku && <p className="mt-2 text-xs text-subtle">Cód. {product.sku}</p>}

          <div className="mt-6">
            <ProductPurchasePanel product={product} />
          </div>
        </div>
      </div>
      </ProductDetailProvider>

      {kit.length > 0 && <KitBuilder main={product} items={kit.map(toListProduct)} />}

      {(product.description || product.specs.length > 0) && (
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {product.description && (
            <section>
              <h2 className="mb-3 font-display text-lg font-bold">Descrição</h2>
              <div className="space-y-3 text-[15px] leading-relaxed text-muted">
                {product.description.split(/\n{2,}/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </section>
          )}
          {product.specs.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-lg font-bold">Especificações</h2>
              <dl className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
                {product.specs.map((s) => (
                  <div key={s.label} className="grid grid-cols-[40%_1fr] gap-3 bg-surface px-4 py-3 text-sm">
                    <dt className="text-subtle">{s.label}</dt>
                    <dd className="font-medium">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
      )}

      <ProductRail title="Você também pode gostar" products={related.map(toListProduct)} />
    </div>
  );
}
