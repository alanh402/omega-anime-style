import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Collection } from "@/lib/types";
import { SectionHeader } from "./SectionHeader";

export function collectionHref(c: Collection) {
  return c.href ?? `/colecao/${c.slug}`;
}

/** Banners de coleções (editáveis em Configurações) */
export function CollectionBanners({ collections }: { collections: Collection[] }) {
  if (!collections.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 pt-12 lg:px-6">
      <SectionHeader index="03" title="Coleções" subtitle="Monte seu setup com o que combina." />
      <div className="grid gap-3 sm:grid-cols-2">
        {collections.map((c) => (
          <Link
            key={c.slug}
            href={collectionHref(c)}
            className="group relative flex min-h-[168px] overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface transition hover:border-gold/50 sm:min-h-[200px]"
          >
            {c.image && (
              <Image
                src={c.image}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                unoptimized={c.image.endsWith(".svg")}
                className="object-cover object-right transition duration-700 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-bg from-35% via-bg/80 via-55% to-bg/10" />
            <div className="relative flex max-w-[60%] flex-col justify-end p-5 sm:max-w-[55%]">
              <h3 className="font-display text-lg font-bold leading-tight sm:text-xl">{c.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{c.subtitle}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold-bright">
                Ver coleção <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
