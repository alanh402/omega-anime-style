import type { MetadataRoute } from "next";
import { getCatalog, getSettings } from "@/data/catalog";
import { getSiteUrl } from "@/config/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const [{ products, categories }, settings] = await Promise.all([getCatalog(), getSettings()]);
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/catalogo`, changeFrequency: "daily", priority: 0.9 },
    ...categories.map((c) => ({ url: `${base}/categoria/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...settings.collections.filter((c) => !c.href).map((c) => ({ url: `${base}/colecao/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...products.map((p) => ({ url: `${base}/produto/${p.slug}`, lastModified: p.createdAt, changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
