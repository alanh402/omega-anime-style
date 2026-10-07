import { getStockStatus } from "@/lib/pricing";
import { cn } from "@/lib/cn";

const labels = {
  available: "Em estoque",
  low: "Últimas unidades",
  out: "Esgotado",
} as const;

const colors = {
  available: "text-success",
  low: "text-warning",
  out: "text-danger",
} as const;

export function StockStatus({ stock, className }: { stock: number; className?: string }) {
  const status = getStockStatus(stock);
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold", colors[status], className)}>
      <span className="relative flex h-2 w-2">
        {status !== "out" && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-40" />}
        <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
      </span>
      {labels[status]}
    </span>
  );
}
