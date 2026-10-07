import Link from "next/link";
import { isSupabaseEnabled } from "@/config/site";
import { getAdminSession } from "@/data/supabase/server-client";
import { loadAdminCatalog, loadDashboard } from "@/data/admin";
import { AdminTitle } from "@/components/admin/AdminShell";
import { StatCard } from "@/components/admin/StatCard";
import { Card } from "@/components/admin/fields";
import { ButtonLink } from "@/components/ui/Button";

export const metadata = { title: "Dashboard" };

function Ranking({ rows, empty }: { rows: Array<{ label: string; href?: string; value: number }>; empty: string }) {
  if (!rows.length) return <p className="text-sm text-subtle">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.value));
  return (
    <ol className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.label} className="text-sm">
          <div className="flex justify-between gap-3">
            {r.href ? (
              <Link href={r.href} className="truncate hover:text-gold-bright">
                {r.label}
              </Link>
            ) : (
              <span className="truncate">{r.label}</span>
            )}
            <span className="tabular shrink-0 font-semibold">{r.value}</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-surface-3">
            <div className="h-full rounded-full bg-gold" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ol>
  );
}

export default async function DashboardPage() {
  if (!isSupabaseEnabled) return null;
  const { supabase } = await getAdminSession();
  const { products } = await loadAdminCatalog(supabase);
  const d = await loadDashboard(supabase, products);
  const conv = d.last30.views ? ((d.last30.whatsapp + d.last30.orders) / d.last30.views) * 100 : 0;
  const toRows = (list: typeof d.topViewed) => list.map((x) => ({ label: x.product.name, href: `/admin/produtos/${x.product.id}`, value: x.value }));
  const noData = "Ainda sem dados nos últimos 30 dias.";

  return (
    <div className="max-w-6xl">
      <AdminTitle title="Dashboard" description="Interesse dos clientes nos últimos 30 dias." actions={<ButtonLink href="/admin/produtos/novo">Novo produto</ButtonLink>} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Produtos cadastrados" value={d.totals.products} hint={`${d.totals.active} ativos`} />
        <StatCard label="Em promoção" value={d.totals.onSale} accent="gold" />
        <StatCard label="Esgotados (ativos)" value={d.totals.outOfStock} />
        <StatCard label="Pedidos enviados" value={d.last30.orders} hint={`${d.last30.leads} leads registrados`} accent="whatsapp" />
        <StatCard label="Visualizações de produto" value={d.last30.views} />
        <StatCard label="Cliques no WhatsApp" value={d.last30.whatsapp} accent="whatsapp" />
        <StatCard label="Adições ao pedido" value={d.last30.adds} />
        <StatCard label="Conversão para WhatsApp" value={`${conv.toFixed(1)}%`} hint={`${d.last30.shares} compartilhamentos`} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card title="Mais visualizados">
          <Ranking rows={toRows(d.topViewed)} empty={noData} />
        </Card>
        <Card title="Mais adicionados ao pedido">
          <Ranking rows={toRows(d.topAdded)} empty={noData} />
        </Card>
        <Card title="Mais cliques no WhatsApp">
          <Ranking rows={toRows(d.topWhatsapp)} empty={noData} />
        </Card>
        <Card title="Buscas mais feitas" description="O que os clientes procuram — inclusive o que você ainda não tem.">
          <Ranking rows={d.topSearches.map((s) => ({ label: s.term, value: s.value }))} empty={noData} />
        </Card>
        <Card title="Categorias mais acessadas">
          <Ranking rows={d.topCategories.map((c) => ({ label: c.slug, href: `/categoria/${c.slug}`, value: c.value }))} empty={noData} />
        </Card>
      </div>
    </div>
  );
}
