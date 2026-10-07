import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "offer" | "new" | "featured" | "neutral" | "success" | "warning" | "danger";

const tones: Record<BadgeTone, string> = {
  offer: "bg-gold-metal text-gold-ink",
  new: "bg-text text-bg",
  featured: "bg-surface-3 text-gold-bright ring-1 ring-gold/40",
  neutral: "bg-surface-3 text-muted",
  success: "bg-success/12 text-success",
  warning: "bg-warning/12 text-warning",
  danger: "bg-danger/12 text-danger",
};

export function Badge({ tone = "neutral", children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "cut-corner-sm inline-flex h-6 items-center gap-1 px-2 text-[11px] font-bold uppercase tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
