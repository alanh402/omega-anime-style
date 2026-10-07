import { getCatalog, getSettings } from "@/data/catalog";
import { getSiteUrl } from "@/config/site";
import { OrderProvider } from "@/store/order-store";
import { StoreConfigProvider } from "@/store/store-config";
import { UIProvider } from "@/store/ui-store";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { CategoriesSheet } from "@/components/layout/CategoriesSheet";
import { Toaster } from "@/components/ui/Toaster";
import { DemoNotice } from "@/components/layout/DemoNotice";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, catalog] = await Promise.all([getSettings(), getCatalog()]);
  const counts = new Map<string, number>();
  for (const p of catalog.products) for (const id of p.categoryIds) counts.set(id, (counts.get(id) ?? 0) + 1);
  const categoryLinks = catalog.categories.map((c) => ({ slug: c.slug, name: c.name, icon: c.icon, count: counts.get(c.id) ?? 0 }));

  return (
    <StoreConfigProvider
      value={{
        storeName: settings.storeName,
        whatsappNumber: settings.whatsappNumber,
        orderMessage: settings.orderMessage,
        shareMessage: settings.shareMessage,
        instagram: settings.instagram,
        siteUrl: getSiteUrl(),
      }}
    >
      <OrderProvider>
        <UIProvider>
          {catalog.source === "demo" && <DemoNotice />}
          <Header />
          <main className="min-h-[60vh]">{children}</main>
          <Footer settings={settings} categories={catalog.categories} />
          <BottomNav />
          <SearchOverlay />
          <CategoriesSheet categories={categoryLinks} />
          <Toaster />
        </UIProvider>
      </OrderProvider>
    </StoreConfigProvider>
  );
}
