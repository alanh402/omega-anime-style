import { NextResponse, type NextRequest } from "next/server";
import { getCatalog } from "@/data/catalog";
import { searchProducts } from "@/lib/search";
import { getStartingPrice, getTotalStock } from "@/lib/pricing";

export interface SearchHit {
  slug: string;
  name: string;
  brand?: string;
  category?: string;
  image?: string;
  price: number;
  original?: number;
  fromPrice: boolean;
  outOfStock: boolean;
}

/** Busca instantânea do cabeçalho. Resposta enxuta e cacheável. */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").slice(0, 80);
  if (q.trim().length < 2) return NextResponse.json({ hits: [], total: 0 });

  const { products } = await getCatalog();
  const results = searchProducts(products, q);
  const hits: SearchHit[] = results.slice(0, 8).map((p) => {
    const price = getStartingPrice(p);
    return {
      slug: p.slug,
      name: p.name,
      brand: p.brand?.name,
      category: p.categories[0]?.name,
      image: p.images[0]?.url,
      price: price.current,
      original: price.original,
      fromPrice: price.hasRange,
      outOfStock: getTotalStock(p) <= 0,
    };
  });
  return NextResponse.json(
    { hits, total: results.length },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
  );
}
