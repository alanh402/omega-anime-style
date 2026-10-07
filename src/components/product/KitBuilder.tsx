"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, PackagePlus } from "lucide-react";
import type { ProductView } from "@/lib/types";
import { formatBRL, getPriceInfo } from "@/lib/pricing";
import { findVariant, initialSelection, variantLabel } from "@/lib/variants";
import { toCartItem } from "@/lib/order";
import { normalize } from "@/lib/search";
import { useOrder } from "@/store/order-store";
import { ProductImage } from "@/components/ui/ProductImage";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

/**
 * "Monte seu kit": sugere acessórios que combinam com o produto principal
 * e adiciona tudo ao pedido com um toque — aumenta o ticket médio.
 */
export function KitBuilder({ main, items }: { main: ProductView; items: ProductView[] }) {
  const { add, notify } = useOrder();
  // Variação escolhida para cada item com opções (padrão: primeira disponível)
  // Ex.: no iPhone 15, a película já vem como "iPhone 15" (opção cujo valor aparece no nome do produto principal)
  const [variantOf, setVariantOf] = useState<Record<string, string>>(() => {
    const mainName = normalize(main.name);
    return Object.fromEntries(
      items
        .filter((p) => p.variants.length)
        .map((p) => {
          const matching = p.variants
            .filter((v) => v.stock > 0 && Object.values(v.options).some((val) => mainName.includes(normalize(val))))
            .sort((a, b) => Math.max(...Object.values(b.options).map((x) => x.length)) - Math.max(...Object.values(a.options).map((x) => x.length)));
          return [p.id, matching[0]?.id ?? findVariant(p, initialSelection(p))?.id ?? p.variants[0].id];
        }),
    );
  });
  const [selected, setSelected] = useState<Set<string>>(() => new Set(items.slice(0, 3).map((p) => p.id)));

  const lines = useMemo(
    () =>
      items.map((p) => {
        const variant = p.variants.find((v) => v.id === variantOf[p.id]);
        return { product: p, variant, price: getPriceInfo(p, variant) };
      }),
    [items, variantOf],
  );
  const total = lines.filter((l) => selected.has(l.product.id)).reduce((s, l) => s + l.price.current, 0);
  const count = selected.size;

  if (!items.length) return null;

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <section className="mt-12 rounded-[var(--radius-card)] border border-line bg-surface p-4 sm:p-6" aria-labelledby="kit-title">
      <div className="mb-4 flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold/12 text-gold">
          <PackagePlus className="h-5 w-5" />
        </span>
        <div>
          <h2 id="kit-title" className="font-display text-lg font-bold">Monte seu kit</h2>
          <p className="text-sm text-muted">Combina com {main.name}. Marque o que quiser e adicione tudo de uma vez.</p>
        </div>
      </div>

      <ul className="space-y-2">
        {lines.map(({ product: p, price }) => {
          const on = selected.has(p.id);
          return (
            <li key={p.id} className={cn("flex items-center gap-3 rounded-2xl border p-2.5 transition", on ? "border-gold/50 bg-gold/5" : "border-line bg-surface-2")}>
              <button
                type="button"
                role="checkbox"
                aria-checked={on}
                aria-label={`Incluir ${p.name}`}
                onClick={() => toggle(p.id)}
                className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-lg border transition", on ? "border-gold bg-gold text-gold-ink" : "border-line-strong")}
              >
                {on && <Check className="h-4 w-4" strokeWidth={3} />}
              </button>
              <Link href={`/produto/${p.slug}`} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-3">
                <ProductImage src={p.images[0]?.url} alt={p.name} sizes="56px" />
              </Link>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold leading-tight">{p.name}</p>
                {p.variants.length > 0 && (
                  <select
                    value={variantOf[p.id]}
                    onChange={(e) => setVariantOf((m) => ({ ...m, [p.id]: e.target.value }))}
                    className="mt-1 h-8 max-w-full rounded-lg border border-line bg-surface-3 px-2 text-xs outline-none focus:border-gold/60"
                    aria-label={`Opção de ${p.name}`}
                  >
                    {p.variants.map((v) => (
                      <option key={v.id} value={v.id} disabled={v.stock <= 0}>
                        {variantLabel(v, p)}
                        {v.stock <= 0 ? " (esgotado)" : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="shrink-0 text-right">
                {price.original && <p className="tabular text-[11px] text-subtle line-through">{formatBRL(price.original)}</p>}
                <p className="tabular text-sm font-bold">{formatBRL(price.current)}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          {count > 0 ? (
            <>
              {count} {count === 1 ? "item" : "itens"} · <strong className="tabular text-text">+ {formatBRL(total)}</strong>
            </>
          ) : (
            "Nenhum item marcado"
          )}
        </p>
        <Button
          variant="secondary"
          disabled={count === 0}
          onClick={() => {
            lines
              .filter((l) => selected.has(l.product.id))
              .forEach((l) => add(toCartItem(l.product, l.variant), 1, { silent: true }));
            notify({ title: `${count} ${count === 1 ? "item adicionado" : "itens adicionados"} ao pedido`, description: "Kit montado com sucesso", action: { label: "Ver pedido", href: "/pedido" } });
          }}
        >
          <PackagePlus className="h-4 w-4" /> Adicionar {count > 1 ? "itens do kit" : "ao pedido"}
        </Button>
      </div>
    </section>
  );
}
