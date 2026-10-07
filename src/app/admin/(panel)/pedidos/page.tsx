import { isSupabaseEnabled } from "@/config/site";
import { getAdminSession } from "@/data/supabase/server-client";
import { loadLeads } from "@/data/admin";
import { AdminTitle } from "@/components/admin/AdminShell";
import { LeadsList } from "@/components/admin/LeadsList";

export const metadata = { title: "Pedidos / Leads" };

export default async function AdminLeadsPage() {
  if (!isSupabaseEnabled) return null;
  const { supabase } = await getAdminSession();
  const leads = await loadLeads(supabase);
  return (
    <div className="max-w-4xl">
      <AdminTitle
        title="Pedidos / Leads"
        description="Pedidos enviados ao WhatsApp pelo catálogo. A conversa e a venda continuam no WhatsApp; aqui você acompanha o resultado."
      />
      <LeadsList leads={leads} />
    </div>
  );
}
