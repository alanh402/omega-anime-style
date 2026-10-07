import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseConfig } from "@/config/site";

/**
 * Cliente com a sessão do administrador (cookies). Usado só no /admin:
 * todas as escritas passam pelo RLS (public.is_admin()).
 */
export async function getServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Chamado de um Server Component: o middleware cuida da renovação
        }
      },
    },
  });
}

export async function getAdminSession() {
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, isAdmin: false };
  const { data } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  return { supabase, user, isAdmin: Boolean(data) };
}
