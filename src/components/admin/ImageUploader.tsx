"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { uploadCatalogImage } from "@/lib/image-upload";
import { cn } from "@/lib/cn";

export interface EditableImage {
  url: string;
  alt?: string;
}

/** Envio e ordenação das fotos. A primeira é a capa (card e prévia do WhatsApp). */
export function ImageUploader({ images, onChange }: { images: EditableImage[]; onChange: (imgs: EditableImage[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    const list = [...files].slice(0, 10);
    setBusy(list.length);
    const added: EditableImage[] = [];
    for (const f of list) {
      try {
        added.push({ url: await uploadCatalogImage(f) });
      } catch (e) {
        setError((e as Error).message);
      }
      setBusy((b) => b - 1);
    }
    onChange([...images, ...added]);
  };

  const move = (i: number, d: -1 | 1) => {
    const next = images.slice();
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img, i) => (
          <div key={img.url} className="overflow-hidden rounded-2xl border border-line bg-surface-2">
            <div className="relative aspect-square">
              <Image src={img.url} alt={img.alt ?? ""} fill sizes="200px" unoptimized={img.url.endsWith(".svg")} className="object-cover" />
              {i === 0 && <span className="absolute left-2 top-2 rounded-md bg-gold px-2 py-0.5 text-[10px] font-bold uppercase text-gold-ink">Capa</span>}
            </div>
            <div className="flex items-center justify-between p-1.5">
              <div className="flex">
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:text-text disabled:opacity-30" aria-label="Mover para antes">
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button type="button" disabled={i === images.length - 1} onClick={() => move(i, 1)} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:text-text disabled:opacity-30" aria-label="Mover para depois">
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
              <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:text-danger" aria-label="Remover imagem">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy > 0}
          className={cn("grid aspect-square place-items-center rounded-2xl border border-dashed border-line-strong text-sm text-muted transition hover:border-gold/60 hover:text-gold-bright")}
        >
          <span className="flex flex-col items-center gap-2">
            {busy > 0 ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
            {busy > 0 ? `Enviando ${busy}…` : "Adicionar fotos"}
          </span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        multiple
        hidden
        onChange={(e) => {
          void upload(e.target.files);
          e.target.value = "";
        }}
      />
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      <p className="mt-2 text-[11px] text-subtle">Fotos quadradas, fundo limpo. As imagens são reduzidas automaticamente antes do envio.</p>
    </div>
  );
}
