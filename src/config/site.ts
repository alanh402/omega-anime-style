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

/** Limpa valores colados com espaços, aspas ou sem https:// (erro comum no painel da Vercel) */
function cleanEnv(v: string | undefined): string {
  return (v ?? "").trim().replace(/^["']|["']$/g, "").trim();
}
function cleanUrl(v: string | undefined): string {
  let u = cleanEnv(v).replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
  if (u && !/^https?:\/\//.test(u)) u = `https://${u}`;
  return u;
}

export const supabaseConfig = {
  url: cleanUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
  // Aceita o nome novo (publishable) e o antigo (anon) — são equivalentes
  anonKey: cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
};

/** Sem Supabase configurado, o catálogo roda com os dados de demonstração */
export const isSupabaseEnabled = Boolean(supabaseConfig.url && supabaseConfig.anonKey);

/** Tempo (s) de cache das páginas públicas. Salvar no admin invalida na hora. */
export const CATALOG_REVALIDATE_SECONDS = 60;
