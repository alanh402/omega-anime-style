/**
 * Arte ilustrativa dos produtos de DEMONSTRAÇÃO.
 * O script `npm run demo:art` gera os SVGs em public/demo a partir deste mapa.
 * Cada cor gera uma imagem (galeria). Produtos reais usam fotos enviadas pelo admin.
 */
export type ArtKind =
  | "phone"
  | "phone-pro"
  | "tablet"
  | "console"
  | "controller"
  | "headset"
  | "earbuds"
  | "speaker"
  | "laptop"
  | "pc"
  | "case"
  | "film"
  | "charger"
  | "cable"
  | "hdmi"
  | "tshirt"
  | "hoodie"
  | "watch"
  | "game"
  | "stand"
  | "mouse"
  | "keyboard";

export const demoArt: Record<string, { kind: ArtKind; colors: string[] }> = {
  "iphone-15": { kind: "phone", colors: ["#2b2d33", "#a9c4dd", "#efc7cf"] },
  "iphone-16-pro": { kind: "phone-pro", colors: ["#c7a98a", "#3a3a3d", "#cfcac2"] },
  "iphone-13-128gb": { kind: "phone", colors: ["#20232b", "#ece6da"] },
  "redmi-note-14-pro": { kind: "phone-pro", colors: ["#1c1d22", "#6b4fa8"] },
  "poco-x7-pro": { kind: "phone-pro", colors: ["#f2c230", "#202126"] },
  "ipad-10-geracao": { kind: "tablet", colors: ["#7fa7d6", "#d8dbe0"] },
  "ipad-air-m2": { kind: "tablet", colors: ["#a49cc9"] },
  "playstation-5-slim": { kind: "console", colors: ["#f1f1f3", "#e8e8ec"] },
  "controle-dualsense": { kind: "controller", colors: ["#f1f1f3", "#26272c", "#c8303a"] },
  "headset-pulse-3d": { kind: "headset", colors: ["#eeeef1"] },
  "suporte-vertical-ps5": { kind: "stand", colors: ["#1e1f24"] },
  "cabo-hdmi-2-1": { kind: "hdmi", colors: ["#55565f"] },
  "jogo-ps5-midia-fisica": { kind: "game", colors: ["#1f4fd1"] },
  "nintendo-switch-oled": { kind: "tablet", colors: ["#e84a4a"] },
  "notebook-gamer-nitro-v15": { kind: "laptop", colors: ["#1b1c21", "#25262c"] },
  "pc-gamer-ryzen-7-rtx-4070": { kind: "pc", colors: ["#d9a93b", "#7a5cff"] },
  "mouse-gamer-cobra": { kind: "mouse", colors: ["#1d1e23"] },
  "teclado-mecanico-kumara": { kind: "keyboard", colors: ["#1d1e23"] },
  "airpods-4": { kind: "earbuds", colors: ["#f4f4f6"] },
  "fone-jbl-wave-buds": { kind: "earbuds", colors: ["#1f2025", "#f0f0f2", "#2f6fd6"] },
  "caixa-jbl-go-4": { kind: "speaker", colors: ["#1f2025", "#2f6fd6", "#d23c3c"] },
  "capa-silicone-iphone": { kind: "case", colors: ["#202127", "#22304f", "#d6c3a3"] },
  "capa-anti-impacto-xiaomi": { kind: "case", colors: ["#3a3c44"] },
  "pelicula-3d-iphone": { kind: "film", colors: ["#9fb6c9"] },
  "pelicula-privacidade": { kind: "film", colors: ["#3a3f47"] },
  "carregador-20w-usb-c": { kind: "charger", colors: ["#f2f2f4"] },
  "cabo-usb-c-lightning": { kind: "cable", colors: ["#f2f2f4"] },
  "camiseta-oversized-omega": { kind: "tshirt", colors: ["#16161a", "#ece6da"] },
  "moletom-anime-ronin": { kind: "hoodie", colors: ["#1b1b20"] },
  "redmi-watch-5-active": { kind: "watch", colors: ["#1f2025", "#e7e1d6"] },
};

export const demoCollectionArt: Record<string, { kinds: ArtKind[]; colors: string[] }> = {
  "setup-gamer": { kinds: ["pc", "controller", "headset"], colors: ["#d9a93b", "#26272c", "#eeeef1"] },
  "ecossistema-apple": { kinds: ["tablet", "phone", "earbuds"], colors: ["#d8dbe0", "#2b2d33", "#f4f4f6"] },
  "universo-xiaomi": { kinds: ["phone-pro", "watch", "phone-pro"], colors: ["#6b4fa8", "#1f2025", "#f2c230"] },
  "acessorios-smartphone": { kinds: ["case", "charger", "film"], colors: ["#22304f", "#f2f2f4", "#9fb6c9"] },
};
