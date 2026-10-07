import Image from "next/image";
import { cn } from "@/lib/cn";

interface Props {
  src?: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}

/**
 * Imagem de produto com otimização automática (WebP/AVIF, lazy loading).
 * Sem imagem cadastrada, mostra um placeholder da marca — nunca um quadro quebrado.
 */
export function ProductImage({ src, alt, sizes, priority, className }: Props) {
  if (!src) {
    return (
      <div className={cn("absolute inset-0 grid place-items-center bg-surface-2", className)} role="img" aria-label={`${alt} — sem foto`}>
        <div className="flex flex-col items-center gap-2 text-subtle">
          <span className="font-display text-4xl text-gold/50">Ω</span>
          <span className="text-[11px] uppercase tracking-widest">Foto em breve</span>
        </div>
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      // SVGs de demonstração não passam pelo otimizador
      unoptimized={src.endsWith(".svg")}
      className={cn("object-cover", className)}
    />
  );
}
