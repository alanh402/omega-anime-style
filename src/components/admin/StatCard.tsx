import { cn } from "@/lib/cn";

export function StatCard({ label, value, hint, accent }: { label: string; value: number | string; hint?: string; accent?: "gold" | "whatsapp" }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className={cn("tabular mt-2 font-display text-2xl font-bold", accent === "gold" && "text-gold-bright", accent === "whatsapp" && "text-whatsapp")}>
        {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
      </p>
      {hint && <p className="mt-1 text-[11px] text-subtle">{hint}</p>}
    </div>
  );
}
