import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Navegação estrutural" className="scrollbar-none overflow-x-auto">
      <ol className="flex items-center gap-1 whitespace-nowrap text-xs text-subtle">
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
            {c.href ? (
              <Link href={c.href} className="hover:text-text">
                {c.label}
              </Link>
            ) : (
              <span className="text-muted" aria-current="page">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({ title, description, crumbs }: { title: string; description?: string; crumbs: Crumb[] }) {
  return (
    <div className="mb-5 pt-6 lg:mb-8">
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">{description}</p>}
    </div>
  );
}
