import { Database, KeyRound, ShieldCheck, Upload } from "lucide-react";
import { getCatalog } from "@/data/catalog";
import { getTotalStock, isOnSale } from "@/lib/pricing";
import { AdminTitle } from "./AdminShell";
import { StatCard } from "./StatCard";

const steps = [
  { icon: Database, title: "Crie um projeto no Supabase", text: "supabase.com → New project (plano gratuito atende o início)." },
  { icon: Upload, title: "Rode os arquivos de supabase/migrations", text: "No SQL Editor: 0001_catalog_schema.sql, depois 0002_admin_functions.sql e, se quiser, supabase/seed.sql." },
  { icon: KeyRound, title: "Configure as variáveis de ambiente", text: "NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY (Project Settings → API). Nunca use a service_role no site." },
  { icon: ShieldCheck, title: "Crie o primeiro administrador", text: "Authentication → Add user, e depois: insert into admins (user_id) values ('<id do usuário>');" },
];

/** Painel em modo demonstração: explica como ativar a edição real */
export async function AdminSetup() {
  const { products } = await getCatalog();
  return (
    <div className="max-w-4xl">
      <AdminTitle title="Painel administrativo" description="O catálogo está usando dados de demonstração. Conecte o Supabase para cadastrar os produtos reais." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Produtos (demo)" value={products.length} />
        <StatCard label="Em oferta" value={products.filter(isOnSale).length} />
        <StatCard label="Destaques" value={products.filter((p) => p.isFeatured).length} />
        <StatCard label="Esgotados" value={products.filter((p) => getTotalStock(p) <= 0).length} />
      </div>
      <h2 className="mb-3 mt-8 font-display text-sm font-semibold">Ativar o painel em 4 passos</h2>
      <ol className="space-y-3">
        {steps.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="flex gap-4 rounded-2xl border border-line bg-surface p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-gold">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">
                <span className="text-gold">{i + 1}.</span> {title}
              </p>
              <p className="mt-0.5 text-sm text-muted">{text}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-sm text-muted">O passo a passo completo está no arquivo README.md do projeto.</p>
    </div>
  );
}
