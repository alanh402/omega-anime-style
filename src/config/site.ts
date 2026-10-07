/**
 * Configuração de ambiente. Nenhum segredo fica aqui:
 * apenas variáveis públicas (NEXT_PUBLIC_*) e flags derivadas.
 */

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
};

/** Sem Supabase configurado, o catálogo roda com os dados de demonstração */
export const isSupabaseEnabled = Boolean(supabaseConfig.url && supabaseConfig.anonKey);

/** Tempo (s) de cache das páginas públicas. Salvar no admin invalida na hora. */
export const CATALOG_REVALIDATE_SECONDS = 60;
