import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "whatsapp" | "secondary" | "outline" | "ghost" | "danger" | "destructive";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const base =
  "relative inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap select-none transition-[transform,background-color,border-color,color,box-shadow] duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-gold-metal text-gold-ink shadow-[var(--shadow-gold)] hover:brightness-110",
  whatsapp: "bg-whatsapp text-[#04260f] hover:bg-[#2fe174] shadow-[0_10px_28px_-14px_rgb(37_211_102/0.8)]",
  secondary: "bg-surface-3 text-text hover:bg-line-strong",
  outline: "border border-line-strong text-text hover:border-gold/70 hover:text-gold-bright bg-transparent",
  ghost: "text-muted hover:text-text hover:bg-surface-2",
  danger: "text-danger hover:bg-danger/10",
  destructive: "bg-danger text-white hover:brightness-110",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-[13px] rounded-[10px]",
  md: "h-11 px-5 text-sm rounded-[var(--radius-control)]",
  lg: "h-13 px-6 text-[15px] rounded-[var(--radius-control)]",
  icon: "h-11 w-11 rounded-[var(--radius-control)]",
};

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
  children: ReactNode;
}

export function buttonClasses({ variant = "primary", size = "md", block, className }: Omit<CommonProps, "children">) {
  return cn(base, variants[variant], sizes[size], block && "w-full", className);
}

export function Button({
  variant,
  size,
  block,
  className,
  children,
  type = "button",
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={buttonClasses({ variant, size, block, className })} {...rest}>
      {children}
    </button>
  );
}

/** Link com aparência de botão. Links externos (WhatsApp) abrem em nova aba. */
export function ButtonLink({
  href,
  variant,
  size,
  block,
  className,
  children,
  external,
  ...rest
}: CommonProps & { href: string; external?: boolean } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const cls = buttonClasses({ variant, size, block, className });
  if (external || /^https?:/.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}
