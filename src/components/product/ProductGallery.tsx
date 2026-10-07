"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { ProductImage as Img } from "@/lib/types";
import { ProductImage } from "@/components/ui/ProductImage";
import { cn } from "@/lib/cn";
import { useProductDetail } from "./ProductDetailContext";

/** Galeria: deslize no celular (scroll-snap), miniaturas no desktop. */
export function ProductGallery({ images, name, badges }: { images: Img[]; name: string; badges?: React.ReactNode }) {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const { activeImage } = useProductDetail();

  const goTo = (i: number) => {
    setIndex(i);
    const el = trackRef.current;
    if (el) el.scrollTo({ left: el.clientWidth * i, behavior: "smooth" });
  };

  // Variação escolhida com foto própria → leva a galeria até ela
  useEffect(() => {
    if (!activeImage) return;
    const i = images.findIndex((img) => img.url === activeImage);
    if (i >= 0) goTo(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeImage]);

  if (images.length <= 1) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface-2">
        <ProductImage src={images[0]?.url} alt={images[0]?.alt ?? name} sizes="(max-width: 1024px) 100vw, 50vw" priority />
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">{badges}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse">
      <div className="relative flex-1">
        <div
          ref={trackRef}
          onScroll={(e) => {
            const el = e.currentTarget;
            const i = Math.round(el.scrollLeft / el.clientWidth);
            if (i !== index) setIndex(i);
          }}
          className="scrollbar-none flex aspect-square snap-x snap-mandatory overflow-x-auto rounded-[var(--radius-card)] border border-line bg-surface-2"
          aria-roledescription="carrossel"
          aria-label={`Fotos de ${name}`}
        >
          {images.map((img, i) => (
            <div key={img.url} className="relative h-full w-full shrink-0 snap-center" aria-label={`Foto ${i + 1} de ${images.length}`}>
              <ProductImage src={img.url} alt={img.alt ?? name} sizes="(max-width: 1024px) 100vw, 50vw" priority={i === 0} />
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">{badges}</div>
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-bg/70 px-2.5 py-1.5 backdrop-blur lg:hidden">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={cn("h-1.5 rounded-full transition-all", i === index ? "w-5 bg-gold" : "w-1.5 bg-text/40")}
              aria-label={`Ver foto ${i + 1}`}
            />
          ))}
        </div>
      </div>
      <div className="scrollbar-none hidden gap-2 lg:flex lg:w-20 lg:flex-col">
        {images.map((img, i) => (
          <button
            key={img.url}
            type="button"
            onClick={() => goTo(i)}
            className={cn(
              "relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl border bg-surface-2 transition",
              i === index ? "border-gold" : "border-line opacity-70 hover:opacity-100",
            )}
            aria-label={`Ver foto ${i + 1}`}
          >
            <Image src={img.url} alt="" fill sizes="80px" unoptimized={img.url.endsWith(".svg")} className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
