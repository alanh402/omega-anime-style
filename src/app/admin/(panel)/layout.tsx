import { redirect } from "next/navigation";
import { isSupabaseEnabled } from "@/config/site";
import { getAdminSession } from "@/data/supabase/server-client";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSetup } from "@/components/admin/AdminSetup";
import { signOut } from "../actions";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // Sem Supabase: mostra como conectar e um resumo do catálogo de demonstração
  if (!isSupabaseEnabled) {
    return (
      <AdminShell>
        <AdminSetup />
      </AdminShell>
    );
  }
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) redirect("/admin/login");
  return (
    <AdminShell email={user.email} signOut={signOut}>
      {children}
    </AdminShell>
  );
}
