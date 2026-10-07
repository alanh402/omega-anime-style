"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseConfig } from "@/config/site";

/** Cliente do navegador para login e upload de imagens no /admin */
export function getBrowserSupabase() {
  return createBrowserClient(supabaseConfig.url, supabaseConfig.anonKey);
}
