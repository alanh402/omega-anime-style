import type { NextConfig } from "next";

const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : undefined;
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // Fotos enviadas pelo admin ficam no Storage do Supabase
    remotePatterns: supabaseHost ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }] : [],
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
  // Fontes/logos e ilustrações usadas nas imagens de prévia (Open Graph)
  outputFileTracingIncludes: {
    "/**": ["./assets/og/**"],
    "/produto/[slug]/opengraph-image": ["./public/demo/products/**"],
  },
  async headers() {
    return [
      {
        source: "/:dir(brand|demo)/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
