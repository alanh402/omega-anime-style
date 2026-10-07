import { ImageResponse } from "next/og";
import { OG_SIZE, ogAsset, ogFonts } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Omega Anime Style — Tecnologia, games e estilo";

/** Prévia padrão do site (home, catálogo, categorias) */
export default async function OgImage() {
  const [fonts, logo] = await Promise.all([ogFonts(), ogAsset("logo-full.png")]);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0a0a0c", fontFamily: "Manrope", color: "#f5f2ea" }}>
        <img src={logo} width={620} height={312} alt="" />
        <div style={{ marginTop: 34, fontSize: 30, color: "#a6a29a", display: "flex" }}>Smartphones · Games · Acessórios · Roupas</div>
        <div style={{ marginTop: 22, display: "flex", background: "#25d366", color: "#04260f", borderRadius: 16, padding: "12px 26px", fontSize: 26, fontWeight: 800 }}>
          Escolha no catálogo e feche no WhatsApp
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
