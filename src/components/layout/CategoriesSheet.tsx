"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { useUI } from "@/store/ui-store";

export interface CategoryLink {
  slug: string;
  name: string;
  icon?: string;
  count: number;
}

export function CategoriesSheet({ categories }: { categories: CategoryLink[] }) {
  const { categoriesOpen, closeCategories } = useUI();
  return (
    <Sheet open={categoriesOpen} onClose={closeCategories} title="Categorias">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/categoria/${c.slug}`}
            onClick={closeCategories}
            className="group flex min-h-16 items-center gap-3 rounded-2xl border border-line bg-surface-2 p-3 transition hover:border-gold/50"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-3 text-gold transition group-hover:bg-gold/15">
              <CategoryIcon name={c.icon} className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{c.name}</span>
              <span className="text-xs text-subtle">{c.count} {c.count === 1 ? "produto" : "produtos"}</span>
            </span>
          </Link>
        ))}
      </div>
      <Link
        href="/catalogo"
        onClick={closeCategories}
        className="mt-4 flex h-12 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-line text-sm font-semibold text-gold-bright hover:border-gold/60"
      >
        Ver catálogo completo <ArrowRight className="h-4 w-4" />
      </Link>
    </Sheet>
  );
}
