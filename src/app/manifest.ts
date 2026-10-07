import type { MetadataRoute } from "next";

/** Permite "Adicionar à tela inicial" — útil para vendedores abrirem o catálogo rápido */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Omega Anime Style",
    short_name: "Omega",
    description: "Catálogo da Omega Anime Style — escolha e feche no WhatsApp.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0c",
    theme_color: "#0a0a0c",
    lang: "pt-BR",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
