import { ImageResponse } from "next/og";
import { getCatalog, getProductBySlug, getSettings } from "@/data/catalog";
import { formatBRL, getStartingPrice, getTotalStock } from "@/lib/pricing";
import { OG_SIZE, ogAsset, ogFonts, ogProductImage } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Produto Omega Anime Style";
export const revalidate = 60;

export async function generateStaticParams() {
  // Se o banco estiver indisponível no build, as páginas são geradas sob demanda
  const { products } = await getCatalog().catch(() => ({ products: [] as Array<{ slug: string }> }));
  return products.map((p) => ({ slug: p.slug }));
}

/** Imagem de prévia (1200×630) exibida ao compartilhar o link do produto */
export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, settings, fonts, logo] = await Promise.all([getProductBySlug(slug), getSettings(), ogFonts(), ogAsset("logo-mark.png")]);
  const image = await ogProductImage(product?.images[0]?.url);
  const price = product ? getStartingPrice(product) : undefined;
  const out = product ? getTotalStock(product) <= 0 : false;
  const meta = [product?.brand?.name, product?.categories[0]?.name].filter(Boolean).join(" · ");

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0a0a0c", fontFamily: "Manrope", color: "#f5f2ea", position: "relative" }}>
        <div style={{ position: "absolute", right: -160, top: -160, width: 640, height: 640, borderRadius: 9999, background: "radial-gradient(circle, rgba(217,169,59,0.22), rgba(217,169,59,0))", display: "flex" }} />
        <div style={{ display: "flex", padding: 44, width: 588, height: "100%", alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", width: 520, height: 520, borderRadius: 32, overflow: "hidden", border: "2px solid #2a2a33", background: "#1b1b21", alignItems: "center", justifyContent: "center" }}>
            {image ? (
              <img src={image} width={520} height={520} style={{ objectFit: "cover" }} alt="" />
            ) : (
              <img src={logo} width={300} height={127} style={{ opacity: 0.35 }} alt="" />
            )}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "56px 56px 56px 8px", justifyContent: "space-between" }}>
          <img src={logo} height={74} width={Math.round(74 * 2.36)} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            {meta && <div style={{ fontSize: 24, color: "#d9a93b", fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", display: "flex" }}>{meta}</div>}
            <div style={{ fontSize: product && product.name.length > 34 ? 46 : 56, fontFamily: "Unbounded", lineHeight: 1.12, marginTop: 14, display: "flex" }}>
              {product?.name ?? settings.storeName}
            </div>
            {price && (
              <div style={{ display: "flex", flexDirection: "column", marginTop: 24 }}>
                {(price.hasRange || price.original) && (
                  <div style={{ display: "flex", gap: 14, fontSize: 26, color: "#a6a29a", whiteSpace: "nowrap" }}>
                    {price.hasRange && <span>a partir de</span>}
                    {price.original && <span style={{ color: "#75726c", textDecoration: "line-through" }}>{formatBRL(price.original)}</span>}
                  </div>
                )}
                <span style={{ fontSize: 64, fontWeight: 800, color: "#f3cf6c", whiteSpace: "nowrap" }}>{formatBRL(price.current)}</span>
              </div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", background: out ? "#3a2124" : "#25d366", color: out ? "#f2555a" : "#04260f", borderRadius: 16, padding: "14px 26px", fontSize: 26, fontWeight: 800 }}>
              {out ? "Esgotado no momento" : "Peça pelo WhatsApp"}
            </div>
            <div style={{ fontSize: 22, color: "#a6a29a", display: "flex" }}>{settings.storeName}</div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
