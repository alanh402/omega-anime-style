import { isSupabaseEnabled } from "@/config/site";
import { getAdminSession } from "@/data/supabase/server-client";
import { loadAdminCatalog } from "@/data/admin";
import { AdminTitle } from "@/components/admin/AdminShell";
import { TaxonomyEditor } from "@/components/admin/TaxonomyEditor";

export const metadata = { title: "Categorias" };

export default async function AdminCategoriesPage() {
  if (!isSupabaseEnabled) return null;
  const { supabase } = await getAdminSession();
  const { products, categories } = await loadAdminCatalog(supabase);
  const items = categories.map((c) => ({ ...c, count: products.filter((p) => p.categoryIds.includes(c.id)).length }));
  return (
    <div className="max-w-3xl">
      <AdminTitle title="Categorias" description="A ordem define a sequência na Home e no menu." />
      <TaxonomyEditor kind="category" items={items} />
    </div>
  );
}
