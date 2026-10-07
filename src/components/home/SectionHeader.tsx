import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeader({
  index,
  title,
  subtitle,
  href,
  linkLabel = "Ver todos",
}: {
  index?: string;
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {index && <p className="mb-1.5 font-display text-[11px] font-semibold tracking-[0.2em] text-gold">{index}</p>}
        <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="flex h-10 shrink-0 items-center gap-1 text-sm font-semibold text-gold-bright hover:text-gold">
          {linkLabel} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
