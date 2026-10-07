import { getHomeSections, getSettings } from "@/data/catalog";
import { toListProduct } from "@/lib/order";
import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductRail } from "@/components/home/ProductRail";
import { CollectionBanners } from "@/components/home/CollectionBanners";
import { WhatsAppCta } from "@/components/home/WhatsAppCta";

// Deve ser literal (Next.js); mantenha igual a CATALOG_REVALIDATE_SECONDS
export const revalidate = 60;

export default async function HomePage() {
  const [settings, sections] = await Promise.all([getSettings(), getHomeSections()]);
  const { featured, offers, newest, categories, categoryCounts } = sections;

  return (
    <>
      <Hero settings={settings} />
      <CategoryGrid categories={categories} counts={categoryCounts} />
      <ProductRail index="02" title="Destaques" subtitle="Os mais pedidos da Omega." href="/catalogo?destaque=1" products={featured.map(toListProduct)} />
      <CollectionBanners collections={settings.collections} />
      <ProductRail index="04" title="Ofertas" subtitle="Preço baixou — enquanto durar o estoque." href="/catalogo?oferta=1&ordem=discount" products={offers.map(toListProduct)} />
      <ProductRail index="05" title="Novidades" subtitle="Acabou de chegar." href="/catalogo?ordem=newest" products={newest.map(toListProduct)} />
      <WhatsAppCta number={settings.whatsappNumber} storeName={settings.storeName} />
    </>
  );
}
