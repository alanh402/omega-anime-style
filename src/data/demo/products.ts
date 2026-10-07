/**
 * DADOS DE DEMONSTRAÇÃO — produtos fictícios para validar o catálogo.
 * Preços, estoques e imagens são ilustrativos. Para usar os produtos reais,
 * conecte o Supabase (ver README) — esta lista deixa de ser usada.
 */
import type { OptionGroup, Product, ProductSpec, ProductVariant } from "@/lib/types";
import { demoArt } from "./art";

let seq = 0;
const daysAgo = (n: number) => new Date(Date.UTC(2026, 9, 6) - n * 86_400_000).toISOString();

function images(slug: string, alt: string) {
  const count = demoArt[slug]?.colors.length ?? 0;
  return Array.from({ length: count }, (_, i) => ({ url: `/demo/products/${slug}-${i + 1}.svg`, alt }));
}

/** Gera todas as combinações de variações a partir dos grupos de opções */
function combine(
  slug: string,
  groups: OptionGroup[],
  priceFor: (o: Record<string, string>) => { price?: number; promoPrice?: number },
  stockFor: (o: Record<string, string>, i: number) => number = () => 5,
): ProductVariant[] {
  const combos: Record<string, string>[] = groups.reduce<Record<string, string>[]>(
    (acc, g) => acc.flatMap((a) => g.values.map((v) => ({ ...a, [g.name]: v }))),
    [{}],
  );
  return combos.map((options, i) => ({
    id: `${slug}-v${i + 1}`,
    sku: `${slug.toUpperCase().slice(0, 10)}-${i + 1}`,
    options,
    stock: stockFor(options, i),
    ...priceFor(options),
  }));
}

type Input = Partial<Product> &
  Pick<Product, "slug" | "name" | "price" | "categoryIds"> & { brand?: string; specList?: Array<[string, string]> };

function product(p: Input): Product {
  seq += 1;
  const { brand, specList, ...rest } = p;
  const specs: ProductSpec[] = (specList ?? []).map(([label, value]) => ({ label, value }));
  return {
    id: `prod-${p.slug}`,
    sku: `OAS-${String(seq).padStart(4, "0")}`,
    tags: [],
    stock: 8,
    images: images(p.slug, p.name),
    specs,
    optionGroups: [],
    variants: [],
    isFeatured: false,
    isNew: false,
    active: true,
    kitProductIds: [],
    createdAt: daysAgo(seq * 3),
    brandId: brand ? `brand-${brand}` : undefined,
    ...rest,
  };
}

/** Associa cada valor de um grupo (ex.: Cor) à imagem de mesma posição na galeria */
function linkImages(p: Product, group: string): Product {
  const values = p.optionGroups.find((g) => g.name === group)?.values ?? [];
  return {
    ...p,
    variants: p.variants.map((v) => {
      const i = values.indexOf(v.options[group]);
      return p.images[i] ? { ...v, image: p.images[i].url } : v;
    }),
  };
}

const cat = (...slugs: string[]) => slugs.map((s) => `cat-${s}`);
const kit = (...slugs: string[]) => slugs.map((s) => `prod-${s}`);

/* ------------------------------ Smartphones ------------------------------ */

const iphone15Groups: OptionGroup[] = [
  { name: "Armazenamento", values: ["128 GB", "256 GB", "512 GB"] },
  { name: "Cor", values: ["Preto", "Azul", "Rosa"] },
];
const iphone15Prices: Record<string, { price: number; promoPrice?: number }> = {
  "128 GB": { price: 4999, promoPrice: 4699 },
  "256 GB": { price: 5799, promoPrice: 5499 },
  "512 GB": { price: 6999 },
};

