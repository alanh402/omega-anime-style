"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

interface Props {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  label?: string;
}

export function QuantityStepper({ value, onChange, min = 1, max = 20, size = "md", label = "Quantidade" }: Props) {
  const h = size === "sm" ? "h-9" : "h-11";
  const w = size === "sm" ? "w-9" : "w-11";
  return (
    <div className={cn("inline-flex items-center rounded-[var(--radius-control)] border border-line bg-surface-2", h)} role="group" aria-label={label}>
      <button
        type="button"
        className={cn("grid h-full place-items-center text-muted transition hover:text-text disabled:opacity-30", w)}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Diminuir quantidade"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="tabular min-w-7 text-center text-sm font-bold" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={cn("grid h-full place-items-center text-muted transition hover:text-text disabled:opacity-30", w)}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Aumentar quantidade"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
