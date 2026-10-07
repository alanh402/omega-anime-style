"use client";

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const inputCls =
  "h-11 w-full rounded-[12px] border border-line bg-surface-2 px-3 text-[15px] outline-none transition placeholder:text-subtle focus:border-gold/60 disabled:opacity-50";

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-semibold text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-subtle">{hint}</span>}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputCls, props.className)} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(inputCls, "h-auto py-2.5 leading-relaxed", props.className)} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(inputCls, "cursor-pointer", props.className)} />;
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex min-h-11 items-center gap-3 text-sm">
      <span className={cn("relative h-6 w-11 shrink-0 rounded-full transition", checked ? "bg-gold" : "bg-surface-3")}>
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-text shadow transition-all", checked ? "left-[22px]" : "left-0.5")} />
      </span>
      <span className={checked ? "font-semibold" : "text-muted"}>{label}</span>
    </button>
  );
}

export function Card({ title, description, children, actions }: { title?: string; description?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="rounded-[var(--radius-card)] border border-line bg-surface p-4 sm:p-5">
      {(title || actions) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="font-display text-sm font-semibold">{title}</h2>}
            {description && <p className="mt-1 text-xs text-muted">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger" role="alert">{message}</p>;
}

/** "iPhone 15 Pro" → "iphone-15-pro" */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
