"use client";

import type { Product } from "@/lib/types";
import { optionState, selectOption, type Selection } from "@/lib/variants";
import { cn } from "@/lib/cn";

/** Seletor de variações (cor, armazenamento, tamanho…). Opções esgotadas ficam riscadas. */
export function VariantSelector({
  product,
  selection,
  onChange,
}: {
  product: Pick<Product, "optionGroups" | "variants">;
  selection: Selection;
  onChange: (s: Selection) => void;
}) {
  const p = product as Product;
  return (
    <div className="space-y-5">
      {product.optionGroups.map((group) => (
        <fieldset key={group.name}>
          <legend className="mb-2.5 text-sm">
            <span className="text-muted">{group.name}: </span>
            <span className="font-semibold">{selection[group.name] ?? "selecione"}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {group.values.map((value) => {
              const state = optionState(p, selection, group.name, value);
              const selected = selection[group.name] === value;
              return (
                <button
                  key={value}
                  type="button"
                  disabled={state === "missing"}
                  aria-pressed={selected}
                  onClick={() => onChange(selectOption(p, selection, group.name, value))}
                  className={cn(
                    "relative h-11 min-w-12 rounded-[12px] border px-4 text-sm font-semibold transition",
                    selected
                      ? "border-gold bg-gold/12 text-gold-bright shadow-[0_0_0_1px_var(--color-gold)_inset]"
                      : "border-line bg-surface-2 text-text hover:border-line-strong",
                    state === "out" && !selected && "text-subtle line-through decoration-1",
                    state === "missing" && "opacity-30",
                  )}
                >
                  {value}
                  {state === "out" && selected && <span className="ml-1.5 text-[11px] font-medium text-danger">(esgotado)</span>}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
