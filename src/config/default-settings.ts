import type { StoreSettings } from "@/lib/types";

/**
 * Configuração padrão da loja.
 * Com Supabase conectado, estes valores são sobrescritos pela tabela `settings`
 * (editável em /admin/configuracoes). O WhatsApp pode ser definido também por
 * NEXT_PUBLIC_WHATSAPP_NUMBER no ambiente.
 */
export const defaultSettings: StoreSettings = {
  storeName: "Omega Anime Style",
  tagline: "Tecnologia, games e estilo",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5599985531987",
  // Preencha com os dados reais (ou pelo /admin). Campos vazios ficam ocultos no site.
  instagram: undefined, // ex.: "omegaanimestyle" (sem @)
  address: undefined,
  openingHours: undefined, // ex.: "Seg a Sáb, 9h às 19h"
  logoUrl: "/brand/logo-full.webp",
  hero: {
    eyebrow: "Smartphones · Games · Acessórios · Roupas",
    title: "Escolha aqui.\nFeche no WhatsApp.",
    subtitle:
      "Monte seu pedido em segundos e envie direto para um vendedor da Omega. Preço, disponibilidade e pagamento confirmados na conversa.",
    primaryCta: "Explorar produtos",
    secondaryCta: "Falar com a Omega",
  },
  orderMessage: {
    greeting: "Olá! Vim pelo catálogo da {loja} e gostaria de fazer um pedido.",
    closing: "Gostaria de confirmar disponibilidade e condições de pagamento.",
  },
  shareMessage: "Olha esse produto que encontrei na Omega Anime Style 👇",
  collections: [
    {
      slug: "setup-gamer",
      title: "Setup Gamer",
      subtitle: "Console, PC e periféricos para jogar sério.",
      tag: "setup-gamer",
      image: "/demo/collections/setup-gamer.svg",
    },
    {
      slug: "ecossistema-apple",
      title: "Ecossistema Apple",
      subtitle: "iPhone, iPad e AirPods que conversam entre si.",
      tag: "apple",
      image: "/demo/collections/ecossistema-apple.svg",
      href: "/categoria/apple",
    },
    {
      slug: "universo-xiaomi",
      title: "Universo Xiaomi",
      subtitle: "Muito desempenho pelo preço certo.",
      tag: "xiaomi",
      image: "/demo/collections/universo-xiaomi.svg",
      href: "/categoria/xiaomi",
    },
    {
      slug: "acessorios-smartphone",
      title: "Acessórios para seu smartphone",
      subtitle: "Capa, película e carregador: proteja desde o 1º dia.",
      tag: "acessorio-celular",
      image: "/demo/collections/acessorios-smartphone.svg",
    },
  ],
};