const baseProducts: Product[] = [
  product({
    slug: "iphone-15",
    name: "iPhone 15",
    brand: "apple",
    categoryIds: cat("iphone", "smartphones", "apple"),
    tags: ["iphone", "apple", "celular", "ios", "5g"],
    shortDescription: "Dynamic Island, câmera de 48 MP e USB-C. Lacrado, com garantia.",
    description:
      "O iPhone 15 traz a Dynamic Island, câmera principal de 48 MP com zoom 2x de qualidade óptica e a conexão USB-C. Corpo em alumínio com vidro colorido na parte traseira e tela Super Retina XDR de 6,1 polegadas.\n\nAparelho novo, lacrado, com nota fiscal e garantia.",
    price: 4999,
    promoPrice: 4699,
    installments: { count: 12, interestFree: true },
    optionGroups: iphone15Groups,
    variants: combine("iphone-15", iphone15Groups, (o) => iphone15Prices[o["Armazenamento"]], (o) =>
      o["Armazenamento"] === "512 GB" && o["Cor"] === "Rosa" ? 0 : o["Cor"] === "Azul" ? 2 : 6,
    ),
    specList: [
      ["Tela", "6,1\" Super Retina XDR OLED"],
      ["Processador", "A16 Bionic"],
      ["Câmera traseira", "48 MP + 12 MP ultra-angular"],
      ["Câmera frontal", "12 MP TrueDepth"],
      ["Conector", "USB-C"],
      ["Conectividade", "5G, Wi-Fi 6, Bluetooth 5.3"],
      ["Na caixa", "Aparelho e cabo USB-C"],
    ],
    isFeatured: true,
    kitProductIds: kit("capa-silicone-iphone", "pelicula-3d-iphone", "carregador-20w-usb-c", "airpods-4"),
  }),
  product({
    slug: "iphone-16-pro",
    name: "iPhone 16 Pro",
    brand: "apple",
    categoryIds: cat("iphone", "smartphones", "apple"),
    tags: ["iphone", "apple", "celular", "pro", "titanio", "5g"],
    shortDescription: "Titânio, Controle da Câmera e chip A18 Pro.",
    description:
      "Acabamento em titânio, tela de 6,3\" com ProMotion de até 120 Hz, botão Controle da Câmera e sistema de câmeras Pro com teleobjetiva 5x. Desempenho do chip A18 Pro para jogos e edição de vídeo.",
    price: 8499,
    installments: { count: 12, interestFree: true },
    optionGroups: [
      { name: "Armazenamento", values: ["256 GB", "512 GB", "1 TB"] },
      { name: "Cor", values: ["Titânio-deserto", "Titânio-preto", "Titânio natural"] },
    ],
    variants: combine(
      "iphone-16-pro",
      [
        { name: "Armazenamento", values: ["256 GB", "512 GB", "1 TB"] },
        { name: "Cor", values: ["Titânio-deserto", "Titânio-preto", "Titânio natural"] },
      ],
      (o) => ({ price: { "256 GB": 8499, "512 GB": 9999, "1 TB": 11499 }[o["Armazenamento"]] }),
      (o) => (o["Armazenamento"] === "1 TB" ? 1 : 4),
    ),
    specList: [
      ["Tela", "6,3\" Super Retina XDR, ProMotion 120 Hz"],
      ["Processador", "A18 Pro"],
      ["Câmeras", "48 MP + 48 MP ultra-angular + 12 MP teleobjetiva 5x"],
      ["Material", "Titânio"],
      ["Conector", "USB-C (USB 3)"],
    ],
    isFeatured: true,
    isNew: true,
    createdAt: daysAgo(2),
    kitProductIds: kit("capa-silicone-iphone", "pelicula-3d-iphone", "carregador-20w-usb-c", "airpods-4"),
  }),
  product({
    slug: "iphone-13-128gb",
    name: "iPhone 13 128 GB",
    brand: "apple",
    categoryIds: cat("iphone", "smartphones", "apple"),
    tags: ["iphone", "apple", "celular", "custo-beneficio"],
    shortDescription: "O iPhone de melhor custo-benefício. Câmera dupla e chip A15.",
    description: "Chip A15 Bionic, câmera dupla de 12 MP com modo Cinema e bateria para o dia todo. Ótima porta de entrada para o ecossistema Apple.",
    price: 3299,
    promoPrice: 2999,
    installments: { count: 10, interestFree: true },
    stock: 2,
    optionGroups: [{ name: "Cor", values: ["Meia-noite", "Estelar"] }],
    variants: [
      { id: "iphone-13-v1", options: { Cor: "Meia-noite" }, stock: 2 },
      { id: "iphone-13-v2", options: { Cor: "Estelar" }, stock: 1 },
    ],
    specList: [
      ["Tela", "6,1\" Super Retina XDR"],
      ["Processador", "A15 Bionic"],
      ["Armazenamento", "128 GB"],
      ["Conector", "Lightning"],
    ],
    kitProductIds: kit("capa-silicone-iphone", "pelicula-3d-iphone", "cabo-usb-c-lightning", "carregador-20w-usb-c"),
  }),
  product({
    slug: "redmi-note-14-pro",
    name: "Xiaomi Redmi Note 14 Pro",
    brand: "xiaomi",
    categoryIds: cat("smartphones", "xiaomi"),
    tags: ["xiaomi", "redmi", "celular", "android", "amoled", "custo-beneficio"],
    shortDescription: "Tela AMOLED 120 Hz, câmera de 200 MP e carregamento rápido.",
    description:
      "Tela AMOLED de 6,67\" com 120 Hz, câmera principal de 200 MP e bateria de 5110 mAh com carregamento turbo de 45 W. Resistência IP64. Versão global com NFC.",
    price: 2099,
    promoPrice: 1849,
    installments: { count: 10, interestFree: true },
    optionGroups: [
      { name: "Memória", values: ["8 GB + 256 GB", "12 GB + 512 GB"] },
      { name: "Cor", values: ["Preto", "Roxo"] },
    ],
    variants: combine(
      "redmi-note-14-pro",
      [
        { name: "Memória", values: ["8 GB + 256 GB", "12 GB + 512 GB"] },
        { name: "Cor", values: ["Preto", "Roxo"] },
      ],
      (o) => (o["Memória"] === "8 GB + 256 GB" ? { price: 2099, promoPrice: 1849 } : { price: 2499, promoPrice: 2249 }),
    ),
    specList: [
      ["Tela", "6,67\" AMOLED, 120 Hz"],
      ["Câmera", "200 MP + 8 MP + 2 MP"],
      ["Bateria", "5110 mAh, carregamento 45 W"],
      ["Rede", "4G, NFC"],
      ["Versão", "Global"],
    ],
    isFeatured: true,
    kitProductIds: kit("capa-anti-impacto-xiaomi", "pelicula-privacidade", "fone-jbl-wave-buds"),
  }),
  product({
    slug: "poco-x7-pro",
    name: "POCO X7 Pro 5G",
    brand: "xiaomi",
    categoryIds: cat("smartphones", "xiaomi"),
    tags: ["xiaomi", "poco", "celular", "android", "gamer", "5g", "setup-gamer"],
    shortDescription: "Desempenho de topo para jogos, com carregamento de 90 W.",
    description: "Processador Dimensity 8400-Ultra, tela AMOLED 1.5K de 120 Hz e bateria de 6000 mAh. Feito para quem joga no celular.",
    price: 2799,
    installments: { count: 10, interestFree: true },
    optionGroups: [{ name: "Memória", values: ["8 GB + 256 GB", "12 GB + 512 GB"] }],
    variants: [
      { id: "poco-x7-v1", options: { Memória: "8 GB + 256 GB" }, price: 2799, stock: 5 },
      { id: "poco-x7-v2", options: { Memória: "12 GB + 512 GB" }, price: 3199, stock: 3 },
    ],
    specList: [
      ["Processador", "Dimensity 8400-Ultra"],
      ["Tela", "6,67\" AMOLED 1.5K, 120 Hz"],
      ["Bateria", "6000 mAh, carregamento 90 W"],
    ],
    isNew: true,
    createdAt: daysAgo(4),
    kitProductIds: kit("capa-anti-impacto-xiaomi", "pelicula-privacidade", "fone-jbl-wave-buds"),
  }),

  /* --------------------------------- iPad -------------------------------- */
  product({
    slug: "ipad-10-geracao",
    name: "iPad 10ª geração Wi-Fi",
    brand: "apple",
    categoryIds: cat("ipad", "apple"),
    tags: ["ipad", "apple", "tablet", "estudo"],
    shortDescription: "Tela Liquid Retina de 10,9\" e USB-C. Ideal para estudo.",
    description: "Design com bordas finas, chip A14 Bionic, câmera frontal no lado horizontal para videochamadas e compatibilidade com Apple Pencil (USB-C).",
    price: 3299,
    promoPrice: 2999,
    installments: { count: 12, interestFree: true },
    optionGroups: [
      { name: "Armazenamento", values: ["64 GB", "256 GB"] },
      { name: "Cor", values: ["Azul", "Prateado"] },
    ],
    variants: combine(
      "ipad-10",
      [
        { name: "Armazenamento", values: ["64 GB", "256 GB"] },
        { name: "Cor", values: ["Azul", "Prateado"] },
      ],
      (o) => (o["Armazenamento"] === "64 GB" ? { price: 3299, promoPrice: 2999 } : { price: 4299, promoPrice: 3999 }),
    ),
    specList: [
      ["Tela", "10,9\" Liquid Retina"],
      ["Processador", "A14 Bionic"],
      ["Conector", "USB-C"],
    ],
    kitProductIds: kit("carregador-20w-usb-c", "airpods-4"),
  }),
  product({
    slug: "ipad-air-m2",
    name: "iPad Air 11\" M2",
    brand: "apple",
    categoryIds: cat("ipad", "apple"),
    tags: ["ipad", "apple", "tablet", "m2", "criacao"],
    shortDescription: "Chip M2 em um corpo fino e leve. Para criar sem limites.",
    description: "Chip M2, tela Liquid Retina de 11\", câmera frontal horizontal e suporte ao Apple Pencil Pro.",
    price: 5999,
    installments: { count: 12, interestFree: true },
    stock: 3,
    specList: [
      ["Tela", "11\" Liquid Retina"],
      ["Processador", "Apple M2"],
      ["Armazenamento", "128 GB"],
    ],
    isFeatured: true,
    kitProductIds: kit("carregador-20w-usb-c", "airpods-4"),
  }),

  /* --------------------------------- Games -------------------------------- */
  product({
    slug: "playstation-5-slim",
    name: "PlayStation 5 Slim",
    brand: "sony",
    categoryIds: cat("ps5", "games"),
    tags: ["ps5", "playstation", "console", "sony", "videogame", "setup-gamer"],
    shortDescription: "Console PS5 Slim com SSD de 1 TB e controle DualSense.",
    description:
      "Carregamento ultrarrápido com SSD de 1 TB, feedback tátil e gatilhos adaptáveis no DualSense, áudio 3D e jogos em até 4K/120 fps.\n\nNovo, lacrado, com nota fiscal.",
    price: 3999,
    promoPrice: 3699,
    installments: { count: 12, interestFree: true },
    optionGroups: [{ name: "Edição", values: ["Mídia física", "Digital"] }],
    variants: [
      { id: "ps5-v1", options: { Edição: "Mídia física" }, price: 3999, promoPrice: 3699, stock: 4 },
      { id: "ps5-v2", options: { Edição: "Digital" }, price: 3599, promoPrice: 3399, stock: 3 },
    ],
    specList: [
      ["Armazenamento", "SSD 1 TB"],
      ["Resolução", "Até 4K, 120 fps"],
      ["Na caixa", "Console, 1 DualSense, cabos HDMI e energia"],
    ],
    isFeatured: true,
    kitProductIds: kit("controle-dualsense", "headset-pulse-3d", "suporte-vertical-ps5", "cabo-hdmi-2-1", "jogo-ps5-midia-fisica"),
  }),
  product({
    slug: "controle-dualsense",
    name: "Controle DualSense PS5",
    brand: "sony",
    categoryIds: cat("ps5", "games", "acessorios"),
    tags: ["ps5", "controle", "dualsense", "sony", "setup-gamer"],
    shortDescription: "Feedback tátil e gatilhos adaptáveis. Original Sony.",
    price: 499,
    promoPrice: 429,
    installments: { count: 6, interestFree: true },
    optionGroups: [{ name: "Cor", values: ["Branco", "Midnight Black", "Cosmic Red"] }],
    variants: [
      { id: "dualsense-v1", options: { Cor: "Branco" }, stock: 6 },
      { id: "dualsense-v2", options: { Cor: "Midnight Black" }, stock: 4 },
      { id: "dualsense-v3", options: { Cor: "Cosmic Red" }, price: 529, promoPrice: 459, stock: 2 },
    ],
    specList: [
      ["Conexão", "Bluetooth / USB-C"],
      ["Compatibilidade", "PS5 e PC"],
    ],
    kitProductIds: kit("headset-pulse-3d", "cabo-hdmi-2-1"),
  }),
  product({
    slug: "headset-pulse-3d",
    name: "Headset sem fio Pulse 3D",
    brand: "sony",
    categoryIds: cat("ps5", "audio", "games"),
    tags: ["headset", "fone", "ps5", "audio 3d", "setup-gamer"],
    shortDescription: "Áudio 3D pensado para o PS5, com dois microfones.",
    price: 749,
    installments: { count: 6, interestFree: true },
    stock: 4,
    specList: [
      ["Conexão", "Sem fio (adaptador USB) e P2"],
      ["Bateria", "Até 12 horas"],
    ],
  }),
  product({
    slug: "suporte-vertical-ps5",
    name: "Suporte vertical PS5 com cooler e carregador",
    brand: "omega",
    categoryIds: cat("ps5", "acessorios", "games"),
    tags: ["ps5", "suporte", "cooler", "base", "setup-gamer"],
    shortDescription: "Resfria o console e carrega 2 controles.",
    price: 189,
    promoPrice: 159,
    stock: 10,
    specList: [["Compatibilidade", "PS5 Slim e Fat"]],
  }),
  product({
    slug: "cabo-hdmi-2-1",
    name: "Cabo HDMI 2.1 8K 2 m",
    brand: "baseus",
    categoryIds: cat("acessorios", "games"),
    tags: ["hdmi", "cabo", "4k", "8k", "120hz", "setup-gamer"],
    shortDescription: "4K 120 Hz / 8K 60 Hz para console e PC.",
    price: 79,
    stock: 20,
  }),
  product({
    slug: "jogo-ps5-midia-fisica",
    name: "Jogos PS5 — mídia física",
    brand: "sony",
    categoryIds: cat("ps5", "games"),
    tags: ["jogo", "game", "ps5", "midia fisica"],
    shortDescription: "Lançamentos e clássicos. Consulte os títulos disponíveis.",
    description: "Trabalhamos com diversos títulos de PS5 em mídia física. Escolha o gênero e confirme os títulos disponíveis com o vendedor.",
    price: 249,
    optionGroups: [{ name: "Gênero", values: ["Ação/Aventura", "Esporte", "Corrida", "Luta"] }],
    variants: combine("jogo-ps5", [{ name: "Gênero", values: ["Ação/Aventura", "Esporte", "Corrida", "Luta"] }], () => ({})),
  }),
  product({
    slug: "nintendo-switch-oled",
    name: "Nintendo Switch OLED",
    brand: "nintendo",
    categoryIds: cat("games"),
    tags: ["nintendo", "switch", "console", "portatil", "videogame"],
    shortDescription: "Tela OLED de 7\" para jogar em casa ou fora dela.",
    price: 2599,
    stock: 0,
    specList: [["Tela", "7\" OLED"], ["Armazenamento", "64 GB"]],
  }),

  /* --------------------------- Computadores gamer -------------------------- */
  product({
    slug: "notebook-gamer-nitro-v15",
    name: "Notebook Gamer Acer Nitro V15 RTX 4050",
    brand: "acer",
    categoryIds: cat("computadores-gamer"),
    tags: ["notebook", "gamer", "laptop", "rtx", "nvidia", "setup-gamer"],
    shortDescription: "Intel Core i5 13ª ger., RTX 4050 e tela 144 Hz.",
    description: "Notebook pronto para jogos competitivos e estudo: processador Intel Core i5-13420H, GeForce RTX 4050 6 GB, SSD NVMe de 512 GB e tela Full HD IPS de 144 Hz.",
    price: 5999,
    promoPrice: 5499,
    installments: { count: 12, interestFree: true },
    optionGroups: [{ name: "Memória RAM", values: ["8 GB", "16 GB"] }],
    variants: [
      { id: "nitro-v1", options: { "Memória RAM": "8 GB" }, price: 5999, promoPrice: 5499, stock: 2 },
      { id: "nitro-v2", options: { "Memória RAM": "16 GB" }, price: 6499, promoPrice: 5999, stock: 3 },
    ],
    specList: [
      ["Processador", "Intel Core i5-13420H"],
      ["Placa de vídeo", "NVIDIA GeForce RTX 4050 6 GB"],
      ["Armazenamento", "SSD NVMe 512 GB"],
      ["Tela", "15,6\" Full HD IPS 144 Hz"],
    ],
    isFeatured: true,
    kitProductIds: kit("mouse-gamer-cobra", "teclado-mecanico-kumara", "headset-pulse-3d"),
  }),
  product({
    slug: "pc-gamer-ryzen-7-rtx-4070",
    name: "PC Gamer Omega Ryzen 7 + RTX 4070 Super",
    brand: "omega",
    categoryIds: cat("computadores-gamer"),
    tags: ["pc", "gamer", "computador", "ryzen", "rtx", "nvidia", "setup-gamer"],
    shortDescription: "Montado e testado pela Omega. Roda tudo em 1440p.",
    description: "Configuração equilibrada para jogar em 1440p com taxa alta: Ryzen 7 5700X3D, RTX 4070 Super 12 GB, 32 GB DDR4 e SSD NVMe de 1 TB. Montagem, cable management e testes inclusos.",
    price: 9999,
    installments: { count: 12, interestFree: false },
    stock: 2,
    specList: [
      ["Processador", "AMD Ryzen 7 5700X3D"],
      ["Placa de vídeo", "RTX 4070 Super 12 GB"],
      ["Memória", "32 GB DDR4 3200"],
      ["Armazenamento", "SSD NVMe 1 TB"],
      ["Fonte", "750 W 80 Plus Gold"],
    ],
    isFeatured: true,
    isNew: true,
    createdAt: daysAgo(1),
    kitProductIds: kit("mouse-gamer-cobra", "teclado-mecanico-kumara", "headset-pulse-3d", "luminaria-led-rgb"),
  }),
  product({
    slug: "mouse-gamer-cobra",
    name: "Mouse Gamer Redragon Cobra RGB",
    brand: "redragon",
    categoryIds: cat("acessorios", "computadores-gamer"),
    tags: ["mouse", "gamer", "rgb", "periferico", "setup-gamer"],
    price: 149,
    promoPrice: 119,
    stock: 15,
    specList: [["Sensor", "12.400 DPI"], ["Botões", "8 programáveis"]],
  }),
  product({
    slug: "teclado-mecanico-kumara",
    name: "Teclado Mecânico Redragon Kumara RGB",
    brand: "redragon",
    categoryIds: cat("acessorios", "computadores-gamer"),
    tags: ["teclado", "mecanico", "gamer", "rgb", "periferico", "setup-gamer"],
    price: 279,
    optionGroups: [{ name: "Switch", values: ["Azul", "Vermelho", "Marrom"] }],
    variants: combine("kumara", [{ name: "Switch", values: ["Azul", "Vermelho", "Marrom"] }], () => ({}), (_o, i) => (i === 2 ? 0 : 6)),
    specList: [["Layout", "ABNT2, TKL"], ["Iluminação", "RGB"]],
  }),

  /* --------------------------------- Áudio -------------------------------- */
  product({
    slug: "airpods-4",
    name: "AirPods 4",
    brand: "apple",
    categoryIds: cat("audio", "apple"),
    tags: ["airpods", "fone", "bluetooth", "apple", "earbuds", "sem fio"],
    shortDescription: "Novo design, áudio personalizado e estojo USB-C.",
    price: 1299,
    promoPrice: 1149,
    installments: { count: 10, interestFree: true },
    optionGroups: [{ name: "Versão", values: ["Padrão", "Com cancelamento de ruído"] }],
    variants: [
      { id: "airpods4-v1", options: { Versão: "Padrão" }, price: 1299, promoPrice: 1149, stock: 6 },
      { id: "airpods4-v2", options: { Versão: "Com cancelamento de ruído" }, price: 1699, promoPrice: 1549, stock: 3 },
    ],
    isNew: true,
    createdAt: daysAgo(5),
  }),
  product({
    slug: "fone-jbl-wave-buds",
    name: "Fone Bluetooth JBL Wave Buds 2",
    brand: "jbl",
    categoryIds: cat("audio"),
    tags: ["fone", "bluetooth", "jbl", "earbuds", "sem fio", "tws"],
    shortDescription: "Graves JBL Deep Bass e até 40 h de bateria.",
    price: 399,
    promoPrice: 299,
    installments: { count: 3, interestFree: true },
    optionGroups: [{ name: "Cor", values: ["Preto", "Branco", "Azul"] }],
    variants: combine("wave-buds", [{ name: "Cor", values: ["Preto", "Branco", "Azul"] }], () => ({}), (_o, i) => [8, 5, 0][i]),
    specList: [["Bateria", "Até 40 h com estojo"], ["Resistência", "IP54"]],
  }),
  product({
    slug: "caixa-jbl-go-4",
    name: "Caixa de Som JBL Go 4",
    brand: "jbl",
    categoryIds: cat("audio"),
    tags: ["caixa de som", "bluetooth", "jbl", "portatil", "speaker"],
    price: 399,
    optionGroups: [{ name: "Cor", values: ["Preto", "Azul", "Vermelho"] }],
    variants: combine("jbl-go-4", [{ name: "Cor", values: ["Preto", "Azul", "Vermelho"] }], () => ({})),
    specList: [["Resistência", "IP67"], ["Bateria", "Até 7 h"]],
  }),

  /* ------------------------- Capas, películas, cabos ----------------------- */
  product({
    slug: "capa-silicone-iphone",
    name: "Capa de Silicone com MagSafe para iPhone",
    brand: "omega",
    categoryIds: cat("capas", "acessorios"),
    tags: ["capa", "capinha", "iphone", "magsafe", "acessorio-celular"],
    shortDescription: "Toque aveludado e encaixe preciso. Compatível com MagSafe.",
    price: 99,
    promoPrice: 79,
    optionGroups: [
      { name: "Modelo", values: ["iPhone 13", "iPhone 15", "iPhone 16 Pro"] },
      { name: "Cor", values: ["Preto", "Azul-marinho", "Areia"] },
    ],
    variants: combine(
      "capa-silicone",
      [
        { name: "Modelo", values: ["iPhone 13", "iPhone 15", "iPhone 16 Pro"] },
        { name: "Cor", values: ["Preto", "Azul-marinho", "Areia"] },
      ],
      () => ({}),
      (_o, i) => (i % 4 === 3 ? 0 : 7),
    ),
  }),
  product({
    slug: "capa-anti-impacto-xiaomi",
    name: "Capa Anti-impacto para Xiaomi",
    brand: "omega",
    categoryIds: cat("capas", "acessorios"),
    tags: ["capa", "capinha", "xiaomi", "redmi", "poco", "anti-impacto", "acessorio-celular"],
    price: 59,
    optionGroups: [{ name: "Modelo", values: ["Redmi Note 14 Pro", "POCO X7 Pro"] }],
    variants: combine("capa-xiaomi", [{ name: "Modelo", values: ["Redmi Note 14 Pro", "POCO X7 Pro"] }], () => ({})),
  }),
  product({
    slug: "pelicula-3d-iphone",
    name: "Película 3D de Vidro para iPhone",
    brand: "omega",
    categoryIds: cat("peliculas", "acessorios"),
    tags: ["pelicula", "vidro", "3d", "iphone", "protetor de tela", "acessorio-celular"],
    shortDescription: "Cobertura total da tela, aplicação na loja sem custo.",
    price: 49,
    optionGroups: [{ name: "Modelo", values: ["iPhone 13", "iPhone 15", "iPhone 16 Pro"] }],
    variants: combine("pelicula-3d", [{ name: "Modelo", values: ["iPhone 13", "iPhone 15", "iPhone 16 Pro"] }], () => ({}), () => 20),
  }),
  product({
    slug: "pelicula-privacidade",
    name: "Película de Privacidade",
    brand: "omega",
    categoryIds: cat("peliculas", "acessorios"),
    tags: ["pelicula", "privacidade", "protetor de tela", "acessorio-celular"],
    shortDescription: "Ninguém do lado consegue ver sua tela.",
    price: 69,
    promoPrice: 55,
    stock: 30,
    optionGroups: [{ name: "Modelo", values: ["iPhone 15", "Redmi Note 14 Pro", "POCO X7 Pro"] }],
    variants: combine("pelicula-priv", [{ name: "Modelo", values: ["iPhone 15", "Redmi Note 14 Pro", "POCO X7 Pro"] }], () => ({}), () => 10),
  }),
  product({
    slug: "carregador-20w-usb-c",
    name: "Carregador Turbo 20 W USB-C",
    brand: "baseus",
    categoryIds: cat("acessorios"),
    tags: ["carregador", "fonte", "usb-c", "turbo", "iphone", "acessorio-celular"],
    shortDescription: "Carregamento rápido para iPhone e Android.",
    price: 129,
    promoPrice: 99,
    stock: 25,
  }),
  product({
    slug: "cabo-usb-c-lightning",
    name: "Cabo USB-C para Lightning 1 m",
    brand: "baseus",
    categoryIds: cat("acessorios"),
    tags: ["cabo", "lightning", "usb-c", "iphone", "acessorio-celular"],
    price: 59,
    stock: 30,
  }),

  /* --------------------------------- Roupas -------------------------------- */
  product({
    slug: "camiseta-oversized-omega",
    name: "Camiseta Oversized Omega Kanji",
    brand: "omega",
    categoryIds: cat("roupas"),
    tags: ["camiseta", "oversized", "anime", "streetwear", "roupa"],
    shortDescription: "Algodão 100% fio 30.1, estampa frente e costas.",
    price: 119,
    promoPrice: 89,
    optionGroups: [
      { name: "Tamanho", values: ["P", "M", "G", "GG"] },
      { name: "Cor", values: ["Preto", "Off-white"] },
    ],
    variants: combine(
      "camiseta-omega",
      [
        { name: "Tamanho", values: ["P", "M", "G", "GG"] },
        { name: "Cor", values: ["Preto", "Off-white"] },
      ],
      () => ({}),
      (o) => (o["Tamanho"] === "GG" && o["Cor"] === "Off-white" ? 0 : 6),
    ),
    specList: [["Tecido", "100% algodão, fio 30.1"], ["Modelagem", "Oversized"]],
    isNew: true,
    createdAt: daysAgo(3),
  }),
  product({
    slug: "moletom-anime-ronin",
    name: "Moletom Canguru Ronin",
    brand: "omega",
    categoryIds: cat("roupas"),
    tags: ["moletom", "blusa", "anime", "streetwear", "roupa"],
    shortDescription: "Moletom flanelado com capuz e estampa exclusiva.",
    price: 229,
    optionGroups: [{ name: "Tamanho", values: ["P", "M", "G", "GG"] }],
    variants: combine("moletom-ronin", [{ name: "Tamanho", values: ["P", "M", "G", "GG"] }], () => ({})),
  }),

  /* ------------------------------- Variedades ------------------------------- */
  product({
    slug: "redmi-watch-5-active",
    name: "Smartwatch Redmi Watch 5 Active",
    brand: "xiaomi",
    categoryIds: cat("variedades", "xiaomi"),
    tags: ["smartwatch", "relogio", "xiaomi", "fitness"],
    price: 349,
    promoPrice: 279,
    stock: 9,
  }),
  product({
    slug: "luminaria-led-rgb",
    name: "Luminária LED RGB para setup",
    brand: "omega",
    categoryIds: cat("variedades", "computadores-gamer"),
    tags: ["led", "rgb", "luminaria", "decoracao", "setup-gamer"],
    shortDescription: "Barra de LED com controle por app e sincronização com música.",
    price: 89,
    stock: 12,
    // Sem imagens de propósito: valida o estado "produto sem imagem"
    images: [],
  }),
];

/** Produtos cuja galeria acompanha a cor/versão escolhida */
const IMAGE_GROUPS: Record<string, string> = {
  "iphone-15": "Cor",
  "iphone-16-pro": "Cor",
  "iphone-13-128gb": "Cor",
  "redmi-note-14-pro": "Cor",
  "ipad-10-geracao": "Cor",
  "controle-dualsense": "Cor",
  "fone-jbl-wave-buds": "Cor",
  "caixa-jbl-go-4": "Cor",
  "capa-silicone-iphone": "Cor",
  "camiseta-oversized-omega": "Cor",
};

export const demoProducts: Product[] = baseProducts.map((p) => (IMAGE_GROUPS[p.slug] ? linkImages(p, IMAGE_GROUPS[p.slug]) : p));
