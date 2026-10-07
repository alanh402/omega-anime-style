import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseConfig } from "@/config/site";

let client: SupabaseClient | null = null;

/**
 * Cliente anônimo (chave pública) para leituras do catálogo e inserção de
 * eventos/leads. Tudo é protegido por RLS — ver supabase/migrations.
 */
export function getPublicSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
