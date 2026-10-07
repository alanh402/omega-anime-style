import { isSupabaseEnabled } from "@/config/site";
import { getAdminSession } from "@/data/supabase/server-client";
import { loadAdminCatalog } from "@/data/admin";
import { AdminTitle } from "@/components/admin/AdminShell";
import { TaxonomyEditor } from "@/components/admin/TaxonomyEditor";

export const metadata = { title: "Marcas" };

export default async function AdminBrandsPage() {
  if (!isSupabaseEnabled) return null;
  const { supabase } = await getAdminSession();
  const { products, brands } = await loadAdminCatalog(supabase);
  const items = brands.map((b) => ({ ...b, count: products.filter((p) => p.brandId === b.id).length }));
  return (
    <div className="max-w-3xl">
      <AdminTitle title="Marcas" description="Usadas no filtro do catálogo e nos cards." />
      <TaxonomyEditor kind="brand" items={items} />
    </div>
  );
}
