import Link from "next/link";
import type { Category } from "@/lib/types";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { SectionHeader } from "./SectionHeader";

export function CategoryGrid({ categories, counts }: { categories: Category[]; counts: Map<string, number> }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-10 lg:px-6">
      <SectionHeader index="01" title="Categorias" href="/catalogo" linkLabel="Catálogo" />
      <div className="scrollbar-none -mx-4 grid auto-cols-[88px] grid-flow-col grid-rows-2 gap-2.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-5 sm:grid-rows-none sm:px-0 lg:grid-cols-7">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/categoria/${c.slug}`}
            className="group flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface px-2 py-3.5 text-center transition hover:-translate-y-0.5 hover:border-gold/50"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-surface-2 text-gold transition group-hover:bg-gold group-hover:text-gold-ink">
              <CategoryIcon name={c.icon} className="h-5 w-5" />
            </span>
            <span className="line-clamp-2 text-xs font-semibold leading-tight">{c.name}</span>
            <span className="text-[10px] text-subtle">{counts.get(c.id) ?? 0} itens</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
