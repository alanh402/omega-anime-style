"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { StockStatus } from "@/components/ui/StockStatus";
import { VariantSelector } from "./VariantSelector";
import { useOrder } from "@/store/order-store";
import type { ProductView } from "@/lib/types";
import { findVariant, initialSelection, type Selection } from "@/lib/variants";
import { getPriceInfo } from "@/lib/pricing";
import { toCartItem } from "@/lib/order";

/** Escolha rápida de variação direto do card, sem sair da listagem */
export function QuickAddSheet({ product, open, onClose }: { product: ProductView; open: boolean; onClose: () => void }) {
  const { add } = useOrder();
  const [selection, setSelection] = useState<Selection>(() => initialSelection(product));
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (open) {
      setSelection(initialSelection(product));
      setQty(1);
    }
  }, [open, product]);

  const variant = findVariant(product, selection);
  const stock = variant?.stock ?? 0;
  const out = stock <= 0;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Escolha a opção"
      footer={
        <div className="flex items-center gap-3">
          <QuantityStepper value={qty} onChange={setQty} max={Math.max(1, Math.min(stock, 20))} />
          <Button
            block
            size="lg"
            disabled={out || !variant}
            onClick={() => {
              if (!variant) return;
              add(toCartItem(product, variant), qty);
              onClose();
            }}
          >
            <ShoppingBag className="h-5 w-5" /> {out ? "Indisponível" : "Adicionar ao pedido"}
          </Button>
        </div>
      }
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-semibold leading-snug">{product.name}</p>
          <Link href={`/produto/${product.slug}`} onClick={onClose} className="text-xs text-gold-bright underline-offset-4 hover:underline">
            Ver detalhes do produto
          </Link>
        </div>
        <div className="shrink-0 text-right">
          <Price info={getPriceInfo(product, variant)} />
          <StockStatus stock={stock} className="mt-1" />
        </div>
      </div>
      <VariantSelector product={product} selection={selection} onChange={setSelection} />
    </Sheet>
  );
}
