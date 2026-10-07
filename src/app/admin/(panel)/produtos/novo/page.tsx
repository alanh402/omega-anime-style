import { isSupabaseEnabled } from "@/config/site";
import { getAdminSession } from "@/data/supabase/server-client";
import { loadAdminCatalog } from "@/data/admin";
import { AdminTitle } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Novo produto" };

export default async function NewProductPage() {
  if (!isSupabaseEnabled) return null;
  const { supabase } = await getAdminSession();
  const { products, categories, brands } = await loadAdminCatalog(supabase);
  return (
    <div className="max-w-5xl">
      <AdminTitle title="Novo produto" />
      <ProductForm categories={categories} brands={brands} allProducts={products} />
    </div>
  );
}
