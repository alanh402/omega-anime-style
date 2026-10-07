import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { isSupabaseEnabled } from "@/config/site";
import { getAdminSession } from "@/data/supabase/server-client";
import { loadAdminCatalog } from "@/data/admin";
import { AdminTitle } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Editar produto" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseEnabled) return null;
  const { id } = await params;
  const { supabase } = await getAdminSession();
  const { products, categories, brands } = await loadAdminCatalog(supabase);
  const product = products.find((p) => p.id === id);
  if (!product) notFound();
  return (
    <div className="max-w-5xl">
      <AdminTitle
        title={product.name}
        description="Editar produto"
        actions={
          <Link href={`/produto/${product.slug}`} target="_blank" className="inline-flex h-10 items-center gap-1.5 text-sm font-semibold text-gold-bright">
            Ver na loja <ExternalLink className="h-4 w-4" />
          </Link>
        }
      />
      <ProductForm product={product} categories={categories} brands={brands} allProducts={products} />
    </div>
  );
}
