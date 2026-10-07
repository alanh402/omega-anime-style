import { isSupabaseEnabled } from "@/config/site";
import { getAdminSession } from "@/data/supabase/server-client";
import { loadAdminCatalog } from "@/data/admin";
import { AdminTitle } from "@/components/admin/AdminShell";
import { ProductsTable } from "@/components/admin/ProductsTable";
import { ButtonLink } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export const metadata = { title: "Produtos" };

export default async function AdminProductsPage() {
  if (!isSupabaseEnabled) return null;
  const { supabase } = await getAdminSession();
  const { products, categories, brands } = await loadAdminCatalog(supabase);
  return (
    <div className="max-w-6xl">
      <AdminTitle
        title="Produtos"
        description={`${products.length} cadastrados`}
        actions={
          <ButtonLink href="/admin/produtos/novo">
            <Plus className="h-4 w-4" /> Novo produto
          </ButtonLink>
        }
      />
      <ProductsTable products={products} categories={categories} brands={brands} />
    </div>
  );
}
