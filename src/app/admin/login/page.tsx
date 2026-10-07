import Image from "next/image";
import { redirect } from "next/navigation";
import { isSupabaseEnabled } from "@/config/site";
import { getAdminSession } from "@/data/supabase/server-client";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Entrar" };

export default async function LoginPage() {
  if (!isSupabaseEnabled) redirect("/admin");
  const { user, isAdmin } = await getAdminSession();
  if (user && isAdmin) redirect("/admin");

  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm">
        <Image src="/brand/logo-full.webp" alt="Omega Anime Style" width={811} height={408} className="mx-auto h-auto w-40" priority />
        <div className="mt-8 rounded-[var(--radius-card)] border border-line bg-surface p-6">
          <h1 className="font-display text-lg font-bold">Painel administrativo</h1>
          <p className="mt-1 text-sm text-muted">Entre com o e-mail de administrador.</p>
          {user && !isAdmin && (
            <p className="mt-4 rounded-xl bg-warning/10 p-3 text-xs text-warning">
              {user.email} entrou, mas ainda não é administrador. Veja o README (“Criar o primeiro administrador”).
            </p>
          )}
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
