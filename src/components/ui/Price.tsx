import { formatBRL, type PriceInfo } from "@/lib/pricing";
import { cn } from "@/lib/cn";

interface PriceProps {
  info: PriceInfo;
  size?: "sm" | "md" | "lg";
  prefix?: string;
  installments?: string;
  className?: string;
}

const sizes = {
  sm: { current: "text-lg", original: "text-xs" },
  md: { current: "text-2xl", original: "text-sm" },
  lg: { current: "text-[2rem] leading-none sm:text-4xl", original: "text-sm" },
};

export function Price({ info, size = "sm", prefix, installments, className }: PriceProps) {
  const s = sizes[size];
  return (
    <div className={cn("flex flex-col", className)}>
      {info.original != null && (
        <div className="flex items-center gap-2">
          <span className={cn("tabular whitespace-nowrap text-subtle line-through", s.original)}>{formatBRL(info.original)}</span>
          {info.discountPercent ? (
            <span className={cn("font-bold text-gold-bright", s.original)}>-{info.discountPercent}%</span>
          ) : null}
        </div>
      )}
      {prefix && <span className="text-[11px] leading-tight text-muted">{prefix}</span>}
      <span className={cn("tabular whitespace-nowrap font-extrabold tracking-tight text-text", s.current)}>{formatBRL(info.current)}</span>
      {installments && <span className="mt-0.5 text-xs text-muted">{installments}</span>}
    </div>
  );
}
