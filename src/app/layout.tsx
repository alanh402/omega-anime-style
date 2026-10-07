import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "@fontsource-variable/unbounded";
import "./globals.css";
import { getSiteUrl } from "@/config/site";
import { defaultSettings } from "@/config/default-settings";

const description =
  "Smartphones, iPhone, Xiaomi, PS5, PC gamer, acessórios e roupas. Monte seu pedido e finalize pelo WhatsApp com a Omega Anime Style.";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${defaultSettings.storeName} — Tecnologia, games e estilo`,
    template: `%s | ${defaultSettings.storeName}`,
  },
  description,
  applicationName: defaultSettings.storeName,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: defaultSettings.storeName,
    description,
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
