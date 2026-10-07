import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/pedido", "/vendedor"] },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
